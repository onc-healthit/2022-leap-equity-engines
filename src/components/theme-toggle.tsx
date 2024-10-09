"use client";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { Moon, Sun } from "lucide-react";

// Import this dynamically since the children of this Button are dynamic.
const Button = dynamic(() => import("@healthlab/ui").then((mod) => mod.Button), {
  ssr: false,
});

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const onChangeTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button variant="outline" size="icon" onClick={onChangeTheme}>
      {resolvedTheme === "dark" ? <Moon width={16} /> : <Sun width={16} />}
    </Button>
  );
}
