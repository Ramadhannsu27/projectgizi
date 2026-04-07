import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  let email = "";
  let password = "";

  try {
    const body = await request.json();
    email = body.email;
    password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const db = getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Generate simple JWT-like token (for demo, using base64)
    const token = Buffer.from(
      JSON.stringify({
        id: user.id,
        email: user.email,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      })
    ).toString("base64");

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    // Fallback: allow demo login if DB not configured
    if (email === "ramadhanstark05@gmail.com" && password === "admin") {
      const token = Buffer.from(
        JSON.stringify({
          id: 1,
          email,
          exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
        })
      ).toString("base64");
      return NextResponse.json({
        token,
        user: {
          id: 1,
          full_name: "Admin UKS",
          email,
        },
      });
    }
    return NextResponse.json(
      { error: "Login gagal. Periksa kredensial Anda." },
      { status: 401 }
    );
  }
}
