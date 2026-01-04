import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import SidebarWrapper from "@/components/SidebarWrapper";
import ToastContainer from "@/components/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gym Coach - Seu Personal Trainer Digital",
  description: "Acompanhe seus treinos, exercícios e progresso",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.variable} ${orbitron.variable} antialiased`}
        style={{
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        <SidebarWrapper />
        <ToastContainer />
        <main 
          className="min-h-screen transition-all duration-300 sidebar-open"
          style={{
            paddingTop: '80px', // Espaço para o header fixo
          }}
      >
        {children}
        </main>
      </body>
    </html>
  );
}
