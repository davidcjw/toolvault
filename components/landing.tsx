"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  ArrowRight,
  Cpu,
  Infinity as InfinityIcon,
  Lock,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { CATEGORIES, TOOLS, type ToolCategory } from "@/lib/tools";
import { ToolCard } from "@/components/tool-card";
import { SITE } from "@/lib/site";

const TRUST = [
  { icon: Lock, label: "No uploads" },
  { icon: Sparkles, label: "No sign-up" },
  { icon: InfinityIcon, label: "No file limits" },
  { icon: Zap, label: "Instant & free" },
];

export function Landing() {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | "All">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((t) => {
      const matchesCat = category === "All" || t.category === category;
      const matchesQuery =
        q === "" ||
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q));
      return matchesCat && matchesQuery;
    });
  }, [query, category]);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.6, 0.35, 1] } },
  };
  const stagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.06 } },
  };

  return (
    <div className="relative overflow-hidden">
      {/* Backdrop */}
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_40%,transparent_100%)]" />
      <div className="glow-accent pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2" />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-16 md:grid-cols-2 md:pt-24">
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5 font-mono text-xs font-medium text-accent-strong"
          >
            <Cpu className="h-3.5 w-3.5" aria-hidden />
            runs on your device, not our servers
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl"
          >
            Free tools that
            <br />
            <span className="text-accent-strong">never touch</span> a server.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-md text-lg text-muted"
          >
            {SITE.name} is a growing collection of file tools that run entirely in
            your browser. Convert images, merge PDFs and more — instantly, with
            no uploads and no sign-up.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#tools"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-strong px-5 py-3 font-semibold text-white transition-transform hover:scale-[1.03] hover:bg-accent"
            >
              Browse all tools
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="#how"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 font-semibold text-ink transition-colors hover:border-accent/40"
            >
              How it works
            </Link>
          </motion.div>

          <motion.ul
            variants={fadeUp}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-3"
          >
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-muted">
                <Icon className="h-4 w-4 text-accent" aria-hidden />
                {label}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <HeroVisual reduce={!!reduce} />
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { n: "01", t: "Pick a file", d: "Drop in an image or PDF — straight from your device." },
            { n: "02", t: "It runs locally", d: "Your browser does the work. Nothing is sent anywhere." },
            { n: "03", t: "Download", d: "Save the result instantly. No watermarks, no waiting." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-line bg-surface p-6">
              <span className="font-mono text-sm text-accent">{s.n}</span>
              <h3 className="mt-2 text-lg font-bold tracking-tight text-ink">{s.t}</h3>
              <p className="mt-1 text-sm text-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tools ────────────────────────────────────────────── */}
      <section id="tools" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink">
              The toolbox
            </h2>
            <p className="mt-2 text-muted">
              Pick a tool. More are added regularly.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools…"
              aria-label="Search tools"
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:border-accent"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(["All", ...CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`cursor-pointer rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors ${
                category === cat
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-surface text-muted hover:border-accent/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-12 text-center text-muted">
            No tools match “{query}”. Try another search.
          </p>
        ) : (
          <motion.div
            key={`${category}-${query}`}
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((tool) => (
              <motion.div key={tool.slug} variants={fadeUp}>
                <ToolCard tool={tool} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}

function HeroVisual({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="relative mx-auto w-full max-w-sm"
    >
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)]">
        <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="ml-2 font-mono text-xs text-subtle">processing locally</span>
        </div>

        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between rounded-lg border border-line bg-canvas px-3 py-2.5">
            <span className="font-mono text-xs text-muted">vacation.png</span>
            <span className="font-mono text-xs text-subtle">4.2 MB</span>
          </div>

          {/* Animated scan/progress */}
          <div className="relative h-2 overflow-hidden rounded-full bg-canvas">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-accent"
              initial={{ width: "8%" }}
              animate={reduce ? { width: "100%" } : { width: ["8%", "100%", "100%"] }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 2.4, times: [0, 0.6, 1], repeat: Infinity, repeatDelay: 1 }
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-accent/30 bg-accent-soft px-3 py-2.5">
            <span className="font-mono text-xs text-accent-strong">vacation.webp</span>
            <span className="font-mono text-xs font-semibold text-accent-strong">
              1.2 MB · −72%
            </span>
          </div>
        </div>
      </div>

      {/* Floating chips */}
      {!reduce && (
        <>
          <motion.span
            className="absolute -left-5 top-8 rounded-lg border border-line bg-surface px-2.5 py-1 font-mono text-xs text-muted shadow-sm"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            .webp
          </motion.span>
          <motion.span
            className="absolute -right-4 bottom-10 rounded-lg border border-accent/30 bg-accent-soft px-2.5 py-1 font-mono text-xs text-accent-strong shadow-sm"
            animate={{ y: [0, 9, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            on-device
          </motion.span>
        </>
      )}
    </motion.div>
  );
}
