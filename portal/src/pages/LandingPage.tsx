import { Link } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiActivity,
  FiArrowRight,
  FiCheck,
  FiClock,
  FiCreditCard,
  FiFileText,
  FiGitMerge,
  FiGrid,
  FiShield,
  FiZap,
} from "react-icons/fi";
import { LogoMark } from "../components/LogoMark";
import { useAuth } from "../lib/auth";

const stats = [
  { value: "1", label: "account per payer" },
  { value: "24/7", label: "transfer monitoring" },
  { value: "100%", label: "decision history" },
];

const audiences = ["Distributors", "Schools", "Clinics", "Marketplaces"];

const features = [
  {
    icon: FiCreditCard,
    title: "Dedicated collection accounts",
    copy: "Issue a unique virtual account for every payer so money arrives with identity already attached.",
  },
  {
    icon: FiFileText,
    title: "Invoice tracking",
    copy: "Record expected payments and watch outstanding balances update as transfers come in.",
  },
  {
    icon: FiGitMerge,
    title: "Automatic reconciliation",
    copy: "OhFour compares amount, sender name, timing, and payment history to find the right match.",
  },
  {
    icon: FiShield,
    title: "Manual review queue",
    copy: "Uncertain transfers go to a focused review queue with ranked candidates and confidence scores.",
  },
  {
    icon: FiActivity,
    title: "Audit-ready history",
    copy: "Every identity change, payment decision, and manual resolution is traceable from one place.",
  },
  {
    icon: FiZap,
    title: "Learns from finance teams",
    copy: "Confirmed sender names become trusted history, making future matches faster and cleaner.",
  },
];

const steps = [
  {
    title: "Create your workspace",
    copy: "Sign up with your organization name and invite your finance team.",
  },
  {
    title: "Add customers and invoices",
    copy: "Create payer identities, provision virtual accounts, and record what each payer owes.",
  },
  {
    title: "Receive transfers",
    copy: "Customers pay into their dedicated account from any bank app.",
  },
  {
    title: "Reconcile with confidence",
    copy: "OhFour auto-matches clean payments and queues the rest for review.",
  },
];

export default function LandingPage() {
  const { organization } = useAuth();
  const dashboardHref = organization ? "/dashboard" : "/login";

  return (
    <main className="min-h-screen bg-[#0d1117] text-[#f0f4ff]">
      <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[#0d1117]/95 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <LogoMark size="sm" />
            <span className="text-base font-semibold tracking-tight text-[#f0f4ff]">OhFour</span>
          </Link>

          <nav className="hidden items-center gap-10 text-sm font-medium text-[#8892a4] md:flex">
            <a href="#features" className="transition-colors hover:text-[#f0f4ff]">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-[#f0f4ff]">How it works</a>
            <a href="#docs" className="transition-colors hover:text-[#f0f4ff]">Docs</a>
          </nav>

          <Link to={dashboardHref} className="primary-button inline-flex items-center gap-2 px-5 py-3">
            Go to dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-7xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#21457f] bg-[#101b31] px-4 py-2 text-xs font-semibold text-[#8fb5ff] sm:text-sm">
          <span className="h-2 w-2 rounded-full bg-[#3b6ef8]" />
          Reconciliation that knows who actually paid
        </div>

        <h1 className="mt-10 max-w-5xl text-4xl font-semibold leading-[1.05] tracking-tight text-[#f0f4ff] sm:text-6xl lg:text-7xl">
          Transfers arrive messy.
          <span className="block font-serif italic text-[#82a9d8]">OhFour turns them into truth.</span>
        </h1>

        <p className="mt-8 max-w-2xl text-base font-medium leading-8 text-[#8892a4] sm:text-lg">
          Give every payer a dedicated virtual account. Track expected payments. Automatically match
          bank transfers to the right invoice, with a clean manual queue when confidence is low.
        </p>

        <div className="mt-10">
          <Link to={dashboardHref} className="primary-button inline-flex items-center gap-2 px-8 py-4 text-base">
            Go to dashboard
            <FiArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-16 grid w-full max-w-3xl gap-6 border-t border-[rgba(255,255,255,0.08)] pt-10 sm:grid-cols-3 sm:divide-x sm:divide-[rgba(255,255,255,0.08)]">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-mono text-2xl font-semibold text-[#f0f4ff] sm:text-3xl">{stat.value}</p>
              <p className="mt-2 text-sm font-medium text-[#8892a4]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[rgba(255,255,255,0.06)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <ProductPreview />
          <div className="mt-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8892a4]">
              Built for teams that collect messy bank transfers
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-2xl font-semibold text-[#f0f4ff]/70 sm:text-3xl">
              {audiences.map((name) => (
                <span key={name}>{name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(255,255,255,0.06)] px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="mx-auto max-w-4xl text-3xl font-semibold leading-tight text-[#f0f4ff] sm:text-5xl">
          The problem is simple: payments arrive, context does not.
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-7 text-[#8892a4]">
          OhFour is a hackathon demo for turning loose bank transfers into settled invoices using
          virtual accounts, matching signals, and a human review loop.
        </p>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#f0f4ff] sm:text-4xl">
            Everything your collections team needs
          </h2>
          <p className="mt-4 text-base font-medium text-[#8892a4]">
            From expected payment to settled invoice, OhFour keeps the trail clear.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-[rgba(255,255,255,0.06)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#f0f4ff] sm:text-4xl">
            Up and running in minutes
          </h2>
          <p className="mt-4 text-base font-medium text-[#8892a4]">
            No spreadsheet gymnastics. No mystery bank narration.
          </p>

          <div className="mt-16 grid gap-8 text-left md:grid-cols-4">
            {steps.map((step, index) => (
              <article key={step.title} className="relative">
                {index < steps.length - 1 ? (
                  <span className="absolute left-12 top-4 hidden h-px w-[calc(100%-4rem)] bg-[rgba(255,255,255,0.08)] md:block" />
                ) : null}
                <p className="font-mono text-2xl font-semibold text-[#173d8b]">0{index + 1}</p>
                <h3 className="mt-6 text-base font-semibold text-[#f0f4ff]">{step.title}</h3>
                <p className="mt-4 text-sm font-medium leading-7 text-[#8892a4]">{step.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="docs" className="px-4 py-24 text-center sm:px-6 lg:px-8">
        <h2 className="mx-auto max-w-3xl text-3xl font-semibold leading-tight text-[#f0f4ff] sm:text-5xl">
          Stop reconciling payments by guesswork
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-7 text-[#8892a4]">
          Provision accounts, receive transfers, and resolve exceptions from a single workspace.
        </p>
        <Link to={dashboardHref} className="primary-button mt-10 inline-flex items-center gap-2 px-8 py-4 text-base">
          Go to dashboard
          <FiArrowRight className="h-5 w-5" />
        </Link>
      </section>

      <footer className="border-t border-[rgba(255,255,255,0.06)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm font-medium text-[#8892a4] md:flex-row md:items-center md:justify-between">
          <Link to="/" className="inline-flex items-center gap-3 text-[#f0f4ff]">
            <LogoMark size="sm" />
            <span>OhFour</span>
          </Link>
          <p>© 2026 OhFour. Virtual account reconciliation platform.</p>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-[#f0f4ff]">Sign in</Link>
            <Link to="/signup" className="hover:text-[#f0f4ff]">Create workspace</Link>
          </div>
        </div>
      </footer>

      <Link
        to={dashboardHref}
        className="fixed bottom-6 right-6 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#1ba9d8] text-white shadow-[0_18px_60px_rgba(0,0,0,0.35)] transition-transform hover:scale-105"
        aria-label="Open dashboard"
      >
        <FiGrid className="h-6 w-6" />
      </Link>
    </main>
  );
}

function ProductPreview() {
  const rows = [
    ["Amina Stores", "NGN 185,000", "Matched"],
    ["Riverside Pharmacy", "NGN 72,500", "Review"],
    ["Prime Mart", "NGN 310,000", "Matched"],
  ];

  return (
    <div className="mx-auto overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#151b2a] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="flex items-center border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
          <span className="h-3 w-3 rounded-full bg-[#f59e0b]" />
          <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
        </div>
        <div className="mx-auto rounded-lg bg-[#0d1117] px-5 py-1.5 font-mono text-xs font-semibold text-[#8892a4]">
          app.ohfour.co
        </div>
      </div>

      <div className="grid min-h-[360px] md:grid-cols-[240px_1fr]">
        <aside className="hidden border-r border-[rgba(255,255,255,0.06)] p-5 md:block">
          <div className="rounded-lg bg-[#17264a] px-4 py-3 text-sm font-semibold text-[#8fb5ff]">Collections</div>
          {["Dashboard", "Retailers", "Invoices", "Review"].map((item) => (
            <div key={item} className="mt-4 flex items-center gap-3 px-4 text-sm font-medium text-[#8892a4]">
              <span className="h-4 w-4 rounded bg-[#20293c]" />
              {item}
            </div>
          ))}
        </aside>

        <section className="p-5 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-3">
            <PreviewMetric label="Invoiced" value="NGN 8.4m" />
            <PreviewMetric label="Collected" value="NGN 6.9m" />
            <PreviewMetric label="Review" value="7" />
          </div>
          <div className="mt-7 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0d1117]">
            <div className="border-b border-[rgba(255,255,255,0.06)] px-4 py-3 text-left text-sm font-semibold text-[#f0f4ff]">
              Incoming transfers
            </div>
            {rows.map(([name, amount, status]) => (
              <div key={name} className="grid grid-cols-[1fr_auto] gap-4 border-b border-[rgba(255,255,255,0.05)] px-4 py-4 text-left last:border-b-0 sm:grid-cols-[1fr_150px_90px]">
                <p className="min-w-0 truncate text-sm font-semibold text-[#f0f4ff]">{name}</p>
                <p className="font-mono text-sm font-semibold text-[#f0f4ff]">{amount}</p>
                <span
                  className={`status-pill ${
                    status === "Matched" ? "bg-[#1a3a2a] text-[#4ade80]" : "bg-[#3a2a0a] text-[#fbbf24]"
                  }`}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#0d1117] p-4 text-left">
      <p className="font-mono text-lg font-semibold text-[#f0f4ff]">{value}</p>
      <p className="mt-1 text-xs font-medium text-[#8892a4]">{label}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, copy }: { icon: IconType; title: string; copy: string }) {
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
