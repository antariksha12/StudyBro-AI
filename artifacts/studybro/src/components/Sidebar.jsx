import React, { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import {
  Brain, Plus, User, Settings, LogOut,
  MoreHorizontal, Pencil, Trash2, MessageSquare, ChevronDown, Flame,
  PanelLeftClose, PanelLeft, Star,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import api from "../services/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

const GROUP_CONFIG = [
  { key: "today",     label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week",      label: "Previous 7 Days" },
  { key: "month",     label: "This Month" },
  { key: "older",     label: "Older" },
];

function groupByTime(conversations) {
  const now = new Date();
  const startOfToday     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
  const sevenDaysAgo     = new Date(startOfToday.getTime() - 7 * 86400000);
  const startOfMonth     = new Date(now.getFullYear(), now.getMonth(), 1);

  const groups = { today: [], yesterday: [], week: [], month: [], older: [] };
  for (const conv of conversations) {
    const d = conv.updatedAt ? new Date(conv.updatedAt) : new Date(0);
    if (d >= startOfToday)          groups.today.push(conv);
    else if (d >= startOfYesterday) groups.yesterday.push(conv);
    else if (d >= sevenDaysAgo)     groups.week.push(conv);
    else if (d >= startOfMonth)     groups.month.push(conv);
    else                            groups.older.push(conv);
  }
  return groups;
}

/** Format timestamp based on which group it belongs to */
function formatConvTime(isoString, groupKey) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  if (groupKey === "today" || groupKey === "yesterday") {
    let h = d.getHours(), m = d.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
  }
  if (groupKey === "week") return DAYS[d.getDay()];
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

// ── Conversation row ─────────────────────────────────────────────────────────

function ConvItem({ conv, isActive, groupKey, onSelect, onRename, onDelete, onToggleStar }) {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [renaming, setRenaming]   = useState(false);
  const [renameVal, setRenameVal] = useState(conv.title);
  const menuRef  = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { setRenameVal(conv.title); }, [conv.title]);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  const submitRename = () => {
    const v = renameVal.trim();
    if (v && v !== conv.title) onRename(conv.id, v);
    else setRenameVal(conv.title);
    setRenaming(false);
  };

  const time = formatConvTime(conv.updatedAt, groupKey);

  return (
    <div
      onClick={() => !renaming && onSelect(conv.id)}
      className={`group sb-conv-row ${isActive ? "active" : ""}`}
    >
      {renaming ? (
        <input
          ref={inputRef}
          value={renameVal}
          onChange={(e) => setRenameVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")  submitRename();
            if (e.key === "Escape") { setRenameVal(conv.title); setRenaming(false); }
          }}
          onBlur={submitRename}
          className="min-w-0 flex-1 bg-transparent text-[13px] text-[#e2e2e2] outline-none border-b border-white/40 pb-0.5"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <span className="min-w-0 flex-1 truncate text-[13px] text-[#ccc] leading-tight">
            {conv.title || "Untitled chat"}
          </span>
          {/* Time — hidden when menu is open or on hover (replaced by ⋮) */}
          <span className={`text-[11px] text-[#555] shrink-0 transition-opacity ${menuOpen ? "opacity-0" : "group-hover:opacity-0"}`}>
            {time}
          </span>
        </>
      )}

      {/* ⋮ menu */}
      {!renaming && (
        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className={`flex h-6 w-6 items-center justify-center rounded-md text-[#555] hover:text-[#ccc] hover:bg-white/[0.06] transition-all duration-250 ${
              menuOpen ? "opacity-100 text-[#ccc] bg-white/[0.06]" : "opacity-0 group-hover:opacity-100"
            }`}
            aria-label="Options"
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 z-[99] min-w-[150px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111] shadow-2xl animate-fade-in">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onToggleStar(conv.id, !conv.starred);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-xs text-[#bbb] hover:bg-white/5 hover:text-white transition-colors"
              >
                <Star size={12} className={conv.starred ? "text-yellow-400" : "text-[#888]"} fill={conv.starred ? "currentColor" : "none"} />
                {conv.starred ? "Unstar" : "Star"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  setRenameVal(conv.title);
                  setRenaming(true);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-xs text-[#bbb] hover:bg-white/5 hover:text-white transition-colors"
              >
                <Pencil size={12} className="text-[#888]" /> Rename
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(conv.id); }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────

export default function Sidebar({ streak = 0, collapsed = false, onToggleCollapse }) {
  const { user, logout }      = useAuth();
  const navigate              = useNavigate();
  const [searchParams]        = useSearchParams();
  const activeConvId          = searchParams.get("c");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch conversations ─────────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await api.get("/api/conversations");
      setConversations(data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const h = () => fetchConversations();
    window.addEventListener("studybro:conv-updated", h);
    return () => window.removeEventListener("studybro:conv-updated", h);
  }, [fetchConversations]);

  // ── Keyboard shortcut ⌘K → New Chat ─────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleNewChat = () => navigate("/study", { state: { reset: Date.now() } });
  const handleSelect  = (id) => navigate(`/study?c=${id}`);

  const handleRename = async (id, title) => {
    try {
      await api.patch(`/api/conversations/${id}`, { title });
      setConversations((p) => p.map((c) => (c.id === id ? { ...c, title } : c)));
    } catch { toast.error("Could not rename"); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/conversations/${id}`);
      setConversations((p) => p.filter((c) => c.id !== id));
      if (activeConvId === id) navigate("/study", { state: { reset: Date.now() } });
    } catch { toast.error("Could not delete"); }
  };

  const handleToggleStar = async (id, starred) => {
    setConversations((p) => p.map((c) => (c.id === id ? { ...c, starred } : c))); // optimistic
    try {
      await api.patch(`/api/conversations/${id}/star`, { starred });
    } catch {
      setConversations((p) => p.map((c) => (c.id === id ? { ...c, starred: !starred } : c))); // revert
      toast.error("Could not update star");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out");
      navigate("/");
    } catch { toast.error("Could not log out"); }
  };

  const avatar  = (user?.displayName || user?.email || "U")[0].toUpperCase();
  const starredConvs = conversations.filter((c) => c.starred);
  const unstarredConvs = conversations.filter((c) => !c.starred);
  const grouped = groupByTime(unstarredConvs);

  if (collapsed) {
    return (
      <aside className="sb-sidebar flex h-full w-16 flex-col items-center py-5 gap-3">
        <button
          onClick={onToggleCollapse}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-black transition-transform duration-250 hover:scale-105 active:scale-95"
          title="Expand sidebar"
        >
          <Brain size={18} strokeWidth={2.25} />
        </button>
        <button
          onClick={handleNewChat}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#111111] border border-white/[0.08] text-[#888] hover:text-white hover:bg-[#181818] hover:border-white/[0.14] transition-all duration-250"
          title="New Chat (⌘K)"
        >
          <Plus size={16} />
        </button>
        <div className="flex-1" />
        <NavLink to="/profile" className="flex h-10 w-10 items-center justify-center rounded-2xl text-[#666] hover:text-white hover:bg-white/[0.06] transition-all duration-250">
          <User size={16} />
        </NavLink>
        <NavLink to="/settings" className="flex h-10 w-10 items-center justify-center rounded-2xl text-[#666] hover:text-white hover:bg-white/[0.06] transition-all duration-250">
          <Settings size={16} />
        </NavLink>
        <button
          onClick={onToggleCollapse}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#181818] border border-white/[0.08] text-white font-semibold text-sm transition-transform duration-250 hover:scale-105"
          title="Expand sidebar"
        >
          {avatar}
        </button>
        <button
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-[#666] hover:text-red-400 hover:bg-red-500/10 transition-all duration-250"
          title="Log out"
        >
          <LogOut size={16} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="sb-sidebar flex h-full w-[240px] flex-col overflow-hidden">

      {/* ── Logo row ── */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white transition-transform duration-250 hover:scale-105">
          <Brain size={19} strokeWidth={2.25} className="text-black" />
        </div>
        <span className="flex-1 font-display font-semibold text-[16px] text-white tracking-tight">
          StudyBro <span className="text-[#666] font-medium">AI</span>
        </span>
        <button
          onClick={onToggleCollapse}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-[#555] hover:text-white hover:bg-white/[0.06] transition-all duration-250"
          title="Collapse sidebar"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* ── Streak badge ── */}
      {streak > 0 && (
        <div className="mx-3 mb-3 flex items-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/[0.08] px-3 py-2 text-xs text-orange-400">
          <Flame size={13} />
          <span className="font-semibold">{streak} day streak</span>
        </div>
      )}

      {/* ── New Chat ── */}
      <div className="px-3 pb-3">
        <button
          onClick={handleNewChat}
          className="flex w-full items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white px-3.5 py-3 text-[13px] text-black hover:bg-white/90 transition-all duration-250 active:scale-[0.98]"
        >
          <Plus size={15} className="text-black/70" />
          <span className="flex-1 text-left font-semibold">New Chat</span>
          <kbd className="font-mono text-[10px] text-black/50 bg-black/10 px-1.5 py-0.5 rounded-md">⌘K</kbd>
        </button>
      </div>

      {/* ── Conversation list ── */}
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin px-2 py-1">
        {loading ? (
          <div className="mt-3 flex flex-col gap-1.5 px-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-8 rounded-lg" style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-2 text-center px-3">
            <MessageSquare size={22} className="text-[#333]" />
            <p className="text-xs text-[#444] leading-relaxed">Your conversations will appear here</p>
          </div>
        ) : (
          <>
            {starredConvs.length > 0 && (
              <div className="mb-4">
                <p className="mb-1 px-3 text-[11px] font-medium text-[#444] tracking-wide">
                  Stars
                </p>
                {starredConvs.map((conv) => (
                  <ConvItem
                    key={conv.id}
                    conv={conv}
                    groupKey="older"
                    isActive={conv.id === activeConvId}
                    onSelect={handleSelect}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onToggleStar={handleToggleStar}
                  />
                ))}
              </div>
            )}
            {GROUP_CONFIG.map(({ key, label }) => {
              const items = grouped[key];
              if (!items?.length) return null;
              return (
                <div key={key} className="mb-4">
                  <p className="mb-1 px-3 text-[11px] font-medium text-[#444] tracking-wide">
                    {label}
                  </p>
                  {items.map((conv) => (
                    <ConvItem
                      key={conv.id}
                      conv={conv}
                      groupKey={key}
                      isActive={conv.id === activeConvId}
                      onSelect={handleSelect}
                      onRename={handleRename}
                      onDelete={handleDelete}
                      onToggleStar={handleToggleStar}
                    />
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* ── Bottom nav ── */}
      <div className="shrink-0 border-t border-white/[0.06] px-2 pt-2">
        <NavLink
          to="/profile"
          className={({ isActive }) => `sb-nav-item ${isActive ? "active" : ""}`}
        >
          <User size={15} /> Profile
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => `sb-nav-item ${isActive ? "active" : ""}`}
        >
          <Settings size={15} /> Settings
        </NavLink>
      </div>

      {/* ── Account card ── */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 cursor-pointer hover:bg-[#151515] hover:border-white/[0.12] transition-all duration-250">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-display text-sm font-bold text-black">
            {avatar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white leading-tight">
              {user?.displayName || "Student"}
            </p>
            <p className="truncate text-[11px] text-[#555]">{user?.email}</p>
          </div>
          <ChevronDown size={14} className="text-[#444] shrink-0" />
        </div>
      </div>

      {/* ── Log out ── */}
      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="sb-nav-item text-[#666] hover:text-red-400 hover:bg-red-500/10 duration-250"
        >
          <LogOut size={15} /> Log out
        </button>
      </div>
    </aside>
  );
}
