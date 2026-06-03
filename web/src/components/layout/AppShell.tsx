import { Outlet } from "react-router-dom";
import { ShellProvider } from "../../context/ShellContext.js";
import { SmoothScrollProvider } from "./SmoothScrollProvider.js";
import { Sidebar } from "./Sidebar.js";
import { TopBar } from "./TopBar.js";

export function AppShell() {
  return (
    <SmoothScrollProvider>
      <ShellProvider>
        <div className="flex min-h-screen bg-[var(--background)]">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <main className="scroll-themed flex-1 p-4 sm:p-5 lg:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </ShellProvider>
    </SmoothScrollProvider>
  );
}
