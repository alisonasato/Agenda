import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { AccountProfile } from "@/components/sites/eagenda-com-br-a1f95f96/accounts-profile-fbf80fa7/AccountProfile";

// Clone of https://eagenda.com.br/accounts/profile/ — the signed-in user's own account page.
export const metadata: Metadata = {
  title: "Sua Conta - Seiri",
};

export default function AccountProfileRoute() {
  return (
    <DashboardShell title="Sua Conta" email="contato@exemplo.com.br" active="">
      <AccountProfile />
    </DashboardShell>
  );
}
