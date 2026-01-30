"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Palette,
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Radio,
  Bell,
  Settings,
  LogOut,
  ChevronDown
} from "lucide-react";

export function Header({ userEmail, userName }: { userEmail?: string; userName?: string }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const NAV = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/monitors", label: "Monitors" },
    { href: "/dashboard/incidents", label: "Incidents" },
    { href: "/dashboard/status-pages", label: "Status Pages" },
    { href: "/dashboard/alerts", label: "Alerts" },
  ];

  const displayName = userName || userEmail || "User";

  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-[1200px] h-14 flex items-center justify-between px-6 backdrop-blur-2xl rounded-full border-2 border-border bg-background/60 shadow-lg">
      
      {/* Logo */}
      <Link href="/" className="text-lg font-bold text-foreground">
        Scope<span className="text-accent">X</span>
      </Link>

      {/* Nav Links */}
      <nav className="hidden md:flex items-center gap-6">
        {NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isActive ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right Side */}
      <div className="flex items-center gap-4 relative">
        {/* Theme Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              setShowThemeMenu(!showThemeMenu);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-full text-muted hover:bg-border/50 hover:text-foreground transition-colors"
          >
            <Palette className="w-4 h-4" />
          </button>
          
          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden py-1 z-50">
              <button onClick={() => { setTheme("github-dark"); setShowThemeMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-background transition-colors">GitHub Dark</button>
              <button onClick={() => { setTheme("vercel-dark"); setShowThemeMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-background transition-colors">Vercel Dark</button>
              <button onClick={() => { setTheme("clean-light"); setShowThemeMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-background transition-colors">Clean Light</button>
              <button onClick={() => { setTheme("solarized-dark"); setShowThemeMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-background transition-colors">Solarized Dark</button>
              <button onClick={() => { setTheme("midnight-purple"); setShowThemeMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-background transition-colors">Midnight Purple</button>
            </div>
          )}
        </div>

        {/* User Dropdown or Auth Buttons */}
        {userEmail ? (
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowThemeMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:bg-border/50 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold uppercase">
                {displayName.charAt(0)}
              </div>
              <span className="text-sm font-medium text-foreground max-w-[120px] truncate hidden sm:block">
                {displayName}
              </span>
              <ChevronDown className="w-4 h-4 text-muted" />
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden py-1 z-50">
                <div className="px-4 py-2 border-b border-border mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted truncate">{userEmail}</p>
                </div>
                <Link href="/dashboard/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-foreground hover:bg-background transition-colors">
                  <Settings className="w-4 h-4" /> Settings
                </Link>
                <form action="/auth/signout" method="post">
                  <button type="submit" className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-danger hover:bg-background transition-colors">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-muted hover:text-foreground transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link href="/login" className="text-sm font-semibold text-white bg-primary hover:bg-primary-hover px-4 py-1.5 rounded-full transition-colors">
              Get started
            </Link>
          </div>
        )}
      </div>

    </header>
  );
}
