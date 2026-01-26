"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

export function LandingHero({ user }: { user: User | null }) {
  return (
    <div className="relative overflow-hidden pt-16 pb-20">
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight mb-6">
            Uptime. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
              Latency.
            </span>
            <br className="hidden md:block" /> Incidents.
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="text-base md:text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          ScopeX monitors your APIs, services, and cron jobs on a defined schedule.
          It records every response time, tracks uptime percentages, and automatically
          opens and resolves incidents when things break.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {user ? (
            <Link
              href="/dashboard"
              className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full transition-all hover:scale-105 shadow-lg shadow-primary/20"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full transition-all hover:scale-105 shadow-lg shadow-primary/20"
              >
                Start monitoring for free
              </Link>
              <Link
                href="/login"
                className="border border-border text-foreground font-semibold px-6 py-3 rounded-full transition-all hover:bg-border/50"
              >
                Sign in
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
