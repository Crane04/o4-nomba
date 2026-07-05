import type { IconType } from "react-icons";

export function LandingFeatureCard({ icon: Icon, title, copy }: { icon: IconType; title: string; copy: string }) {
  return (
    <article className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#151b2a] p-6 sm:p-8">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#12214a] text-[#5d9cff]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-7 text-lg font-semibold text-[#f0f4ff]">{title}</h3>
      <p className="mt-4 text-sm font-medium leading-7 text-[#8892a4]">{copy}</p>
    </article>
  );
}
