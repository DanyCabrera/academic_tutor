import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-google-sans",
});

export const metadata: Metadata = {
  title: "Academic Tutor",
  description: "Cuaderno de estudio con RAG, audio y quizzes — estilo NotebookLM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={roboto.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
