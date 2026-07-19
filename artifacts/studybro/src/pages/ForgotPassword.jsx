import React, { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/Loader";
import { AuthShell, Field } from "./Login";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success("Reset link sent — check your inbox");
    } catch {
      toast.error("Could not send reset email. Check the address and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a link to get back in.">
      {sent ? (
        <p className="text-center text-sm text-slate-300">
          If an account exists for <span className="text-white">{email}</span>, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} required />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Spinner size={18} /> : <>Send reset link <ArrowRight size={16} /></>}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
