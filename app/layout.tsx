import type { Metadata } from "next";
import { Fira_Sans, Fira_Code } from "next/font/google";
import "./globals.css";
import { TITULO, SUBTITULO } from "./site";

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: TITULO,
  description: SUBTITULO,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${firaSans.variable} ${firaCode.variable} h-full`}>
      <body className="min-h-full">
        <a href="#tablero" className="saltar">Saltar al tablero</a>
        {children}
      </body>
    </html>
  );
}
