import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { WhatsAppActivation } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-configurar-whatsapp-ativacao-d543fc15/WhatsAppActivation";

// Clone of https://eagenda.com.br/agendamentos/configurar/whatsapp-ativacao/?version=3 — "Ativar WhatsApp".
export const metadata: Metadata = {
  title: "Ativar WhatsApp - Seiri",
};

export default function WhatsAppActivationRoute() {
  return (
    <DashboardShell title="Ativar WhatsApp" email="contato@exemplo.com.br" active="Configuração">
      <WhatsAppActivation />
    </DashboardShell>
  );
}
