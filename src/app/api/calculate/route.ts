import { NextResponse } from "next/server";
import { calculateNutritionStatus } from "@/lib/calculations/who2007";
import { getDb } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { student_id, height, weight } = await request.json();

    if (!student_id || !height || !weight) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    let gender: "L" | "P" = "L";
    let birthDate = new Date().toISOString();

    try {
      const db = getDb();
      const [student] = await db
        .select()
        .from(students)
        .where(eq(students.id, student_id))
        .limit(1);

      if (student) {
        gender = student.gender as "L" | "P";
        const bd = student.birth_date as unknown as string;
        birthDate = bd.includes("T")
          ? new Date(bd).toISOString()
          : `${bd}T00:00:00.000Z`;
      }
    } catch {
      // DB not ready — use defaults
    }

    const result = calculateNutritionStatus(
      parseFloat(height),
      parseFloat(weight),
      birthDate,
      gender
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Calculate error:", error);
    return NextResponse.json(
      { error: "Gagal menghitung status gizi" },
      { status: 500 }
    );
  }
}
