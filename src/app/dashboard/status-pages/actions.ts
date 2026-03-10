"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createStatusPage(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authorized" };

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;

  const { error } = await supabase.from("status_pages").insert({
    user_id: user.id,
    title,
    slug,
    description,
  });

  if (error) {
    console.error("Error creating status page:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/status-pages");
  return { success: true };
}
