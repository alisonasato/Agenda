import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { Integrations } from "@/components/sites/eagenda-com-br-a1f95f96/integracoes-526c97c5/Integrations";

// Clone of https://eagenda.com.br/integracoes/?version=3 (nothing connected, like the live account).
export const metadata: Metadata = {
  title: "Integrações e Apps - Seiri",
  icons: { icon: "/brand/favicon.png" },
};

export default function IntegrationsPage() {
  return (
    <DashboardShell title="Integrações e Apps" email="contato@exemplo.com.br" active="Integrações">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <Integrations />
      </div>
    </DashboardShell>
  );
}
