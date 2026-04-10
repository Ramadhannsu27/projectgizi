import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { measurements, students } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: measurementId } = await params;
    const db = getDb();
    const body = await request.json();
    const id = parseInt(measurementId);

    // Check if measurement exists
    const [existing] = await db
      .select()
      .from(measurements)
      .where(eq(measurements.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Data pemeriksaan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Recalculate status if height or weight changed
    let status_category = existing.status_category;
    let zScore = existing.z_score || "0";

    try {
      const calcRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/calculate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: existing.student_id,
            height: body.height ?? parseFloat(existing.height),
            weight: body.weight ?? parseFloat(existing.weight),
          }),
        }
      );
      if (calcRes.ok) {
        const calc = await calcRes.json();
        status_category = calc.status || status_category;
        zScore = calc.zScore?.toString() || zScore;
      }
    } catch {
      // Keep existing values
    }

    const newHeight = body.height ?? parseFloat(existing.height);
    const newWeight = body.weight ?? parseFloat(existing.weight);
    const bmi = newWeight / Math.pow(newHeight / 100, 2);

    // Instead of updating, INSERT a new record to preserve history
    // The old record stays as history, new record becomes the current one
    const result = await db
      .insert(measurements)
      .values({
        student_id: existing.student_id,
        user_id: existing.user_id,
        height: newHeight.toString(),
        weight: newWeight.toString(),
        bmi: bmi.toFixed(2),
        z_score: zScore,
        status_category,
        notes: body.notes !== undefined ? body.notes : existing.notes,
        is_synced: true,
      });

    const newId = (result as unknown as { insertId: number }).insertId;

    return NextResponse.json({
      success: true,
      message: "Data berhasil diperbarui — Riwayat lama tetap disimpan",
      newId,
    });
  } catch (error) {
    console.error("PUT measurement error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: measurementId } = await params;
    const db = getDb();

    const [result] = await db
      .select({
        id: measurements.id,
        student_id: students.id,
        student_name: students.full_name,
        student_nis: students.nis,
        student_class: students.class_name,
        student_school_name: students.school_name,
        student_gender: students.gender,
        student_birth_date: students.birth_date,
        parent_name: students.parent_name,
        height: measurements.height,
        weight: measurements.weight,
        bmi: measurements.bmi,
        z_score: measurements.z_score,
        status: measurements.status_category,
        notes: measurements.notes,
        checked_at: measurements.checked_at,
      })
      .from(measurements)
      .innerJoin(students, eq(measurements.student_id, students.id))
      .where(eq(measurements.id, parseInt(measurementId)))
      .limit(1);

    if (!result) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    // Get all history for this student
    const history = await db
      .select({
        id: measurements.id,
        height: measurements.height,
        weight: measurements.weight,
        bmi: measurements.bmi,
        z_score: measurements.z_score,
        status_category: measurements.status_category,
        notes: measurements.notes,
        checked_at: measurements.checked_at,
      })
      .from(measurements)
      .innerJoin(students, eq(measurements.student_id, students.id))
      .where(eq(students.id, Number(result.student_id)))
      .orderBy(desc(measurements.checked_at));

    const formatted = {
      id: result.id,
      student_id: Number(result.student_id),
      student_name: result.student_name,
      student_nis: result.student_nis,
      student_class: result.student_class,
      student_school_name: result.student_school_name,
      student_gender: result.student_gender,
      student_birth_date: result.student_birth_date,
      parent_name: result.parent_name,
      height: parseFloat(result.height as string),
      weight: parseFloat(result.weight as string),
      bmi: parseFloat(result.bmi as string),
      z_score: parseFloat((result.z_score as string) || "0"),
      status: result.status,
      notes: result.notes,
      checked_at: result.checked_at,
      history: history.map((h) => ({
        id: h.id,
        height: parseFloat(h.height as string),
        weight: parseFloat(h.weight as string),
        bmi: parseFloat(h.bmi as string),
        z_score: parseFloat((h.z_score as string) || "0"),
        status: h.status_category,
        notes: h.notes,
        checked_at: h.checked_at,
      })),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET measurement error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const measurementId = parseInt(id);

    const [existing] = await db
      .select()
      .from(measurements)
      .where(eq(measurements.id, measurementId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Data pemeriksaan tidak ditemukan" },
        { status: 404 }
      );
    }

    await db.delete(measurements).where(eq(measurements.id, measurementId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE measurement error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data" },
      { status: 500 }
    );
  }
}
