import {
  defaultTheme,
  themeStyle,
  themeTokens,
  type ThemeTokens,
} from "@ai-ecosystem/brand";

export { themeStyle };

export const themes = {
  knowledge: defaultTheme,
  northstar: themeTokens.parse({
    primary: "#173b57",
    accent: "#b45309",
    surface: "#f5f2eb",
    surfaceRaised: "#fffdf8",
    text: "#17242e",
    textMuted: "#52616b",
    border: "#c9c2b4",
    focus: "#075985",
    success: "#347044",
    warning: "#9a5b05",
    danger: "#a33131",
  }),
} satisfies Record<string, ThemeTokens>;
export type ThemeName = keyof typeof themes;
export function isThemeName(value: string): value is ThemeName {
  return value in themes;
}
