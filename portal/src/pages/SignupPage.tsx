import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { LogoMark } from "../components/LogoMark";

export default function SignupPage() {
  const { organization, signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (organization) return <Navigate to="/" replace />;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signup(name, email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#0d1117] px-6 py-10 text-[#f0f4ff]">
      <main className="w-full max-w-[460px]">
        <section className="panel p-6">
          <div className="text-center">
            <LogoMark size="lg" centered />
            <h1 className="mt-6 text-2xl font-semibold text-[#f0f4ff]">Create workspace</h1>
            <p className="mt-2 text-sm text-[#8892a4]">Create your OhFour organization account.</p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-5">
            <label className="block">
              <span className="page-kicker">Organization</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="input-field mt-2 w-full"
                placeholder="Your company name"
                autoComplete="organization"
                required
              />
            </label>

            <label className="block">
              <span className="page-kicker">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="input-field mt-2 w-full"
                placeholder="admin@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="block">
              <span className="page-kicker">Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                minLength={8}
                className="input-field mt-2 w-full"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
              />
            </label>

            {error ? (
              <div className="rounded-lg border border-[#f87171]/20 bg-[#2a1a1a] px-3 py-2 text-sm font-medium text-[#f87171]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="primary-button w-full justify-center py-3"
            >
              {submitting ? "Creating workspace..." : "Create workspace"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#8892a4]">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-[#3b6ef8] hover:text-[#2d5ee0]">
              Sign in
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
