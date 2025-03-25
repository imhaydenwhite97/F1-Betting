"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Simple approach that avoids needing to import types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ThemeProvider({ children, ...props }: React.PropsWithChildren<any>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
