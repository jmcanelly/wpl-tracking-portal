import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    // Validate inputs
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !serviceKey) {
      console.error("Missing Supabase env vars");
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }

    // Server-side admin client
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // 🔒 Check allowlist - user MUST be authorized
    const { data: allowed, error: allowErr } = await admin
      .from("allowed_users")
      .select("email, is_active, customer_id")
      .eq("email", email)
      .maybeSingle();

    if (allowErr) {
      console.error("Allowlist lookup error:", allowErr);
      return NextResponse.json(
        { error: "Unable to verify authorization. Please contact support." },
        { status: 500 }
      );
    }

    if (!allowed || !allowed.is_active) {
      return NextResponse.json(
        { error: "This email is not authorized. Please contact WPL for access." },
        { status: 403 }
      );
    }

    // ✅ User is authorized - create their account
    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since we control the allowlist
    });

    if (authErr) {
      // Check if user already exists
      if (authErr.message.includes("already registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in instead." },
          { status: 400 }
        );
      }
      
      console.error("User creation error:", authErr);
      return NextResponse.json(
        { error: authErr.message || "Unable to create account." },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      ok: true,
      message: "Account created successfully."
    });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
