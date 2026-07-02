import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { LogoMark } from "../components/LogoMark";

export default function LoginPage() {
  const { organization, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/dashboard";

  if (organization) return <Navigate to={redirectTo} replace />;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#0d1117] px-6 py-10 text-[#f0f4ff]">
      <main className="w-full max-w-[420px]">
        <section className="panel p-6">
          <div className="text-center">
            <LogoMark size="lg" centered />
            <h1 className="mt-6 text-2xl font-semibold text-[#f0f4ff]">Sign in to your account</h1>
            <p className="mt-2 text-sm text-[#8892a4]">Use your OhFour organization credentials.</p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-5">
            <label className="block">
              <span className="page-kicker">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="input-field mt-2 w-full"
                placeholder="admin@company.com"
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
                className="input-field mt-2 w-full"
                placeholder="Password"
                autoComplete="current-password"
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
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#8892a4]">
            No workspace yet?{" "}
            <Link to="/signup" className="font-medium text-[#3b6ef8] hover:text-[#2d5ee0]">
              Create one
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
