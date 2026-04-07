import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import SWRegistration from "@/components/sw-registration";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "MBG — Pemantauan Status Gizi Siswa",
  description:
    "Platform pemantauan status gizi siswa berbasis MBG & WHO 2007 dengan fitur offline dan QR Code.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    other: {
      url: "/icon.svg",
      type: "image/svg+xml",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme');
                if (!theme) {
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                document.documentElement.classList.add(theme);
              })();
            `,
          }}
        />
      </head>
      <body className={`${nunito.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster position="top-center" richColors closeButton />
        <SWRegistration />
      </body>
    </html>
  );
}
