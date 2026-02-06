import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // force Node runtime (not Edge)

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    // Server-side admin client (safe)
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // 🔐 Check allowlist
    const { data: allowed, error: allowErr } = await admin
      .from("allowed_users")
      .select("email, is_active, customer_id")
      .eq("email", email)
      .maybeSingle();

    if (allowErr) {
      return NextResponse.json(
        { error: "Allowlist lookup failed." },
        { status: 500 }
      );
    }

    if (!allowed || !allowed.is_active) {
      return NextResponse.json(
        { error: "This email is not authorized. Please contact WPL." },
        { status: 403 }
      );
    }

    // 📧 Send magic link
    const redirectBase =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { error: otpErr } = await admin.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${redirectBase}/auth/callback`,
      },
    });

    if (otpErr) {
      return NextResponse.json(
        { error: otpErr.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
