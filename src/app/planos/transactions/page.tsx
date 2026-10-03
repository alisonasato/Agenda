import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { CoinTransactions } from "@/components/sites/eagenda-com-br-a1f95f96/planos-transactions-c4495e75/CoinTransactions";

// Clone of https://eagenda.com.br/planos/transactions/?version=3 (no balance and no movements, like the live account).
export const metadata: Metadata = {
  title: "Detalhes de AgendaCoins - Seiri",
};

export default function CoinTransactionsRoute() {
  return (
    <DashboardShell title="Detalhes de AgendaCoins" email="contato@exemplo.com.br" active="Planos">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <CoinTransactions />
      </div>
    </DashboardShell>
  );
}
