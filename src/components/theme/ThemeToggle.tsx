import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-xl relative"
          aria-label="Change theme"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
          <span className="sr-only">Change theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="gap-2 cursor-pointer"
          aria-label="Use light theme"
        >
          <Sun className="h-4 w-4" aria-hidden="true" />
          <span>Light</span>
          {theme === "light" && <span className="ml-auto text-primary" aria-hidden="true">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="gap-2 cursor-pointer"
          aria-label="Use dark theme"
        >
          <Moon className="h-4 w-4" aria-hidden="true" />
          <span>Dark</span>
          {theme === "dark" && <span className="ml-auto text-primary" aria-hidden="true">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="gap-2 cursor-pointer"
          aria-label="Use system theme"
        >
          <Monitor className="h-4 w-4" aria-hidden="true" />
          <span>System</span>
          {theme === "system" && <span className="ml-auto text-primary" aria-hidden="true">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}