import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { WhatsappTemplates } from "@/components/sites/eagenda-com-br-a1f95f96/notificacao-whatsapp_template-d74ae14b/WhatsappTemplates";

// Clone of https://eagenda.com.br/notificacao/whatsapp_template?version=3 (no templates yet, like the live account).
export const metadata: Metadata = {
  title: "Modelos de WhatsApp - Seiri",
  icons: { icon: "/brand/favicon.png" },
};

// Not in the sidebar menu (reached from the Comunicação shortcuts); the live page highlights nothing.
export default function WhatsappTemplatesPage() {
  return (
    <DashboardShell title="Modelos de WhatsApp" email="contato@exemplo.com.br" active="">
      <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
        <WhatsappTemplates />
      </div>
    </DashboardShell>
  );
}
