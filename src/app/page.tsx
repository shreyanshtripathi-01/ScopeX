import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Header } from "@/components/Header";
import { LandingHero } from "@/components/LandingHero";
import { LandingFeatures } from "@/components/LandingFeatures";

export const revalidate = 0;

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-foreground selection:text-background transition-colors duration-300">
      <div className="pt-4 px-4">
        <Header userEmail={user?.email} userName={user?.user_metadata?.name} />
      </div>

      <main>
        <LandingHero user={user} />
        <LandingFeatures />
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12 bg-card">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-xl font-bold text-foreground">
            Scope<span className="text-accent">X</span>
          </span>
          <div className="flex gap-8 text-sm text-muted font-medium">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Register
            </Link>
          </div>
          <span className="text-xs text-muted font-mono">
            © {new Date().getFullYear()} ScopeX INC.
          </span>
        </div>
      </footer>
    </div>
  );
}

