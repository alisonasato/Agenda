import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { OrgSettings } from "@/components/sites/eagenda-com-br-a1f95f96/users-organization-business-b98cda0a/OrgSettings";

// Clone of https://eagenda.com.br/users/organization/business/?version=3 ("Configurações Gerais",
// the sidebar's Conta › Dados da Conta). The eight steps are the original's htmx partials.
export const metadata: Metadata = {
  title: "Configurações Gerais - Seiri",
  icons: { icon: "/brand/favicon.png" },
};

export default function OrgSettingsPage() {
  return (
    <DashboardShell title="Configurações Gerais" email="contato@exemplo.com.br" active="Dados da Conta">
      <div id="page-content" className="relative mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <OrgSettings />
      </div>
    </DashboardShell>
  );
}
