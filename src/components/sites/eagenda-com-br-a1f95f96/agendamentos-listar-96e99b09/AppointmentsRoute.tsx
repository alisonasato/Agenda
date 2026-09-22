"use client";

import { useSearchParams } from "next/navigation";
import { DashboardShell } from "../shared/DashboardShell";
import { AppointmentsList } from "./AppointmentsList";

/** The page for a given query; `?status=PENDING&interval=all` is the sidebar's "Confirmar Agendamentos". */
export function AppointmentsPageBody({ status, interval }: { status: string; interval: string }) {
  return (
    <DashboardShell title="Listar Agendamentos" email="contato@exemplo.com.br" active={status === "PENDING" ? "Confirmar Agendamentos" : "Agendamentos"}>
      <div className="mx-auto w-full max-w-[1550px] px-4 sm:px-6 lg:px-10 py-8 min-w-0">
        <AppointmentsList initialStatus={status} initialPreset={interval === "all" ? "Todos os períodos" : "Próximos 7 dias"} />
      </div>
    </DashboardShell>
  );
}

/** Reads the query in the browser, so the route can be a static page (GitHub Pages). */
export function AppointmentsRoute() {
  const params = useSearchParams();
  return <AppointmentsPageBody status={params.get("status") ?? ""} interval={params.get("interval") ?? ""} />;
}
