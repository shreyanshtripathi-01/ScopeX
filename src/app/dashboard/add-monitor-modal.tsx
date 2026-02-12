"use client";

import { useState } from "react";
import { createMonitor } from "./actions";

export function AddMonitorModal() {
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    await createMonitor(formData);
    setIsOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-primary hover:bg-primary-hover text-foreground text-sm font-semibold px-4 py-2 rounded-md transition-colors"
      >
        New monitor
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-[420px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-background">
              <h3 className="font-semibold text-foreground">Create new monitor</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-foreground transition-colors"
              >
                Close
              </button>
            </div>

            <form action={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Endpoint URL
                </label>
                <input
                  name="url"
                  type="url"
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    HTTP Method
                  </label>
                  <select
                    name="method"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Check interval
                  </label>
                  <div className="relative">
                    <input
                      name="interval"
                      type="number"
                      defaultValue={5}
                      min={1}
                      max={60}
                      required
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                    />
                    <span className="absolute right-3 top-2 text-muted text-sm pointer-events-none">
                      mins
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#c9d1d9] bg-muted/20 border border-border hover:bg-[#30363d] hover:border-[#8b949e] transition-colors rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-foreground bg-primary hover:bg-primary-hover transition-colors rounded-md"
                >
                  Create monitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

