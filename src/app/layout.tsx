import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "ScopeX. %s",
    default: "ScopeX. | Infrastructure Monitoring",
  },
  description:
    "ScopeX is a developer-first uptime monitoring platform. We ping your APIs, websites, and cron jobs every minute and alert you the second something breaks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${firaCode.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full font-sans antialiased bg-background text-foreground selection:bg-foreground selection:text-background transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

