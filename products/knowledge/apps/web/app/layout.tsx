import type { Metadata } from "next";
import { defaultTheme, themeStyle } from "@ai-ecosystem/brand";
import "@ai-ecosystem/brand/foundation.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "Knowledge knowledge",
  description: "Read-only governed knowledge console",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="knowledge" style={themeStyle(defaultTheme)}>
      <body>{children}</body>
    </html>
  );
}
