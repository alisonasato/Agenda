"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardShell } from "../shared/DashboardShell";
import { UnitForm } from "./UnitForm";
import { UnitsList } from "./UnitsList";

/** The units list, or the "Nova Unidade" form with `?action=create` (same URL as the original). */
export function UnitsPageBody({ create }: { create: boolean }) {
  return (
    <DashboardShell title={create ? "Nova Unidade" : "Administrar Unidades"} email="contato@exemplo.com.br" active="Administrar Unidades">
      {create ? (
        <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
          <UnitForm />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1550px] px-4 py-8 sm:px-6 lg:px-10 min-w-0">
          <UnitsList />
        </div>
      )}
    </DashboardShell>
  );
}

/** Reads the query in the browser, so the route can be a static page (GitHub Pages). */
export function UnitsRoute() {
  const create = useSearchParams().get("action") === "create";
  // The static page carries the list's <title>, which Next re-applies after hydration: keep ours.
  useEffect(() => {
    if (!create) return;
    const title = "Nova Unidade - Seiri";
    const keep = () => {
      if (document.title !== title) document.title = title;
    };
    keep();
    const observer = new MutationObserver(keep);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [create]);
  return <UnitsPageBody create={create} />;
}
