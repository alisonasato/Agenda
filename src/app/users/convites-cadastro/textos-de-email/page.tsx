import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { InviteEmailTexts } from "@/components/sites/eagenda-com-br-a1f95f96/users-convites-cadastro-textos-de-email-1f34dfa2/InviteEmailTexts";

// Clone of https://eagenda.com.br/users/convites-cadastro/textos-de-email/?version=3 — "Textos do convite".
export const metadata: Metadata = {
  title: "Textos do convite - Seiri",
};

export default function InviteEmailTextsRoute() {
  return (
    <DashboardShell title="Textos do convite" email="contato@exemplo.com.br" active="Convites de Cadastro">
      <InviteEmailTexts />
    </DashboardShell>
  );
}
