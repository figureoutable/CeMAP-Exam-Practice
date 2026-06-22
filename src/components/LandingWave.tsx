interface LandingWaveProps {
  /** Fill colour of the wave (the section below) */
  fill?: string;
  className?: string;
}

export function LandingWave({ fill = "#ffffff", className }: LandingWaveProps) {
  return (
    <div className={className} aria-hidden>
      <svg
        className="block h-24 w-full md:h-40"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill={fill}
          d="M0,72 C90,8 180,112 270,48 C360,0 450,112 540,56 C630,0 720,112 810,48 C900,0 990,112 1080,56 C1170,0 1260,112 1350,48 C1395,24 1440,64 1440,64 L1440,120 L0,120 Z"
        />
      </svg>
    </div>
  );
}
