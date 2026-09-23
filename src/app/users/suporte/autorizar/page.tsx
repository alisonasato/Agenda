import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { SupportAccess } from "@/components/sites/eagenda-com-br-a1f95f96/users-suporte-autorizar-20543ce7/SupportAccess";

// Clone of https://eagenda.com.br/users/suporte/autorizar/?version=3 (the code is generated locally).
export const metadata: Metadata = {
  title: "Autorizar Suporte - Seiri",
};

export default function SupportAccessPage() {
  return (
    <DashboardShell title="Autorizar Suporte" email="contato@exemplo.com.br" active="Autorizar Suporte">
      <SupportAccess />
    </DashboardShell>
  );
}
