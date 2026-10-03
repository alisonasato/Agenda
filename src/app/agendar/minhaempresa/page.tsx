import { Suspense } from "react";
import type { Metadata } from "next";
import { BookingPage } from "@/components/sites/eagenda-com-br-a1f95f96/agendar-801a49a9/BookingPage";
import "../booking.css";

// Clone of https://eagenda.com.br/agendar/<org>/ — the page a client opens from an agenda's link.
export const metadata: Metadata = {
  title: "Minha Empresa — Agendamento Online",
  description: "Agende online com Minha Empresa",
  robots: { index: false },
};

export default function PublicBookingRoute() {
  return (
    <main>
      {/* The static HTML is the landing; ?agenda=<identificador> is applied in the browser. */}
      <Suspense>
        <BookingPage />
      </Suspense>
    </main>
  );
}
