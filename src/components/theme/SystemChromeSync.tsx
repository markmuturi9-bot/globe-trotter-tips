import { useEffect } from "react";
import { useTheme } from "next-themes";
import { isNative, getPlatform, setNativeStatusBarTheme } from "@/lib/capacitor";

// Keep these in sync with our design tokens in src/index.css
// (We keep explicit hex here because theme-color + native status bar APIs require hex colors.)
const LIGHT_CHROME = "#fcfcfc"; // close to hsl(0 0% 99%)
const DARK_CHROME = "#0b0b10"; // close to hsl(240 10% 6%)

function setMetaThemeColor(color: string) {
  const metas = document.querySelectorAll<HTMLMetaElement>("meta[name='theme-color']");
  metas.forEach((m) => m.setAttribute("content", color));
}

export function SystemChromeSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const theme = resolvedTheme === "dark" ? "dark" : "light";
    const color = theme === "dark" ? DARK_CHROME : LIGHT_CHROME;

    // Browser UI / notch fill
    setMetaThemeColor(color);

    // Native status bar (Android background + icon color)
    if (isNative()) {
      setNativeStatusBarTheme(theme).catch(() => {
        // no-op; we don't want theme sync to crash the app
      });

      // Android overscroll glow color is influenced by theme on some devices.
      // Ensuring root background is correct is the important part.
      if (getPlatform() === "android") {
        document.documentElement.style.backgroundColor = color;
        document.body.style.backgroundColor = color;
      }
    }
  }, [resolvedTheme]);

  return null;
}
