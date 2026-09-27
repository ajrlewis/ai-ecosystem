import type { Metadata } from "next";
import type { ReactNode } from "react";
import { defaultTheme, themeStyle } from "@ai-ecosystem/brand";
import "@ai-ecosystem/brand/foundation.css";
import "./styles.css";

export const metadata: Metadata = {
  title: "Agent",
  description: "The agent runtime for AI Ecosystem",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-theme="default" style={themeStyle(defaultTheme)}>
      <body>{children}</body>
    </html>
  );
}
