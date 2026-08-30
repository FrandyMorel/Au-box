import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";


const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "UA-Box",
  description: "Plataforma de gestión de automatizaciones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={roboto.className}>
        {children}
      </body>
    </html>
  );
}