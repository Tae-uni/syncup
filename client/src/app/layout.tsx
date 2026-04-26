import type { Metadata } from "next";
import { Toaster } from "sonner";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "SyncUp",
  description: "No sign-ups. Just create a Sync, share the link, and let everyone vote.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className={GeistSans.className}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
