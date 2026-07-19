import React, { useEffect, useState } from "react";
import { Flame, Zap, Trophy, Award } from "lucide-react";
import AppLayout from "../components/AppLayout";
import GlassCard from "../components/GlassCard";
import { SkeletonBlock } from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const ACHIEVEMENTS = [
  { id: "first_gen", label: "First Steps", desc: "Generate your first AI response", icon: Zap, threshold: 1, metric: "totalGenerations" },
  { id: "streak_7", label: "Week Warrior", desc: "Reach a 7-day streak", icon: Flame, threshold: 7, metric: "streak" },
  { id: "gen_50", label: "Power Learner", desc: "Generate 50 AI responses", icon: Trophy, threshold: 50, metric: "totalGenerations" },
  { id: "level_5", label: "Rising Star", desc: "Reach level 5", icon: Award, threshold: 5, metric: "level" },
];

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/user/stats")
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout streak={stats?.streak ?? 0}>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-white">Profile</h1>

        <GlassCard className="flex flex-col items-center gap-4 py-10 text-center sm:flex-row sm:text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-gradient font-display text-2xl font-bold text-white shadow-glow">
            {(user?.displayName || user?.email || "U")[0].toUpperCase()}
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">{user?.displayName || "Student"}</h2>
            <p className="text-sm text-slate-400">{user?.email}</p>
            {!loading && stats && (
              <p className="mt-2 text-xs font-semibold text-indigo-400">Level {stats.level} · {stats.xp} XP</p>
            )}
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="flex items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ember-500/10 text-ember-400"><Flame size={20} /></span>
            <div>
              <p className="text-xs text-slate-400">Current Streak</p>
              {loading ? <SkeletonBlock className="mt-1 h-5 w-14" /> : <p className="font-display text-lg font-bold text-white">{stats?.streak ?? 0} days</p>}
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400"><Zap size={20} /></span>
            <div>
              <p className="text-xs text-slate-400">Total XP</p>
              {loading ? <SkeletonBlock className="mt-1 h-5 w-14" /> : <p className="font-display text-lg font-bold text-white">{stats?.xp ?? 0}</p>}
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <h3 className="font-display font-semibold text-white">Achievements</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {ACHIEVEMENTS.map((a) => {
              const value = stats?.[a.metric] ?? 0;
              const unlocked = value >= a.threshold;
              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 rounded-xl border p-4 ${
                    unlocked ? "border-indigo-400/30 bg-brand-gradient-soft" : "border-white/10 bg-white/[0.02] opacity-60"
                  }`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${unlocked ? "bg-brand-gradient text-white" : "bg-white/5 text-slate-500"}`}>
                    <a.icon size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{a.label}</p>
                    <p className="text-xs text-slate-400">{a.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
