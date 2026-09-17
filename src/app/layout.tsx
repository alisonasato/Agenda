import type { Metadata } from "next";
import "./globals.css";
import "./eagenda.css";

export const metadata: Metadata = {
  title: "eAgenda",
  description: "Pixel-perfect clone of the eAgenda dashboard",
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
