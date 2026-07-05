export function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[#8892a4]">{label}</span>
        <span className="font-mono font-semibold text-[#f0f4ff]">{Math.round(score * 100)}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-[#1e2535]">
        <div className="h-2 rounded-full bg-[#3b6ef8]" style={{ width: `${Math.round(score * 100)}%` }} />
      </div>
    </div>
  );
}
