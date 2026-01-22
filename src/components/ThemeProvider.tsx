"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="github-dark"
      enableSystem={false}
      themes={[
        "github-dark",
        "vercel-dark",
        "solarized-dark",
        "midnight-purple",
        "clean-light",
        "nord-light",
        "solarized-light"
      ]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
