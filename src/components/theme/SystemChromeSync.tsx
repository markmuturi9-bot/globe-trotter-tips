import { useEffect, useLayoutEffect } from "react";
import { useTheme } from "next-themes";
import { isNative, getPlatform, setNativeStatusBarTheme } from "@/lib/capacitor";

// Keep these in sync with our design tokens in src/index.css
// These MUST match the CSS --background values for light/dark themes
const LIGHT_CHROME = "#fcfcfc"; // hsl(0 0% 99%) - light theme background
const DARK_CHROME = "#0b0b10"; // hsl(240 10% 6%) - dark theme background
const BRIK_CHROME = "#0f1f1d"; // hsl(170 20% 7%) - BRIK theme background

function setMetaThemeColor(color: string) {
  // Update all theme-color meta tags (both media-query variants)
  const metas = document.querySelectorAll<HTMLMetaElement>("meta[name='theme-color']");
  metas.forEach((m) => m.setAttribute("content", color));
}

function setRootBackgroundColor(color: string) {
  // Set background on html element - this is what iOS uses for the "notch" area
  document.documentElement.style.backgroundColor = color;
  document.body.style.backgroundColor = color;
}

export function SystemChromeSync() {
  const { resolvedTheme } = useTheme();

  // Use useLayoutEffect to apply colors before paint, reducing flicker
  useLayoutEffect(() => {
    const isBrik = document.documentElement.classList.contains("theme-brik");
    const theme = resolvedTheme === "dark" ? "dark" : "light";
    const color = isBrik ? BRIK_CHROME : theme === "dark" ? DARK_CHROME : LIGHT_CHROME;

    // 1. Set the root background color (affects iOS notch area)
    setRootBackgroundColor(color);

    // 2. Update meta theme-color tags (affects browser chrome)
    setMetaThemeColor(color);

    // 3. Native status bar configuration (affects icon colors on native apps)
    if (isNative()) {
      setNativeStatusBarTheme(theme).catch((err) => {
        console.warn("Failed to sync status bar theme:", err);
      });
    }
  }, [resolvedTheme]);

  return null;
}
