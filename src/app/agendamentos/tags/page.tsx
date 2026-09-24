import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { TagsPage } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-tags-4fec7fdc/TagsPage";

// Clone of https://eagenda.com.br/agendamentos/tags/?version=3 (an account with no tags).
export const metadata: Metadata = {
  title: "Tags - Seiri",
};

export default function TagsRoute() {
  return (
    <DashboardShell title="Tags" email="contato@exemplo.com.br" active="Tags">
      <TagsPage />
    </DashboardShell>
  );
}
