"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Email not confirmed")) {
      redirect("/login?message=Check your email to confirm your account before signing in.");
    }
    redirect("/login?message=Invalid email or password.");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });

  if (error) {
    if (error.message.includes("already registered")) {
      redirect("/login?message=An account with this email already exists.");
    }
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  // If email confirmation is disabled in Supabase, session is available immediately
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  // Email confirmation is enabled — tell the user
  redirect("/login?message=Account created! Check your email to confirm before signing in.");
}
