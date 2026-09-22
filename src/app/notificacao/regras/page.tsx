import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { NotificationRules } from "@/components/sites/eagenda-com-br-a1f95f96/notificacao-regras-9c9175db/NotificationRules";

// Clone of https://eagenda.com.br/notificacao/regras?version=3 (no rules and no credits, like the live account).
export const metadata: Metadata = {
  title: "Regras de Notificações - Seiri",
};

export default function NotificationRulesPage() {
  return (
    <DashboardShell title="Regras de Notificação" email="contato@exemplo.com.br" active="Regras de Notificação">
      <div className="mx-auto w-full max-w-[1550px] px-4 py-8 sm:px-6 lg:px-10 min-w-0">
        <NotificationRules />
      </div>
    </DashboardShell>
  );
}
