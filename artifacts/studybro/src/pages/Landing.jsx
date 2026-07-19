import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  Sparkles, FileText, ImageIcon, BrainCircuit, ListChecks, Layers,
  HelpCircle, Languages, NotebookPen, ArrowRight, Check, Star, Flame,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import GlassCard from "../components/GlassCard";

const tools = [
  { icon: BrainCircuit, title: "Explain Simply", desc: "Turn dense paragraphs into plain-English explanations." },
  { icon: FileText, title: "Summarize", desc: "Condense chapters into the points that actually matter." },
  { icon: ListChecks, title: "Generate MCQs", desc: "Practice questions pulled straight from your material." },
  { icon: Layers, title: "Flashcards", desc: "Auto-built flashcard decks, ready to drill." },
  { icon: HelpCircle, title: "Important Questions", desc: "Spot the questions most likely to show up on the test." },
  { icon: Sparkles, title: "Quiz Me", desc: "An interactive quiz generated from what you just studied." },
  { icon: Languages, title: "Translate", desc: "Study the same material in a language you're comfortable in." },
  { icon: NotebookPen, title: "Revision Notes", desc: "Clean, structured notes for the night before an exam." },
];

const testimonials = [
  { name: "Suman Chutia", role: "Student", quote: "ITS SO GOOD LIKE IT HELPED ME GET 100 MARKS in MATHS." },
  { name: "Loprince Sonowal", role: "Student", quote: "BETTER THAN CHATGPT" },
  { name: "Budheswar Patir", role: "Student", quote: "IT HELPED ME IN CHEATING" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Landing() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to="/study" replace />;
  }
  return (
    <div className="overflow-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center px-6 pt-32 pb-20">
        <div className="pointer-events-none absolute inset-0 bg-mesh" />
        <div
          className="pointer-events-none absolute -top-20 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand-gradient opacity-20 blur-[120px] animate-pulse-slow"
        />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-indigo-300"
          >
            <Sparkles size={14} />
            Powered by GROQ
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl font-bold leading-[1.1] text-white sm:text-6xl md:text-7xl"
          >
            Study Smarter <br />
            <span className="gradient-text">with AI</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-400"
          >
            Paste your notes, upload a PDF, or snap a photo of a textbook page — StudyBro AI turns it into
            summaries, flashcards, quizzes and revision notes in seconds.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link to="/signup" className="btn-primary px-7 py-3.5 text-base">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-ghost px-7 py-3.5 text-base">
              Log in
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.4 }}
            className="mt-6 flex items-center justify-center gap-1.5 text-sm text-slate-500"
          >
            <Flame size={14} className="text-ember-400" />
           
          </motion.div>
        </div>
      </section>

      {/* Feature strip: inputs */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: NotebookPen, label: "Paste your notes" },
            { icon: FileText, label: "Upload a PDF" },
            { icon: ImageIcon, label: "Photograph a textbook page" },
          ].map(({ icon: Icon, label }) => (
            <GlassCard key={label} className="flex items-center gap-3 py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient-soft text-indigo-300">
                <Icon size={18} />
              </span>
              <span className="text-sm font-medium text-slate-200">{label}</span>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            One upload, <span className="gradient-text">eight ways to study it</span>
          </h2>
          <p className="mt-3 text-slate-400">Every tool works on the same source — pick the format that fits how you learn.</p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
            >
              <GlassCard hover className="h-full">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient-soft text-indigo-300">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-display font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-5xl px-6 py-24">
        <h2 className="text-center font-display text-3xl font-bold text-white sm:text-4xl">How it works</h2>
        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {[
            { step: "Add your material", desc: "Paste text, drop a PDF, or upload a photo of the page." },
            { step: "Pick a study format", desc: "Summary, flashcards, MCQs, quiz — whatever you need right now." },
            { step: "Review & retain", desc: "Gemini generates it instantly, saved to your history for later." },
          ].map((s, i) => (
            <div key={s.step} className="relative">
              <span className="font-display text-5xl font-bold text-white/10">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-white">{s.step}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center font-display text-3xl font-bold text-white sm:text-4xl">Students are already ahead</h2>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <GlassCard key={t.name}>
              <div className="flex gap-0.5 text-ember-400">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="mt-4 text-sm text-slate-300">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient font-display text-xs font-bold text-white">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

     
      
      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <GlassCard className="bg-brand-gradient-soft py-14">
          <h2 className="font-display text-3xl font-bold text-white">Ready to study smarter?</h2>
          <p className="mt-2 text-slate-300">Join StudyBro AI free — no credit card required.</p>
          <Link to="/signup" className="btn-primary mt-6 inline-flex px-7 py-3.5 text-base">
            Create your account <ArrowRight size={18} />
          </Link>
        </GlassCard>
      </section>

      <Footer />
    </div>
  );
}
