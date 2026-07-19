import React from "react";
import { Brain, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-base-950/50">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient">
                <Brain size={18} />
              </span>
              StudyBro AI
            </div>
            <p className="mt-3 text-sm text-slate-400">
            <p>Built by AntS Studio. Your AI-powered study companion.</p>
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" aria-label="Twitter" className="text-slate-400 hover:text-white transition-colors"><Twitter size={18} /></a>
              <a href="#" aria-label="GitHub" className="text-slate-400 hover:text-white transition-colors"><Github size={18} /></a>
              <a href="#" aria-label="LinkedIn" className="text-slate-400 hover:text-white transition-colors"><Linkedin size={18} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">About AntS Studio</a></li>
              
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} AntS Studio. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
