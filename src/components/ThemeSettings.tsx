"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const themes = [
    {
      id: "github-dark",
      name: "GitHub Dark",
      desc: "Classic dark mode.",
      bg: "#0d1117",
      color: "#58a6ff",
      isLight: false
    },
    {
      id: "vercel-dark",
      name: "Vercel Dark",
      desc: "Pitch black minimal.",
      bg: "#000000",
      color: "#ffffff",
      isLight: false
    },
    {
      id: "solarized-dark",
      name: "Solarized Dark",
      desc: "Soft teal navy.",
      bg: "#002b36",
      color: "#268bd2",
      border: "#073642",
      isLight: false
    },
    {
      id: "midnight-purple",
      name: "Midnight Purple",
      desc: "Deep dark purple.",
      bg: "#0f0a1f",
      color: "#c084fc",
      border: "#2a1f3d",
      isLight: false
    },
    {
      id: "clean-light",
      name: "Clean Light",
      desc: "Pure white, sharp text.",
      bg: "#ffffff",
      color: "#171717",
      border: "#e5e5e5",
      isLight: true
    },
    {
      id: "nord-light",
      name: "Nord Light",
      desc: "Sleek slate, soft grey.",
      bg: "#eceff4",
      color: "#5e81ac",
      border: "#d8dee9",
      isLight: true
    },
    {
      id: "solarized-light",
      name: "Solarized Light",
      desc: "Warm cream & teal.",
      bg: "#fdf6e3",
      color: "#b58900",
      border: "#eee8d5",
      isLight: true
    }
  ];

  return (
    <section className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-background/50">
        <h2 className="text-base font-semibold text-foreground">Appearance</h2>
        <p className="text-xs text-muted mt-1">Change how ScopeX looks across all your devices.</p>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              style={{ backgroundColor: t.bg, borderColor: t.border || t.bg }}
              className={`text-left p-4 rounded-lg relative group overflow-hidden border-2 transition-all ${
                theme === t.id ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : "hover:scale-[1.02]"
              }`}
            >
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-mono" style={{ color: t.color }}>{t.bg}</span>
              </div>
              <h3 className="font-semibold" style={{ color: t.isLight ? "#171717" : "#ffffff" }}>{t.name}</h3>
              <p className="text-xs mt-1" style={{ color: t.isLight ? "#555555" : "#8b949e" }}>{t.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
