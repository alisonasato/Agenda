import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { ReferralProgram } from "@/components/sites/eagenda-com-br-a1f95f96/users-referrals-4c73c9db/ReferralProgram";

// Clone of https://eagenda.com.br/users/referrals/?version=3 (no referrals yet; mock link code).
export const metadata: Metadata = {
  title: "Programa de Indicações - Seiri",
};

export default function ReferralsRoute() {
  return (
    <DashboardShell title="Programa de Indicações" email="contato@exemplo.com.br" active="Programa de Indicações">
      <ReferralProgram />
    </DashboardShell>
  );
}
