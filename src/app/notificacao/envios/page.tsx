import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { NotificationTracking } from "@/components/sites/eagenda-com-br-a1f95f96/notificacao-envios-d5911c19/NotificationTracking";

// Clone of https://eagenda.com.br/notificacao/envios?version=3 (nothing scheduled, like the live account).
export const metadata: Metadata = {
  title: "Acompanhamento de Notificações - Seiri",
  icons: { icon: "/brand/favicon.png" },
};

export default function NotificationTrackingPage() {
  return (
    <DashboardShell title="Acompanhamento de Notificações" email="contato@exemplo.com.br" active="Acompanhamento">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <NotificationTracking />
      </div>
    </DashboardShell>
  );
}
