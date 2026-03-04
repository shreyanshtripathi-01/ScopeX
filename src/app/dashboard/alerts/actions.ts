"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createAlertIntegration(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authorized" };

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const target = formData.get("target") as string;

  const { error } = await supabase.from("alert_integrations").insert({
    user_id: user.id,
    name,
    type,
    target,
  });

  if (error) {
    console.error("Error creating alert integration:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/alerts");
  return { success: true };
}
