import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from '@/context/theme-context';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: "Proxy Manager Dashboard",
  description: "Caddy reverse proxy management dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
