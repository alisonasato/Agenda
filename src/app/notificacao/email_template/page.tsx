import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { EmailTemplates } from "@/components/sites/eagenda-com-br-a1f95f96/notificacao-email_template-5993b09f/EmailTemplates";

// Clone of https://eagenda.com.br/notificacao/email_template?version=3 (no templates yet, like the live account).
export const metadata: Metadata = {
  title: "Modelos de Email - Seiri",
};

export default function EmailTemplatesPage() {
  return (
    <DashboardShell title="Modelos de Email" email="contato@exemplo.com.br" active="Modelos de Email">
      <div className="mx-auto w-full max-w-[1550px] px-4 py-8 sm:px-6 lg:px-10 min-w-0">
        <EmailTemplates />
      </div>
    </DashboardShell>
  );
}
