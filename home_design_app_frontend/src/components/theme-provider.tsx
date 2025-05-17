"use client"
// import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Определим тип ThemeProviderProps локально, вместо импорта из next-themes/dist/types
interface ThemeProviderProps {
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
  themes?: string[];
  forcedTheme?: string;
}

export function ThemeProvider({
  children,
  ...props
}: { children: React.ReactNode } & ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}