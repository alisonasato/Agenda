import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { StatusRules } from "@/components/sites/eagenda-com-br-a1f95f96/notificacao-regras_status-226ec629/StatusRules";

// Clone of https://eagenda.com.br/notificacao/regras_status?version=3 (no rules and no credits, like the live account).
export const metadata: Metadata = {
  title: "Notificações por Status - Seiri",
};

export default function StatusRulesPage() {
  return (
    <DashboardShell title="Notificações por Status" email="contato@exemplo.com.br" active="Notificações por Status">
      <div className="min-w-0">
        <StatusRules />
      </div>
    </DashboardShell>
  );
}
