import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = user.user_metadata?.name || undefined;

  return (
    <div className="min-h-screen bg-background flex flex-col relative pt-4">
      {/* Background gradients for aesthetics (optional, subtle) */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/5 via-background to-background" />

      {/* Floating Pill Header */}
      <Header userEmail={user.email!} userName={name} />

      {/* Main content */}
      <main className="flex-1 w-full max-w-7xl mx-auto pt-8 pb-12 px-6 relative z-10">
        {children}
      </main>
    </div>
  );
}

