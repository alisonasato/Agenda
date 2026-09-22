import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { AppSetup } from "@/components/sites/eagenda-com-br-a1f95f96/users-gerar-qrcode-config-ab0876a9/AppSetup";

// Clone of https://eagenda.com.br/users/gerar-qrcode-config/?version=3 (QR code replaced with a mock one).
export const metadata: Metadata = {
  title: "Aplicativo - Seiri",
};

export default function AppSetupPage() {
  return (
    <DashboardShell title="Aplicativo" email="contato@exemplo.com.br" active="Aplicativo">
      <AppSetup />
    </DashboardShell>
  );
}
