import React, { useState } from "react";
import { Moon, Bell, Cpu, Crown } from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import GlassCard from "../components/GlassCard";
import api from "../services/api";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [model, setModel] = useState("llama-3.3-70b-versatile");

  const updateModel = async (value) => {
    setModel(value);
    try {
      await api.post("/api/user/settings", { aiModel: value });
      toast.success("AI model updated");
    } catch (err) {
      toast.error(err.message || "Could not save setting");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>

        <GlassCard className="space-y-5">
          <h3 className="font-display font-semibold text-white">Preferences</h3>

          <ToggleRow
            icon={Moon}
            label="Dark mode"
            desc="StudyBro AI is designed dark-first for comfortable late-night studying."
            checked={darkMode}
            onChange={setDarkMode}
          />
          <ToggleRow
            icon={Bell}
            label="Notifications"
            desc="Streak reminders and daily goal nudges."
            checked={notifications}
            onChange={setNotifications}
          />

          <div className="flex items-start justify-between gap-4 border-t border-white/10 pt-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-300"><Cpu size={18} /></span>
              <div>
                <p className="text-sm font-medium text-slate-200">AI model</p>
                <p className="text-xs text-slate-500">Choose which Groq model powers your requests.</p>
              </div>
            </div>
            <select value={model} onChange={(e) => updateModel(e.target.value)} className="input-field w-auto py-2 text-sm">
              <option value="llama-3.3-70b-versatile">Llama 3.3 70B (recommended)</option>
              <option value="llama-3.1-8b-instant">Llama 3.1 8B (faster)</option>
            </select>
          </div>
        </GlassCard>

        <GlassCard className="relative overflow-hidden bg-brand-gradient-soft">
          <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-brand-gradient opacity-20 blur-2xl" />
          <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white"><Crown size={20} /></span>
              <div>
                <p className="font-display font-semibold text-white">Upgrade to Premium</p>
                <p className="text-sm text-slate-300">Unlimited AI requests, PDFs and quizzes for $6/mo.</p>
              </div>
            </div>
            <button className="btn-primary shrink-0">Upgrade</button>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}

function ToggleRow({ icon: Icon, label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-300"><Icon size={18} /></span>
        <div>
          <p className="text-sm font-medium text-slate-200">{label}</p>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-brand-gradient" : "bg-white/10"}`}
        aria-pressed={checked}
        aria-label={label}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}
