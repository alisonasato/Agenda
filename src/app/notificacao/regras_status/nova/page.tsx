import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { StatusRuleForm } from "@/components/sites/eagenda-com-br-a1f95f96/notificacao-regras_status-nova-4ba76ba5/StatusRuleForm";

// Clone of https://eagenda.com.br/notificacao/regras_status/nova?version=3.
export const metadata: Metadata = {
  title: "Criar Regra de Notificação por Status - Seiri",
  icons: { icon: "/brand/favicon.png" },
};

// The live page highlights nothing in the sidebar, hence the empty `active`.
export default function NewStatusRulePage() {
  return (
    <DashboardShell title="Nova Regra por Status" email="contato@exemplo.com.br" active="">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <StatusRuleForm />
      </div>
    </DashboardShell>
  );
}
