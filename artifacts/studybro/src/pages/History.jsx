import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import ResponseCard from "../components/ResponseCard";
import GlassCard from "../components/GlassCard";
import { SkeletonBlock } from "../components/Loader";
import api from "../services/api";

const filters = ["all", "explain", "summarize", "mcq", "flashcards", "important", "quiz", "translate", "revision"];

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/history");
        setItems(res.data.items || []);
      } catch (err) {
        toast.error(err.message || "Could not load history");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const deleteItem = async (id) => {
    try {
      await api.delete(`/api/history/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Deleted");
    } catch (err) {
      toast.error(err.message || "Could not delete");
    }
  };

  const visible = items
    .filter((i) => filter === "all" || i.mode === filter)
    .filter((i) => i.content?.toLowerCase().includes(query.toLowerCase()));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">History</h1>
          <p className="mt-1 text-slate-400">Every AI response you've generated, saved automatically.</p>
        </div>

        <GlassCard className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your history…"
              className="input-field pl-10"
            />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-auto shrink-0">
            {filters.map((f) => <option key={f} value={f}>{f === "all" ? "All types" : f}</option>)}
          </select>
        </GlassCard>

        <div className="space-y-4">
          {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} className="h-40 w-full" />)}

          {!loading && visible.length === 0 && (
            <GlassCard className="py-14 text-center text-sm text-slate-500">
              Nothing here yet. Head to AI Study Tools to generate your first response.
            </GlassCard>
          )}

          {!loading &&
            visible.map((item) => (
              <ResponseCard
                key={item.id}
                mode={item.mode}
                content={item.content}
                createdAt={item.createdAt}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
        </div>
      </div>
    </AppLayout>
  );
}
