import type { Metadata } from "next";
import { CalendarIsland } from "@/components/sites/eagenda-com-br-a1f95f96/agendamentos-calendar-18078-85bcf86b/CalendarIsland";
import "./calendar.css";

// Clone of https://eagenda.com.br/agendamentos/calendar/18078/?calendars=18078&version=3
// (agenda data replaced with mock values).
export const metadata: Metadata = {
  title: "Calendário - Seiri",
};

export default function CalendarPage() {
  return <CalendarIsland />;
}
