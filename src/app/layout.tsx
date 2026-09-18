import type { Metadata } from "next";
import "./globals.css";
import "./eagenda.css";

export const metadata: Metadata = {
  title: "Seiri",
  description: "Seiri — painel de agendamentos",
  icons: { icon: "/brand/favicon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className="min-h-screen flex flex-row">{children}</body>
    </html>
  );
}
