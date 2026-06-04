import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  GLOSSARY_CATEGORY_LABELS,
  GLOSSARY_ENTRIES,
  searchGlossary,
  type GlossaryCategory,
  type GlossaryEntry,
} from "../../lib/glossary.js";
import { backdropTransition, drawerTransition } from "../../lib/motion.js";
import { cn } from "../../lib/cn.js";
import { useShell } from "../../context/ShellContext.js";

const CATEGORY_ORDER: GlossaryCategory[] = [
  "core",
  "environmental",
  "workflow",
  "analytics",
  "technical",
];

function groupByCategory(entries: GlossaryEntry[]) {
  const groups = new Map<GlossaryCategory, GlossaryEntry[]>();
  for (const cat of CATEGORY_ORDER) {
    groups.set(cat, []);
  }
  for (const entry of entries) {
    groups.get(entry.category)?.push(entry);
  }
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: GLOSSARY_CATEGORY_LABELS[category],
    entries: (groups.get(category) ?? []).sort((a, b) =>
      a.term.localeCompare(b.term),
    ),
  })).filter((g) => g.entries.length > 0);
}

export function GlossarySidebar() {
  const { glossaryOpen, closeGlossary } = useShell();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => searchGlossary(GLOSSARY_ENTRIES, query),
    [query],
  );
  const groups = useMemo(() => groupByCategory(filtered), [filtered]);

  useEffect(() => {
    if (!glossaryOpen) {
      setQuery("");
      return;
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeGlossary();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [glossaryOpen, closeGlossary]);

  return (
    <AnimatePresence>
      {glossaryOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close glossary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
            className="fixed inset-0 z-[45] bg-black/35 backdrop-blur-[1px]"
            onClick={closeGlossary}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="glossary-sidebar-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={drawerTransition}
            className="fixed inset-y-0 right-0 z-50 flex w-[min(420px,92vw)] flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl will-change-transform"
          >
            <header className="shrink-0 border-b border-[var(--border)] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2
                    id="glossary-sidebar-title"
                    className="text-base font-semibold text-[var(--text)]"
                  >
                    Terms & definitions
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    Search acronyms, metrics, and platform words
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeGlossary}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition hover:text-[var(--text)]"
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <label className="relative mt-3 block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search ESG, GHG, RAG, draft…"
                  className="input-field pl-9"
                  autoFocus
                />
              </label>
            </header>

            <div className="scroll-themed min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                  No terms match &ldquo;{query}&rdquo;.
                </p>
              )}

              <div className="space-y-6">
                {groups.map(({ category, label, entries }) => (
                  <section key={category}>
                    <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                      {label}
                    </h3>
                    <ul className="space-y-3">
                      {entries.map((entry) => (
                        <li
                          key={entry.term}
                          className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3"
                        >
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="text-sm font-bold text-[var(--text)]">
                              {entry.term}
                            </span>
                            <span className="text-xs text-[var(--text-muted)]">
                              {entry.fullForm}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
                            {entry.definition}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>

            <footer className="shrink-0 border-t border-[var(--border)] px-4 py-3 text-center text-[10px] text-[var(--text-subtle)]">
              Full page and component detail:{" "}
              <span className={cn("font-medium text-[var(--text-muted)]")}>
                ESG-PLATFORM-GUIDE.md
              </span>{" "}
              in the repo
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
