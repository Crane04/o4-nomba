interface LogoMarkProps {
  size?: "sm" | "md" | "lg";
  centered?: boolean;
}

const sizes = {
  sm: "h-10 w-10 text-[13px]",
  md: "h-12 w-12 text-sm",
  lg: "h-14 w-14 text-base",
};

export function LogoMark({ size = "sm", centered = false }: LogoMarkProps) {
  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${
        sizes[size]
      } ${centered ? "mx-auto" : ""}`}
      aria-label="OhFour"
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(59,110,248,0.22),transparent_44%)]" />
      <svg viewBox="0 0 48 48" className="relative h-[68%] w-[68%]" role="img" aria-hidden="true">
        <circle cx="21" cy="24" r="12" fill="none" stroke="hsl(var(--foreground))" strokeWidth="6" />
        <path
          d="M32 12v24M32 12L20 30h20"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="6"
        />
      </svg>
    </div>
  );
}
