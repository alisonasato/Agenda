"use client";

import { useEffect, useState, type ReactNode } from "react";
import { FooterBar } from "./FooterBar";
import { HelpCenter, PAINEL_HELP, type HelpItem } from "./HelpCenter";
import { MenuIcon } from "./icons";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const DESKTOP = "(min-width: 1024px)";

type DashboardShellProps = {
  /** Topbar left content: a plain title or a custom header (calendar). */
  title?: string;
  header?: ReactNode;
  email: string;
  /** Sidebar entry marked as the current page. */
  active: string;
  /** Calendar mode: 72px icon rail that expands on hover (html.cal-sidebar-peek). */
  peek?: boolean;
  /** Tutorials listed in the floating help button. */
  helpItems?: HelpItem[];
  children: ReactNode;
};

// Page frame: fixed sidebar + topbar/main/footer column. The toggle collapses the
// sidebar on desktop (body.sidebar-collapsed) and slides it in on mobile (.mobile-open).
export function DashboardShell({ title, header, email, active, peek = false, helpItems = PAINEL_HELP, children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
  }, [collapsed]);

  const openMobile = () => setMobileOpen(true);
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
          <Sidebar active={active} peek={peek} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        </div>
        <div id="mainContent" className="flex-1 flex flex-col min-h-screen transition-all duration-300">
          <Topbar title={title} header={header} email={email} onToggleSidebar={toggle} />
          <main className="flex-1 bg-[#F7F9FB]">{children}</main>
          <FooterBar />
        </div>
      </div>
      {peek && (
        <button
          type="button"
          onClick={openMobile}
          aria-label="Abrir menu"
          className="lg:hidden fixed top-3 left-3 z-[60] w-10 h-10 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-gray-700"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
      )}
      <HelpCenter items={helpItems} />
    </>
  );
}
