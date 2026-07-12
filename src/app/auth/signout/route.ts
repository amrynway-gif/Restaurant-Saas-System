import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  // Clear the admin_subdomain cookie if it exists
  const cookieStore = await cookies();
  cookieStore.delete("admin_subdomain");

  const url = new URL(request.url);
  return NextResponse.redirect(`${url.origin}/login`, { status: 302 });
}
