import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { NotificationsInbox } from "@/components/sites/eagenda-com-br-a1f95f96/inbox-notifications-list-89be791e/NotificationsInbox";

// Clone of https://eagenda.com.br/inbox/notifications/list/?version=3 — the topbar's "Ver Todos".
export const metadata: Metadata = {
  title: "Notificações - Seiri",
};

export default function NotificationsInboxRoute() {
  return (
    <DashboardShell title="Notificações" email="contato@exemplo.com.br" active="">
      <NotificationsInbox />
    </DashboardShell>
  );
}
