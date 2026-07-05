export function MiniScore({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-[#8892a4]">
        <span>{label}</span>
        <span className="font-mono">{Math.round(score * 100)}%</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-[#1e2535]">
        <div className="h-1.5 rounded-full bg-[#3b6ef8]" style={{ width: `${Math.round(score * 100)}%` }} />
      </div>
    </div>
  );
}
