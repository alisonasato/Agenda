import type { Metadata } from "next";
import { AgendasSection } from "@/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/AgendasSection";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { KpiCards } from "@/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/KpiCards";
import { OnboardingChecklist } from "@/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/OnboardingChecklist";
import { TrendChart } from "@/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/TrendChart";
import { UsageCards } from "@/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/UsageCards";

// Clone of https://eagenda.com.br/painel/?version=3 — account data replaced with mock values.
export const metadata: Metadata = {
  title: "Painel de Controle - Seiri",
  icons: { icon: "/brand/favicon.png" },
};

export default function Home() {
  return (
    <DashboardShell title="Minha Empresa" email="contato@exemplo.com.br" active="Painel">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <OnboardingChecklist />
      <KpiCards />
      <TrendChart />
      <UsageCards />
      <AgendasSection />
      </div>
    </DashboardShell>
  );
}
