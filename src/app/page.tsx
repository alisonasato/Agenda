import type { Metadata } from "next";
import { AgendasSection } from "@/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/AgendasSection";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/DashboardShell";
import { KpiCards } from "@/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/KpiCards";
import { OnboardingChecklist } from "@/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/OnboardingChecklist";
import { TrendChart } from "@/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/TrendChart";
import { UsageCards } from "@/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/UsageCards";

// Clone of https://eagenda.com.br/painel/?version=3 — account data replaced with mock values.
export const metadata: Metadata = {
  title: "Painel de Controle - eAgenda",
  icons: { icon: "/sites/eagenda-com-br-a1f95f96/shared/images/favicon.png" },
};

export default function Home() {
  return (
    <DashboardShell title="Minha Empresa" email="contato@exemplo.com.br">
      <OnboardingChecklist />
      <KpiCards />
      <TrendChart />
      <UsageCards />
      <AgendasSection />
    </DashboardShell>
  );
}
