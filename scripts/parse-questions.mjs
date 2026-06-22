import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outputPath = path.join(root, "src", "data", "questions.json");

const INPUT_FILES = [
  "cemap_question_bank.txt",
  "cemap_questions_201_300.txt",
  "cemap_case_studies.txt",
  "cemap_case_studies_2.txt",
];

const HEADER_PATTERN = /^\d+\.\s*\[(.+)\]$/;
const OPTION_PATTERN = /^([A-D])\.\s*(.+)$/;
const ANSWER_PATTERN = /^Answer:\s*([A-D])\s*$/i;
const EXPLANATION_PATTERN = /^Explanation:\s*(.+)$/i;
const CASE_STUDY_HEADER = /^CASE STUDY \d+:\s*(.+)$/i;

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseQuestionBlock(lines, startIndex) {
  let i = startIndex;
  const headerLine = lines[i].trim();
  const headerMatch = headerLine.match(/^(\d+)\.\s*\[(.+)\]$/);
  if (!headerMatch) return null;

  const id = Number.parseInt(headerMatch[1], 10);
  const category = headerMatch[2].trim();
  i++;

  const questionLines = [];
  while (i < lines.length) {
    const line = lines[i].trim();
    if (OPTION_PATTERN.test(line) || HEADER_PATTERN.test(line) || CASE_STUDY_HEADER.test(line)) {
      break;
    }
    if (line === "---") break;
    if (line) questionLines.push(line);
    i++;
  }

  const options = {};
  for (const letter of ["A", "B", "C", "D"]) {
    if (i >= lines.length) break;
    const optionMatch = lines[i].trim().match(OPTION_PATTERN);
    if (!optionMatch || optionMatch[1] !== letter) {
      console.warn(
        `[parse-questions] Question ${id}: expected option ${letter}, found "${lines[i]?.trim() ?? "EOF"}"`
      );
      break;
    }
    options[letter] = optionMatch[2].trim();
    i++;
  }

  let correctAnswer = null;
  let explanation = "";

  if (i < lines.length) {
    const answerMatch = lines[i].trim().match(ANSWER_PATTERN);
    if (answerMatch) {
      correctAnswer = answerMatch[1].toUpperCase();
      i++;
    } else {
      console.warn(`[parse-questions] Question ${id}: missing or invalid Answer line`);
    }
  }

  if (i < lines.length) {
    const explanationMatch = lines[i].trim().match(EXPLANATION_PATTERN);
    if (explanationMatch) {
      explanation = explanationMatch[1].trim();
      i++;
    } else {
      console.warn(`[parse-questions] Question ${id}: missing or invalid Explanation line`);
    }
  }

  const hasAllOptions = ["A", "B", "C", "D"].every(
    (letter) => typeof options[letter] === "string" && options[letter].length > 0
  );

  if (!hasAllOptions || !correctAnswer || !explanation || !questionLines.length) {
    console.warn(`[parse-questions] Question ${id}: incomplete block — skipped`);
    return { nextIndex: i };
  }

  return {
    nextIndex: i,
    question: {
      id,
      category,
      question: questionLines.join(" ").trim(),
      options,
      correctAnswer,
      explanation,
    },
  };
}

function parseQuestionBank(text) {
  const lines = text.split(/\r?\n/);
  const questions = [];
  let currentCaseStudy = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (line === "") {
      i++;
      continue;
    }

    const caseStudyMatch = line.match(CASE_STUDY_HEADER);
    if (caseStudyMatch) {
      const title = caseStudyMatch[1].trim();
      i++;
      const scenarioLines = [];
      while (i < lines.length) {
        const scenarioLine = lines[i].trim();
        if (
          scenarioLine === "---" ||
          HEADER_PATTERN.test(scenarioLine) ||
          CASE_STUDY_HEADER.test(scenarioLine)
        ) {
          break;
        }
        if (scenarioLine) scenarioLines.push(lines[i].trimEnd());
        i++;
      }
      currentCaseStudy = {
        id: slugify(title),
        title,
        scenario: scenarioLines.join("\n").trim(),
      };
      if (lines[i]?.trim() === "---") i++;
      continue;
    }

    if (HEADER_PATTERN.test(line)) {
      const result = parseQuestionBlock(lines, i);
      if (!result?.question) {
        i = result?.nextIndex ?? i + 1;
        continue;
      }

      const question = result.question;
      const isCaseStudyQuestion =
        currentCaseStudy && question.category.toLowerCase().includes("case study");

      if (isCaseStudyQuestion) {
        question.caseStudyId = currentCaseStudy.id;
        question.caseStudyTitle = currentCaseStudy.title;
        question.scenario = currentCaseStudy.scenario;
      }

      questions.push(question);
      i = result.nextIndex;
      continue;
    }

    i++;
  }

  return questions;
}

const byId = new Map();

for (const fileName of INPUT_FILES) {
  const inputPath = path.join(root, fileName);
  if (!fs.existsSync(inputPath)) {
    console.warn(`[parse-questions] Missing input file: ${fileName}`);
    continue;
  }

  const text = fs.readFileSync(inputPath, "utf8");
  const parsed = parseQuestionBank(text);
  console.log(`[parse-questions] ${fileName}: ${parsed.length} questions`);

  for (const question of parsed) {
    if (byId.has(question.id)) {
      console.warn(
        `[parse-questions] Duplicate id ${question.id} in ${fileName} — keeping first`
      );
      continue;
    }
    byId.set(question.id, question);
  }
}

const questions = [...byId.values()].sort((a, b) => a.id - b.id);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));

const general = questions.filter((q) => !q.caseStudyId).length;
const caseStudy = questions.filter((q) => q.caseStudyId).length;
const caseStudyGroups = new Set(questions.filter((q) => q.caseStudyId).map((q) => q.caseStudyId));

console.log(
  `Parsed ${questions.length} questions (${general} general, ${caseStudy} case study across ${caseStudyGroups.size} scenarios) → ${outputPath}`
);
