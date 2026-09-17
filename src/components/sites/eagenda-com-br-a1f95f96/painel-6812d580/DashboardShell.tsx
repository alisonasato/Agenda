"use client";

import { useEffect, useState, type ReactNode } from "react";
import { FooterBar } from "./FooterBar";
import { HelpCenter } from "./HelpCenter";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const DESKTOP = "(min-width: 1024px)";

type DashboardShellProps = { title: string; email: string; children: ReactNode };

// Page frame: fixed sidebar + topbar/main/footer column. The toggle collapses the
// sidebar on desktop (body.sidebar-collapsed) and slides it in on mobile (.mobile-open).
export function DashboardShell({ title, email, children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
  }, [collapsed]);

  const toggle = () => {
    if (window.matchMedia(DESKTOP).matches) setCollapsed((c) => !c);
    else setMobileOpen((o) => !o);
  };

  return (
    <>
      <div className="flex flex-row items-stretch w-full min-h-screen">
        <div className="sidebar-container">
          <div
            id="sidebarOverlay"
            className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 lg:hidden ${mobileOpen ? "opacity-100" : "opacity-0 hidden"}`}
            onClick={() => setMobileOpen(false)}
          />
          <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        </div>
        <div id="mainContent" className="flex-1 flex flex-col min-h-screen transition-all duration-300">
          <Topbar title={title} email={email} onToggleSidebar={toggle} />
          <main className="flex-1 bg-[#F7F9FB]">
            <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">{children}</div>
          </main>
          <FooterBar />
        </div>
      </div>
      <HelpCenter />
    </>
  );
}
