import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Zap, Target, ArrowRight, Sparkles } from "lucide-react";
import AppLayout from "../components/AppLayout";
import GlassCard from "../components/GlassCard";
import { SkeletonBlock } from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get("/api/user/stats"),
          api.get("/api/history?limit=5"),
        ]);
        setStats(statsRes.data);
        setRecent(historyRes.data.items || []);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const xpForNextLevel = stats ? (stats.level || 1) * 500 : 500;
  const xpProgress = stats ? Math.min(100, ((stats.xp % xpForNextLevel) / xpForNextLevel) * 100) : 0;

  return (
    <AppLayout streak={stats?.streak ?? 0}>
      <div className="space-y-6">
        {/* Welcome card */}
        <GlassCard className="relative overflow-hidden bg-brand-gradient-soft">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-gradient opacity-20 blur-3xl animate-float" />
          <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-display text-2xl font-bold text-white">
                Welcome back, {(user?.displayName || "Student").split(" ")[0]} 👋
              </h1>
              <p className="mt-1 text-slate-300">Ready to pick up where you left off?</p>
            </div>
            <Link to="/study" className="btn-primary shrink-0">
              <Sparkles size={16} /> New Study Session
            </Link>
          </div>
        </GlassCard>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Flame} color="text-ember-400" bg="bg-ember-500/10" label="Study Streak" value={loading ? null : `${stats?.streak ?? 0} days`} />
          <StatCard icon={Zap} color="text-violet-400" bg="bg-violet-500/10" label="Total XP" value={loading ? null : `${stats?.xp ?? 0} XP`} sub={`Level ${stats?.level ?? 1}`} />
          <StatCard icon={Target} color="text-cyan-400" bg="bg-cyan-500/10" label="Requests Today" value={loading ? null : `${stats?.requestsToday ?? 0}/${stats?.dailyLimit ?? 10}`} />
        </div>

        {/* XP progress + daily goal */}
        <div className="grid gap-4 md:grid-cols-2">
          <GlassCard>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-white">Level progress</h3>
              <span className="text-xs text-slate-400">{stats ? `${stats.xp % xpForNextLevel} / ${xpForNextLevel} XP` : "…"}</span>
            </div>
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-brand-gradient transition-all duration-700" style={{ width: `${xpProgress}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">Earn XP every time you generate study material or complete a quiz.</p>
          </GlassCard>

          <GlassCard>
            <h3 className="font-display font-semibold text-white">Today's goal</h3>
            <p className="mt-1 text-sm text-slate-400">Use at least one AI study tool to keep your streak alive.</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-brand-gradient transition-all duration-700"
                  style={{ width: stats?.requestsToday > 0 ? "100%" : "0%" }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-300">
                {stats?.requestsToday > 0 ? "Done ✓" : "Not yet"}
              </span>
            </div>
          </GlassCard>
        </div>

        {/* Recent activity */}
        <GlassCard>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-white">Recent activity</h3>
            <Link to="/history" className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {loading &&
              Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} className="h-14 w-full" />)}

            {!loading && recent.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">
                No activity yet — head to AI Study Tools to generate your first response.
              </p>
            )}

            {!loading &&
              recent.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-200">{item.mode}</p>
                    <p className="truncate text-xs text-slate-500">{item.preview}</p>
                  </div>
                  <span className="ml-3 shrink-0 text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}

function StatCard({ icon: Icon, color, bg, label, value, sub }) {
  return (
    <GlassCard className="flex items-center gap-4">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}>
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        {value === null ? (
          <SkeletonBlock className="mt-1 h-5 w-16" />
        ) : (
          <p className="font-display text-lg font-bold text-white">{value}</p>
        )}
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
      </div>
    </GlassCard>
  );
}
