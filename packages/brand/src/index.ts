import { z } from "zod";

const safeColor = z
  .string()
  .regex(
    /^(#[0-9a-fA-F]{6}|(rgb|hsl)a?\([\d\s.,%/-]+\))$/,
    "unsafe CSS colour",
  );

export const themeTokens = z.object({
  primary: safeColor,
  accent: safeColor,
  surface: safeColor,
  surfaceRaised: safeColor,
  text: safeColor,
  textMuted: safeColor,
  border: safeColor,
  focus: safeColor,
  success: safeColor,
  warning: safeColor,
  danger: safeColor,
});

export type ThemeTokens = z.infer<typeof themeTokens>;

export const defaultTheme = themeTokens.parse({
  primary: "#334155",
  accent: "#0f766e",
  surface: "#f8fafc",
  surfaceRaised: "#ffffff",
  text: "#0f172a",
  textMuted: "#475569",
  border: "#cbd5e1",
  focus: "#2563eb",
  success: "#15803d",
  warning: "#a16207",
  danger: "#b91c1c",
}) satisfies ThemeTokens;

export type ThemeStyle = Record<`--${string}`, string>;

export function themeStyle(theme: ThemeTokens): ThemeStyle {
  return Object.fromEntries(
    Object.entries(theme).map(([key, value]) => [
      `--${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
      value,
    ]),
  ) as ThemeStyle;
}
