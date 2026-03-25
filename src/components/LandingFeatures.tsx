"use client";

import { motion } from "framer-motion";

const FEATURES = [
  {
    n: "01",
    title: "Endpoint Monitoring",
    desc: "Add any URL with a method and check interval. ScopeX pings it continuously and records every response code and latency value.",
  },
  {
    n: "02",
    title: "Latency History",
    desc: "Every single request is stored. You get a 24h latency chart per endpoint — see where slowdowns happen before your users do.",
  },
  {
    n: "03",
    title: "Incident Management",
    desc: "A failed check opens an incident automatically. When the endpoint recovers, it closes itself. Duration and error context are stored.",
  },
  {
    n: "04",
    title: "Aggregate Overview",
    desc: "One dashboard. Total uptime %, average latency across all endpoints, open incident count, and endpoint-level status at a glance.",
  },
  {
    n: "05",
    title: "Public Status Pages",
    desc: "Build trust with your users. Share beautiful, auto-updating status pages that display your historical uptime and recent incidents.",
  },
  {
    n: "06",
    title: "Alerting Integrations",
    desc: "Never miss a downtime event. Get notified instantly via Email, Slack, or custom Webhooks the second an endpoint goes offline.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export function LandingFeatures() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-sm font-mono uppercase tracking-widest text-muted mb-3">
          Everything you need
        </h2>
        <h3 className="text-2xl md:text-4xl font-bold text-foreground">
          Built for modern engineering teams.
        </h3>
      </div>

      <motion.div
        variants={container as any}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {FEATURES.map((f) => (
          <motion.div
            key={f.n}
            variants={item as any}
            className="group border border-border rounded-2xl p-6 bg-card hover:bg-background transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-6xl font-black italic">{f.n}</span>
            </div>
            <div className="font-mono text-sm text-accent mb-4 font-bold">{f.n}</div>
            <h4 className="text-lg font-bold text-foreground mb-2 relative z-10">{f.title}</h4>
            <p className="text-sm text-muted leading-relaxed relative z-10">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
