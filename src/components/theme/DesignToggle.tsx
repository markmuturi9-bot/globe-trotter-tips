import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "tipit-design";
const THEME_CLASS = "theme-brik";

export function DesignToggle() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "brik") {
      document.documentElement.classList.add(THEME_CLASS);
      setActive(true);
    }
  }, []);

  const toggle = () => {
    const next = !active;
    setActive(next);
    if (next) {
      document.documentElement.classList.add(THEME_CLASS);
      localStorage.setItem(STORAGE_KEY, "brik");
    } else {
      document.documentElement.classList.remove(THEME_CLASS);
      localStorage.setItem(STORAGE_KEY, "default");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-xl"
      onClick={toggle}
      aria-label={active ? "Switch to original design" : "Switch to BRIK design"}
    >
      <Palette className={`w-5 h-5 ${active ? "text-primary" : ""}`} aria-hidden="true" />
    </Button>
  );
}
