import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/Loader";
import { AuthShell, Field, Divider, GoogleIcon } from "./Login";

export default function Signup() {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success("Account created! Let's study.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message?.replace("Firebase: ", "") || "Could not sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Welcome to StudyBro AI!");
      navigate("/dashboard");
    } catch {
      toast.error("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="10 free AI requests every day. No card needed.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field icon={User} type="text" placeholder="Full name" value={name} onChange={setName} required />
        <Field icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} required />
        <Field icon={Lock} type="password" placeholder="Password (min. 6 characters)" value={password} onChange={setPassword} minLength={6} required />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Spinner size={18} /> : <>Create account <ArrowRight size={16} /></>}
        </button>
      </form>

      <Divider />

      <button onClick={handleGoogle} disabled={loading} className="btn-ghost w-full">
        <GoogleIcon /> Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
