"use client";

import { useState } from "react";
import { createStatusPage } from "./actions";

export function AddStatusPageModal() {
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    await createStatusPage(formData);
    setIsOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-primary hover:bg-primary-hover text-foreground text-sm font-semibold px-4 py-2 rounded-md transition-colors"
      >
        New status page
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-[420px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-background">
              <h3 className="font-semibold text-foreground">Create Status Page</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-foreground transition-colors text-sm"
              >
                Close
              </button>
            </div>

            <form action={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Title
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  URL Slug
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-background text-muted text-sm">
                    scopex.app/status/
                  </span>
                  <input
                    name="slug"
                    type="text"
                    required
                    pattern="[a-z0-9-]+"
                    title="Only lowercase letters, numbers, and hyphens"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-r-md text-foreground text-sm placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Description <span className="text-muted font-normal">(optional)</span>
                </label>
                <textarea
                  name="description"
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-none"
                />
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

