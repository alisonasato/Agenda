import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { Webhooks } from "@/components/sites/eagenda-com-br-a1f95f96/webhook-webhook-config-414c38f8/Webhooks";

// Clone of https://eagenda.com.br/webhook/webhook-config/?version=3 — "Webhooks".
export const metadata: Metadata = {
  title: "Webhooks - Seiri",
};

export default function WebhooksRoute() {
  return (
    <DashboardShell title="Webhooks" email="contato@exemplo.com.br" active="Integrações">
      <Webhooks />
    </DashboardShell>
  );
}
