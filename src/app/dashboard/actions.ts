"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createMonitor(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  const method = formData.get("method") as string;
  const interval = parseInt(formData.get("interval") as string);

  const { error } = await supabase.from("monitors").insert({
    user_id: user.id,
    name,
    url,
    method,
    interval_minutes: interval,
  });

  if (error) {
    console.error("Failed to create monitor:", error);
    throw new Error("Failed to create monitor");
  }

  revalidatePath("/dashboard");
}
