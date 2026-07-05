export function ProductPreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#0d1117] p-4 text-left">
      <p className="font-mono text-lg font-semibold text-[#f0f4ff]">{value}</p>
      <p className="mt-1 text-xs font-medium text-[#8892a4]">{label}</p>
    </div>
  );
}
