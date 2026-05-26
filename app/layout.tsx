import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agenda Facil | Agenda online para negocios de servicos",
  description: "Site, cadastro guiado e painel de agenda online para barbearias, saloes, esmalterias, estetica e petshops.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
