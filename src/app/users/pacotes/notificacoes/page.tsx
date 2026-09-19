import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { NotificationPackages } from "@/components/sites/eagenda-com-br-a1f95f96/users-pacotes-notificacoes-8a6149e5/NotificationPackages";

// Clone of https://eagenda.com.br/users/pacotes/notificacoes/?version=3 (no credits or purchases, like the live account).
export const metadata: Metadata = {
  title: "Pacotes de Notificações - Seiri",
  icons: { icon: "/brand/favicon.png" },
};

export default function NotificationPackagesPage() {
  return (
    <DashboardShell title="Pacotes de Notificações" email="contato@exemplo.com.br" active="Pacotes de Envio">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <NotificationPackages />
      </div>
    </DashboardShell>
  );
}
