import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus, X, FileText, ImageUp, FileUp, BrainCircuit,
  Copy, ThumbsUp, ThumbsDown, RotateCcw, ArrowUp,
  Star, SquarePen, Globe, Cpu,
  Check, User as UserIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";
import { useLocation, useSearchParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import api from "../services/api";
import StudyBroLogo from "../assets/studybro-logo.svg";

// ── Quick actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "Summarise my notes",    prompt: "Summarise the following notes:\n\n" },
  { label: "Generate MCQs",         prompt: "Create multiple-choice questions from:\n\n" },
  { label: "Make flashcards",       prompt: "Generate flashcards from:\n\n" },
  { label: "Explain simply",        prompt: "Explain this topic simply:\n\n" },
  { label: "Create revision notes", prompt: "Write revision notes for:\n\n" },
  { label: "Quiz me",               prompt: "Quiz me on:\n\n" },
];

// ── AI Tools menu items ──────────────────────────────────────────────────────
const AI_TOOLS = [
  { label: "Summarise chat",          prompt: "Summarise our conversation so far:\n\n" },
  { label: "Generate notes",          prompt: "Turn this conversation into structured study notes:\n\n" },
  { label: "Generate quiz questions", prompt: "Create quiz questions based on this conversation:\n\n" },
  { label: "Create flashcards",       prompt: "Generate flashcards (question/answer pairs) from this conversation:\n\n" },
];

// ── Format message time ──────────────────────────────────────────────────────
function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  let h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

// ── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-msg-in">
      <AiAvatar />
      <div className="sb-ai-bubble px-4 py-3.5">
        <span className="flex gap-1.5 items-center h-[14px]">
          <span className="typing-dot" />
          <span className="typing-dot" style={{ animationDelay: "0.18s" }} />
          <span className="typing-dot" style={{ animationDelay: "0.36s" }} />
        </span>
      </div>
    </div>
  );
}

// ── Avatars ──────────────────────────────────────────────────────────────────
function AiAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.14] bg-[#0a0a0a] shadow-[0_2px_10px_rgba(0,0,0,0.5)] mt-0.5">
      <img src={StudyBroLogo} alt="StudyBro AI" />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1c1c1c] border border-white/[0.08] mt-0.5">
      <UserIcon size={15} className="text-[#999]" />
    </div>
  );
}

// ── User bubble ──────────────────────────────────────────────────────────────
function UserBubble({ message }) {
  const time = fmtTime(message.createdAt || new Date().toISOString());
  return (
    <div className="flex justify-end items-start gap-2.5 animate-msg-in">
      <div className="flex flex-col items-end max-w-[72%]">
        {message.file && (
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-[#999] opacity-80">
            <FileText size={11} />
            <span className="truncate max-w-[180px]">{message.file.name}</span>
          </div>
        )}
        <div className="sb-user-bubble px-4 py-3">
          {message.content && (
            <p className="text-[14.5px] text-[#f0f0f0] leading-[1.6] whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}
          {!message.content && message.file && (
            <p className="text-[14px] text-[#aaa] italic">(file attached)</p>
          )}
          <div className="flex items-center justify-end gap-1 mt-1.5">
            <span className="text-[11px] text-[#5c5c5c]">{time}</span>
            <Check size={11} className="text-blue-400" />
            <Check size={11} className="text-blue-400 -ml-[7px]" />
          </div>
        </div>
      </div>
      <UserAvatar />
    </div>
  );
}

// ── AI bubble ────────────────────────────────────────────────────────────────
function AiBubble({ message, onRegenerate, isLast }) {
  const [liked,    setLiked]    = useState(false);
  const [disliked, setDisliked] = useState(false);
  const time = fmtTime(message.createdAt || new Date().toISOString());

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex items-start gap-3 animate-msg-in">
      <AiAvatar />
      <div className="flex flex-col max-w-[78%] min-w-0">
        {message.isError ? (
          <div className="sb-ai-bubble-error px-4 py-3.5">
            <p className="text-[13px] text-red-400 leading-relaxed">{message.content}</p>
          </div>
        ) : (
          <div className="sb-ai-bubble px-4 py-3.5">
            <div className="sb-prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Reaction bar */}
        <div className="flex items-center gap-1 mt-2 px-1">
          <button
            onClick={copy}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#555] hover:text-[#ccc] hover:bg-white/5 transition-all duration-250"
            title="Copy"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => { setLiked((v) => !v); setDisliked(false); }}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-250 ${liked ? "text-white bg-white/10" : "text-[#555] hover:text-[#ccc] hover:bg-white/5"}`}
            title="Like"
          >
            <ThumbsUp size={13} />
          </button>
          <button
            onClick={() => { setDisliked((v) => !v); setLiked(false); }}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-250 ${disliked ? "text-red-400 bg-red-500/10" : "text-[#555] hover:text-[#ccc] hover:bg-white/5"}`}
            title="Dislike"
          >
            <ThumbsDown size={13} />
          </button>
          {isLast && onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#555] hover:text-[#ccc] hover:bg-white/5 transition-all duration-250"
              title="Regenerate"
            >
              <RotateCcw size={13} />
            </button>
          )}
          <span className="ml-auto text-[11px] text-[#444]">{time}</span>
        </div>
      </div>
    </div>
  );
}

// ── Welcome screen ───────────────────────────────────────────────────────────
function WelcomeScreen({ onQuickAction }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-[#0a0a0a] shadow-glow">
        <BrainCircuit size={30} className="text-white" strokeWidth={1.75} />
      </div>
      <h2 className="font-display text-[28px] font-semibold text-white tracking-tight">
        StudyBro <span className="text-[#666] font-medium">AI</span>
      </h2>
      <p className="mt-3 max-w-sm text-[14px] text-[#666] leading-relaxed">
        Paste notes, upload a PDF or image, and ask me anything.
        I'll summarise, explain, create quizzes, flashcards, and more.
      </p>
      <div className="mt-9 grid grid-cols-2 gap-2.5 w-full max-w-md">
        {QUICK_ACTIONS.map(({ label, prompt }) => (
          <button
            key={label}
            onClick={() => onQuickAction(prompt)}
            className="rounded-2xl border border-white/[0.07] bg-[#0a0a0a] px-4 py-3.5 text-left text-[13px] text-[#999] hover:bg-[#111111] hover:text-white hover:border-white/[0.16] transition-all duration-250"
          >
            {label} →
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function StudyTools() {
  const [messages,       setMessages]       = useState([]);
  const [input,          setInput]          = useState("");
  const [isLoading,      setIsLoading]      = useState(false);
  const [attachedFile,   setAttachedFile]   = useState(null);
  const [attachedType,   setAttachedType]   = useState(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showAiToolsMenu, setShowAiToolsMenu] = useState(false);
  const [convLoading,    setConvLoading]    = useState(false);
  const [convTitle,      setConvTitle]      = useState("");
  const [webSearchOn,    setWebSearchOn]    = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft,     setTitleDraft]     = useState("");
  const [starred,        setStarred]        = useState(false);

  const location                      = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const convId                        = searchParams.get("c");

  const bottomRef     = useRef(null);
  const textareaRef   = useRef(null);
  const fileInputRef  = useRef(null);
  const fileTypeRef   = useRef(null);
  const attachMenuRef = useRef(null);
  const aiToolsMenuRef = useRef(null);
  const loadedConvIdRef = useRef(null);
  const titleInputRef = useRef(null);

  // ── Reset on New Chat signal ─────────────────────────────────────────────
  useEffect(() => {
    if (location.state?.reset) {
      setMessages([]);
      setInput("");
      setConvTitle("");
      setStarred(false);
      setAttachedFile(null);
      setAttachedType(null);
      loadedConvIdRef.current = null;
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  }, [location.state?.reset]);

  // ── Load conversation ────────────────────────────────────────────────────
  useEffect(() => {
    if (!convId) { setConvTitle(""); return; }
    if (convId === loadedConvIdRef.current) return;

    let cancelled = false;
    setConvLoading(true);

    api.get(`/api/conversations/${convId}/messages`).then(({ data }) => {
      if (cancelled) return;
      loadedConvIdRef.current = convId;
      setConvTitle(data.conversation?.title || "");
      setStarred(!!data.conversation?.starred);
      setMessages(data.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        file: m.file || null,
        createdAt: m.createdAt,
      })));
    }).catch(() => {
      if (!cancelled) toast.error("Could not load conversation");
    }).finally(() => {
      if (!cancelled) setConvLoading(false);
    });

    return () => { cancelled = true; };
  }, [convId]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Focus title input when editing starts ────────────────────────────────
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // ── Close attach menu / AI tools menu on outside click ───────────────────
  useEffect(() => {
    const h = (e) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target))
        setShowAttachMenu(false);
      if (aiToolsMenuRef.current && !aiToolsMenuRef.current.contains(e.target))
        setShowAiToolsMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Textarea auto-resize ─────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const el = textareaRef.current;
    if (el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 140) + "px"; }
  };

  const resetTextarea = () => {
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  // ── File handling ────────────────────────────────────────────────────────
  const triggerFileInput = (type) => {
    fileTypeRef.current = type;
    fileInputRef.current.accept = type === "pdf" ? "application/pdf" : "image/*";
    fileInputRef.current.click();
    setShowAttachMenu(false);
  };

  const onFileSelected = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    e.target.value = "";
    const type = fileTypeRef.current;
    const maxMB = type === "pdf" ? 15 : 8;
    if (f.size > maxMB * 1024 * 1024) { toast.error(`File too large — max ${maxMB} MB`); return; }
    setAttachedFile(f);
    setAttachedType(type);
    textareaRef.current?.focus();
  };

  // ── Send message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (overrideText) => {
    const text = overrideText ?? input.trim();
    if ((!text && !attachedFile) || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: text,
      file: attachedFile ? { name: attachedFile.name, type: attachedType } : null,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!overrideText) resetTextarea();

    const fileToSend     = attachedFile;
    const fileTypeToSend = attachedType;
    const currentConvId  = loadedConvIdRef.current;
    setAttachedFile(null);
    setAttachedType(null);
    setIsLoading(true);

    try {
      let res;
      if (fileToSend) {
        const fd = new FormData();
        fd.append("file", fileToSend);
        if (text) fd.append("message", text);
        fd.append("inputType", fileTypeToSend);
        if (currentConvId) fd.append("conversationId", currentConvId);
        fd.append("webSearch", webSearchOn ? "true" : "false");
        res = await api.post("/api/ai/chat", fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        res = await api.post("/api/ai/chat", {
          message: text,
          webSearch: webSearchOn,
          ...(currentConvId ? { conversationId: currentConvId } : {}),
        });
      }

      const { conversationId: retId, content, id, createdAt } = res.data;

      if (retId && retId !== currentConvId) {
        loadedConvIdRef.current = retId;
        setSearchParams({ c: retId }, { replace: true });
        // Set title from first user message
        if (!convTitle) setConvTitle(text.slice(0, 60).trim() + (text.length > 60 ? "…" : ""));
      }

      setMessages((prev) => [
        ...prev,
        { id, role: "assistant", content, createdAt },
      ]);

      window.dispatchEvent(new CustomEvent("studybro:conv-updated"));
      toast.success("+10 XP 🎉", { duration: 1500 });
    } catch (err) {
      toast.error(err.message || "Something went wrong");
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: `**Error:** ${err.message || "Something went wrong."}`, isError: true, createdAt: new Date().toISOString() },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, attachedFile, attachedType, isLoading, convTitle, setSearchParams, webSearchOn]);

  // ── Regenerate last AI response ──────────────────────────────────────────
  const handleRegenerate = useCallback(() => {
    // Find last user message
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    // Remove last AI message and re-send
    setMessages((prev) => prev.filter((m) => m.id !== messages[messages.length - 1]?.id));
    sendMessage(lastUser.content);
  }, [messages, sendMessage]);

  // ── Edit conversation title ──────────────────────────────────────────────
  const startEditTitle = () => {
    setTitleDraft(convTitle);
    setIsEditingTitle(true);
  };

  const cancelEditTitle = () => {
    setIsEditingTitle(false);
    setTitleDraft("");
  };

  const saveTitle = async () => {
    const next = titleDraft.trim();
    setIsEditingTitle(false);
    if (!next || next === convTitle) return;

    const prevTitle = convTitle;
    setConvTitle(next); // optimistic update

    if (convId) {
      try {
        await api.patch(`/api/conversations/${convId}`, { title: next });
        window.dispatchEvent(new CustomEvent("studybro:conv-updated"));
      } catch (err) {
        setConvTitle(prevTitle);
        toast.error("Could not rename conversation");
      }
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); saveTitle(); }
    if (e.key === "Escape") { e.preventDefault(); cancelEditTitle(); }
  };

  // ── Star / unstar conversation ───────────────────────────────────────────
  const toggleStar = async () => {
    if (!convId) return;
    const next = !starred;
    setStarred(next); // optimistic update
    try {
      await api.patch(`/api/conversations/${convId}/star`, { starred: next });
      window.dispatchEvent(new CustomEvent("studybro:conv-updated"));
    } catch (err) {
      setStarred(!next);
      toast.error("Could not update star");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const applyQuickAction = (prompt) => {
    setInput(prompt);
    setTimeout(() => {
      const el = textareaRef.current;
      if (el) {
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 140) + "px";
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }, 0);
  };

  const isEmpty  = messages.length === 0 && !isLoading && !convLoading;
  const canSend  = (input.trim().length > 0 || !!attachedFile) && !isLoading;
  const lastAiIdx = messages.map((m, i) => m.role === "assistant" ? i : -1).filter((i) => i >= 0).at(-1);

  return (
    <AppLayout chatMode>
      <div className="flex flex-col h-full">

        {/* ── Header ── */}
        {(convTitle || !isEmpty) && (
          <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] md:pl-6 pl-14">
            <button className="flex items-center gap-2 group">
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  onBlur={saveTitle}
                  onClick={(e) => e.stopPropagation()}
                  maxLength={80}
                  className="bg-transparent text-[15px] font-semibold text-[#e2e2e2] outline-none border-b border-white/40 truncate max-w-[280px]"
                />
              ) : (
                <span className="text-[15px] font-semibold text-[#e2e2e2] group-hover:text-white transition-colors duration-250 truncate max-w-[280px]">
                  {convTitle || "New Chat"}
                </span>
              )}
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleStar}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-250 ${
                  starred ? "text-yellow-400 hover:bg-yellow-500/10" : "text-[#555] hover:text-[#ccc] hover:bg-white/5"
                }`}
                title={starred ? "Unstar" : "Star"}
              >
                <Star size={16} fill={starred ? "currentColor" : "none"} />
              </button>
              <button
                onClick={startEditTitle}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] hover:text-[#ccc] hover:bg-white/5 transition-all duration-250"
                title="Edit title"
              >
                <SquarePen size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {convLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" style={{ animationDelay: "0.18s" }} />
                <span className="typing-dot" style={{ animationDelay: "0.36s" }} />
              </div>
            </div>
          ) : isEmpty ? (
            <WelcomeScreen onQuickAction={applyQuickAction} />
          ) : (
            <div className="mx-auto max-w-[720px] px-4 pt-6 pb-4 flex flex-col gap-5">
              {/* Mobile top spacer so hamburger doesn't overlap first message */}
              <div className="h-1 md:hidden" />
              {messages.map((msg, idx) =>
                msg.role === "user"
                  ? <UserBubble key={msg.id} message={msg} />
                  : <AiBubble
                      key={msg.id}
                      message={msg}
                      isLast={idx === lastAiIdx}
                      onRegenerate={idx === lastAiIdx ? handleRegenerate : null}
                    />
              )}
              {isLoading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── Input area ── */}
        <div className="shrink-0 px-4 pb-5 pt-2">
          <div className="mx-auto max-w-[720px]">

            {/* Attached file badge */}
            {attachedFile && (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-[#111111] px-3 py-2 animate-fade-in">
                <FileText size={13} className="text-[#999] shrink-0" />
                <span className="flex-1 truncate text-[12px] text-[#aaa]">{attachedFile.name}</span>
                <button onClick={() => { setAttachedFile(null); setAttachedType(null); }}
                  className="text-[#555] hover:text-red-400 transition-colors duration-250 shrink-0">
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Main input container — 64px pill: attach/tools left · text middle · send right */}
            <div className="flex items-end gap-2 rounded-[2rem] border border-white/[0.09] bg-[#111111] px-2.5 py-2.5 min-h-[64px] focus-within:border-white/[0.22] focus-within:shadow-glow transition-all duration-250">

              {/* Attach menu */}
              <div className="relative shrink-0" ref={attachMenuRef}>
                <button
                  onClick={() => setShowAttachMenu((v) => !v)}
                  className={`flex h-[42px] w-[42px] items-center justify-center rounded-full border transition-all duration-250 ${
                    showAttachMenu
                      ? "border-white/25 bg-white/10 text-white"
                      : "border-white/[0.08] bg-[#181818] text-[#777] hover:text-white hover:border-white/[0.18]"
                  }`}
                  title="Attach file"
                >
                  <Plus size={17} />
                </button>

                {showAttachMenu && (
                  <div className="absolute bottom-[52px] left-0 z-30 min-w-[170px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#151515] shadow-2xl animate-fade-in">
                    <button onClick={() => triggerFileInput("pdf")}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-[#bbb] hover:bg-white/5 hover:text-white transition-colors duration-250">
                      <FileUp size={14} className="text-[#999]" /> Upload PDF
                    </button>
                    <button onClick={() => triggerFileInput("image")}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-[#bbb] hover:bg-white/5 hover:text-white transition-colors duration-250">
                      <ImageUp size={14} className="text-[#999]" /> Upload Image
                    </button>
                  </div>
                )}
              </div>

              {/* Web search toggle */}
              <button
                onClick={() => setWebSearchOn((v) => !v)}
                className={`shrink-0 flex h-[42px] w-[42px] items-center justify-center rounded-full border transition-all duration-250 ${
                  webSearchOn
                    ? "border-white/25 bg-white/10 text-white"
                    : "border-white/[0.08] bg-[#181818] text-[#777] hover:text-white hover:border-white/[0.18]"
                }`}
                title={webSearchOn ? "Web search: on" : "Web search: off"}
              >
                <Globe size={16} />
              </button>

              {/* AI tools menu */}
              <div className="relative shrink-0" ref={aiToolsMenuRef}>
                <button
                  onClick={() => setShowAiToolsMenu((v) => !v)}
                  className={`flex h-[42px] w-[42px] items-center justify-center rounded-full border transition-all duration-250 ${
                    showAiToolsMenu
                      ? "border-white/25 bg-white/10 text-white"
                      : "border-white/[0.08] bg-[#181818] text-[#777] hover:text-white hover:border-white/[0.18]"
                  }`}
                  title="AI Tools"
                >
                  <Cpu size={16} />
                </button>

                {showAiToolsMenu && (
                  <div className="absolute bottom-[52px] left-0 z-40 min-w-[200px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#151515] shadow-2xl animate-fade-in">
                    {AI_TOOLS.map(({ label, prompt }) => (
                      <button
                        key={label}
                        onClick={() => { applyQuickAction(prompt); setShowAiToolsMenu(false); }}
                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-[#bbb] hover:bg-white/5 hover:text-white transition-colors duration-250"
                      >
                        <BrainCircuit size={14} className="text-[#999]" /> {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Text area — the "middle" placeholder zone */}
              <div className="flex-1 min-w-0 flex items-center px-1.5 py-1.5">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Message StudyBro AI..."
                  rows={1}
                  className="w-full bg-transparent text-[14.5px] text-[#f0f0f0] placeholder-[#5a5a5a] outline-none resize-none leading-relaxed"
                  style={{ minHeight: "24px", maxHeight: "140px" }}
                />
              </div>

              {/* Send button — circular white */}
              <button
                onClick={() => sendMessage()}
                disabled={!canSend}
                aria-label="Send"
                className="shrink-0 flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white text-black transition-all duration-250 hover:opacity-90 hover:scale-105 active:scale-90 disabled:opacity-20 disabled:pointer-events-none disabled:hover:scale-100"
              >
                {isLoading ? (
                  <span className="flex gap-0.5">
                    <span className="typing-dot" style={{ width: 4, height: 4, background: "#000" }} />
                    <span className="typing-dot" style={{ width: 4, height: 4, background: "#000", animationDelay: "0.18s" }} />
                    <span className="typing-dot" style={{ width: 4, height: 4, background: "#000", animationDelay: "0.36s" }} />
                  </span>
                ) : (
                  <ArrowUp size={18} strokeWidth={2.5} />
                )}
              </button>
            </div>

            {/* Disclaimer */}
            <p className="mt-2.5 text-center text-[11px] text-[#3a3a3a]">
              StudyBro AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={onFileSelected} />
    </AppLayout>
  );
}
