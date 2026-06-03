import { useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard.js";
import { DataEntry } from "./pages/DataEntry.js";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: "/data-entry",
    label: "Data Entry",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
      </svg>
    ),
  },
];

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-cream-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "gov-sidebar shadow-sidebar transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Logo / Seal area */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gov-accent/30 flex items-center justify-center ring-1 ring-white/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div>
            <div className="font-display text-white text-[0.95rem] font-semibold leading-tight">
              ESG Platform
            </div>
            <div className="text-[0.7rem] text-gov-300 mt-0.5 tracking-wide">
              Official Government Portal
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <div className="px-3 mb-3">
            <span className="text-[0.65rem] font-bold tracking-[0.12em] uppercase text-gov-400">
              Navigation
            </span>
          </div>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-gov-accent/25 text-white"
                    : "text-gov-300 hover:text-white hover:bg-white/8",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? "text-gold-400" : "text-gov-400"}>
                    {item.icon}
                  </span>
                  {item.label}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <div className="text-[0.68rem] text-gov-500 leading-relaxed">
            © {new Date().getFullYear()} Government of India<br />
            Environmental, Social & Governance
          </div>
        </div>
      </aside>

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:ml-[260px] min-w-0">
        {/* Top header bar */}
        <header className="sticky top-0 z-20 bg-cream-50/90 backdrop-blur-sm border-b border-[#d8e8e0] px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 rounded-md text-gov-700 hover:bg-gov-50 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex items-center gap-2 lg:hidden">
            <span className="font-display text-gov-900 font-semibold text-sm">ESG Platform</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-gov-600">
            <span className="w-2 h-2 rounded-full bg-gov-accent inline-block animate-pulse" />
            Live reporting portal
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-gov-600 bg-gov-50 border border-gov-200 rounded-full px-3 py-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              Official User
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/data-entry" element={<DataEntry />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#d8e8e0] px-4 sm:px-6 lg:px-8 py-3 text-[0.72rem] text-gov-500 flex items-center justify-between">
          <span>Government ESG Data Platform — Official Use Only</span>
          <span className="hidden sm:inline">Secure · Verified · Compliant</span>
        </footer>
      </div>
    </div>
  );
}
