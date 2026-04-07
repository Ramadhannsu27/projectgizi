import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { measurements, students } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Public endpoint - no auth required so students/parents can view results via QR
  try {
    const { id: measurementId } = await params;
    const db = getDb();

    const [result] = await db
      .select({
        id: measurements.id,
        student_name: students.full_name,
        student_nis: students.nis,
        student_class: students.class_name,
        student_gender: students.gender,
        student_birth_date: students.birth_date,
        parent_name: students.parent_name,
        height: measurements.height,
        weight: measurements.weight,
        bmi: measurements.bmi,
        z_score: measurements.z_score,
        status: measurements.status_category,
        status_variant: sql<string>`CASE
          WHEN ${measurements.status_category} = 'Normal' THEN 'normal'
          WHEN ${measurements.status_category} = 'Obesitas' THEN 'obesitas'
          WHEN ${measurements.status_category} = 'Overweight' THEN 'overweight'
          WHEN ${measurements.status_category} = 'Stunting' THEN 'stunting'
          WHEN ${measurements.status_category} = 'Stunting Berat' THEN 'severely_stunting'
          ELSE 'secondary'
        END`.as("status_variant"),
        bg_color: sql<string>`CASE
          WHEN ${measurements.status_category} = 'Normal' THEN 'bg-green-50'
          WHEN ${measurements.status_category} = 'Obesitas' THEN 'bg-red-50'
          WHEN ${measurements.status_category} = 'Overweight' THEN 'bg-amber-50'
          WHEN ${measurements.status_category} = 'Stunting' THEN 'bg-orange-50'
          WHEN ${measurements.status_category} = 'Stunting Berat' THEN 'bg-orange-100'
          ELSE 'bg-slate-50'
        END`.as("bg_color"),
        recommendation: sql<string>`CASE
          WHEN ${measurements.status_category} = 'Normal' THEN 'Kondisi gizi anak ini baik dan sesuai dengan standar WHO 2007. Pertahankan pola makan seimbang dan aktivitas fisik teratur.'
          WHEN ${measurements.status_category} = 'Obesitas' THEN 'Anak mengalami obesitas yang memerlukan penanganan segera. Segera konsultasikan ke dokter atau ahli gizi untuk rencana diet dan olahraga yang sesuai.'
          WHEN ${measurements.status_category} = 'Overweight' THEN 'Perlu perhatian khusus. Disarankan untuk meningkatkan aktivitas fisik dan mengurangi makanan tinggi gula dan lemak.'
          WHEN ${measurements.status_category} = 'Stunting' THEN 'Anak mengalami stunting. Perbaiki asupan gizi dengan memperbanyak makanan kaya protein, zat besi, dan zinc.'
          WHEN ${measurements.status_category} = 'Stunting Berat' THEN 'Kondisi stunting berat memerlukan intervensi segera. Segera konsultasikan ke dokter dan ahli gizi.'
          ELSE 'Silakan konsultasikan hasil ini dengan tenaga kesehatan.'
        END`.as("recommendation"),
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

    return NextResponse.json({
      ...result,
      bmi: parseFloat(result.bmi),
      z_score: parseFloat(result.z_score || "0"),
      height: parseFloat(result.height),
      weight: parseFloat(result.weight),
    });
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

    // Check if measurement exists first
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
      { error: "Gagal menghapus data. Pastikan koneksi database aktif." },
      { status: 500 }
    );
  }
}
