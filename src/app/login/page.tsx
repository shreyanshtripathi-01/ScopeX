"use client";

import { login, signup } from "./actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function AuthForm() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-bold text-foreground">
          Scope<span className="text-accent">X</span>
        </Link>
        <p className="text-muted text-sm mt-2">
          {mode === "login"
            ? "Sign in to your account"
            : "Create a new account"}
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        {message && (
          <div className="mb-5 px-4 py-3 bg-[#da3633]/10 border border-[#da3633]/30 rounded-md">
            <p className="text-sm text-danger">{message}</p>
          </div>
        )}

        <form className="space-y-4">
          {mode === "signup" && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required={mode === "signup"}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
            />
          </div>

          {mode === "login" ? (
            <button
              formAction={login}
              className="w-full bg-primary hover:bg-primary-hover text-foreground font-semibold py-2 rounded-md transition-colors text-sm mt-2"
            >
              Sign in
            </button>
          ) : (
            <button
              formAction={signup}
              className="w-full bg-primary hover:bg-primary-hover text-foreground font-semibold py-2 rounded-md transition-colors text-sm mt-2"
            >
              Create account
            </button>
          )}
        </form>
      </div>

      <p className="text-center text-sm text-muted mt-5">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="text-accent hover:underline font-medium"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-accent hover:underline font-medium"
            >
              Sign in
            </button>
          </>
        )}
      </p>

      <p className="text-center text-xs text-muted mt-4">
        <Link href="/" className="hover:text-foreground transition-colors">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="relative w-full max-w-sm">
        <Suspense fallback={null}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}

