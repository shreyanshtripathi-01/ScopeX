import { createClient } from "@/utils/supabase/server";
import { updateProfile } from "./actions";
import { ThemeSettings } from "@/components/ThemeSettings";

export const revalidate = 0;

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <div className="space-y-10 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted mt-1">Manage your profile and app preferences.</p>
      </div>

      {/* Profile Section */}
      <section className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-background/50">
          <h2 className="text-base font-semibold text-foreground">Profile</h2>
          <p className="text-xs text-muted mt-1">Update your personal details.</p>
        </div>
        
        <form action={updateProfile} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input 
              type="email" 
              value={user.email} 
              disabled 
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-muted text-sm cursor-not-allowed opacity-70"
            />
            <p className="text-xs text-muted mt-1">Your email cannot be changed.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
            <input 
              type="text"
              name="fullName"
              defaultValue={user.user_metadata?.name || ""}
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>
          
          <div className="pt-2">
            <button type="submit" className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors">
              Save Profile
            </button>
          </div>
        </form>
      </section>

      {/* Theme Engine Section */}
      <ThemeSettings />
    </div>
  );
}
