import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ ok: true }); // Fail silently on config issues
    }

    // Get the Bearer token from the request
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (!token) {
      // No token provided, just return success
      return NextResponse.json({ ok: true });
    }

    // Create Supabase client with the user's token
    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // Sign out the user (invalidates the token)
    await supabase.auth.signOut();

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Even on error, return success to avoid blocking the client-side redirect
    console.error("Sign out error:", error);
    return NextResponse.json({ ok: true });
  }
}
