import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider"
// import { ThemeProvider } from "next-themes";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Wazend - Sistema de Autenticación",
  description: "Sistema robusto de autenticación con NextAuth y Strapi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <body
        className={`antialiased bg-background text-foreground ${inter.variable}`}
      >
        <ThemeProvider 
        attribute="class" 
        defaultTheme="dark" 
        enableSystem
        disableTransitionOnChange
        >
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
