import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Brain, Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Testimonials", href: "#testimonials" },
    
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto mt-4 max-w-6xl px-4">
        <nav className="glass flex items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient">
              <Brain size={18} />
            </span>
            StudyBro <span className="gradient-text">AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-slate-300 hover:text-white transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-slate-200 hover:text-white transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="btn-primary py-2 px-4 text-sm">
              Get Started Free
            </Link>
          </div>

          <button className="md:hidden text-slate-200" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {open && (
          <div className="glass mt-2 flex flex-col gap-4 p-5 md:hidden">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-slate-300" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="btn-ghost flex-1 text-sm">Log in</Link>
              <Link to="/signup" className="btn-primary flex-1 text-sm">Sign up</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
