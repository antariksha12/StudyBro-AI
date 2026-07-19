import React from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Trash2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import GlassCard from "./GlassCard";

const modeLabels = {
  explain: "Explained Simply",
  summarize: "Summary",
  mcq: "MCQs",
  flashcards: "Flashcards",
  important: "Important Questions",
  quiz: "Quiz",
  translate: "Translation",
  revision: "Revision Notes",
};

export default function ResponseCard({ mode, content, createdAt, onDelete }) {
  const copy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  return (
    <GlassCard className="relative overflow-hidden">
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-brand-gradient opacity-10 blur-2xl" />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient-soft text-indigo-300">
            <Sparkles size={16} />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-white">{modeLabels[mode] || mode}</p>
            {createdAt && <p className="text-xs text-slate-500">{new Date(createdAt).toLocaleString()}</p>}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={copy} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Copy">
            <Copy size={16} />
          </button>
          {onDelete && (
            <button onClick={onDelete} className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400" aria-label="Delete">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-headings:font-display prose-headings:text-white prose-strong:text-white prose-li:text-slate-300">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </GlassCard>
  );
}
