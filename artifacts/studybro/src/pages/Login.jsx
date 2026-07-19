import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/Loader";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/study");
    } catch (err) {
      toast.error(friendlyError(err.code) || "Could not log in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Welcome back!");
      navigate("/study");
    } catch (err) {
      toast.error("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to keep your streak going.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} required />
        <Field icon={Lock} type="password" placeholder="Password" value={password} onChange={setPassword} required />

        <div className="text-right">
          <Link to="/forgot-password" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Spinner size={18} /> : <>Log in <ArrowRight size={16} /></>}
        </button>
      </form>

      <Divider />

      <button onClick={handleGoogle} disabled={loading} className="btn-ghost w-full">
        <GoogleIcon /> Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-slate-400">
        New to StudyBro AI?{" "}
        <Link to="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-base-900 bg-mesh px-4">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-gradient opacity-20 blur-[100px]" />
      <div className="glass relative z-10 w-full max-w-md p-8">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 font-display text-lg font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient">
            <Brain size={18} />
          </span>
          StudyBro <span className="gradient-text">AI</span>
        </Link>
        <h1 className="text-center font-display text-2xl font-bold text-white">{title}</h1>
        <p className="mt-1 text-center text-sm text-slate-400">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ icon: Icon, onChange, ...props }) {
  return (
    <div className="relative">
      <Icon size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
      <input {...props} onChange={(e) => onChange(e.target.value)} className="input-field pl-10" />
    </div>
  );
}

export function Divider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-xs text-slate-500">OR</span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 16.3 3 9.6 7.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 36.5 26.9 37.5 24 37.5c-5.3 0-9.7-3.1-11.3-7.7l-6.5 5C9.5 40.6 16.2 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.6 5.4C41.7 35.9 45 30.5 45 24c0-1.4-.1-2.7-.4-3.5z" />
    </svg>
  );
}

function friendlyError(code) {
  const map = {
    "auth/invalid-credential": "Incorrect email or password",
    "auth/user-not-found": "No account found with that email",
    "auth/wrong-password": "Incorrect email or password",
    "auth/email-already-in-use": "That email is already registered",
    "auth/weak-password": "Password should be at least 6 characters",
  };
  return map[code];
}
