import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { students, measurements } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export async function GET() {
  try {
    const db = getDb();

    // Total students
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(students);
    const totalSiswa = Number(totalResult?.count) || 0;

    // Today's start in YYYY-MM-DD HH:MM:SS format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 19).replace("T", " ");

    // Today's unique students measured
    const [todayResult] = await db
      .select({ count: sql<number>`count(DISTINCT student_id)` })
      .from(measurements)
      .where(sql`${measurements.checked_at} >= ${todayStr}`);
    const diperiksaHariIni = Number(todayResult?.count) || 0;

    // Status distribution based on latest measurement per student
    const latestPerStudent = await db
      .select({
        status: measurements.status_category,
        count: sql<number>`count(*)`,
      })
      .from(students)
      .innerJoin(measurements, eq(students.id, measurements.student_id))
      .innerJoin(
        sql`(
          SELECT student_id, MAX(checked_at) as max_date
          FROM measurements
          GROUP BY student_id
        ) as latest`,
        sql`latest.student_id = ${measurements.student_id} AND latest.max_date = ${measurements.checked_at}`
      )
      .groupBy(measurements.status_category);

    const totalMeasured = latestPerStudent.reduce(
      (sum: number, d: typeof latestPerStudent[number]) => sum + Number(d.count),
      0
    );
    const normalCount = Number(
      latestPerStudent.find(
        (d: typeof latestPerStudent[number]) => d.status === "Normal"
      )?.count || 0
    );
    const perluPerhatian =
      latestPerStudent
        .filter(
          (d: typeof latestPerStudent[number]) =>
            d.status === "Obesitas" ||
            d.status === "Overweight" ||
            d.status === "Stunting" ||
            d.status === "Stunting Berat"
        )
        .reduce(
          (sum: number, d: typeof latestPerStudent[number]) => sum + Number(d.count),
          0
        ) || 0;
    const persentaseNormal =
      totalMeasured > 0
        ? Math.round((normalCount / totalMeasured) * 100)
        : 0;

    return NextResponse.json({
      totalSiswa,
      diperiksaHariIni,
      persentaseNormal,
      perluPerhatian,
      distribution: latestPerStudent.map((d) => ({ status: d.status, count: d.count })),
      // Breakdown for laporan page
      total: totalMeasured,
      normal: normalCount,
      overweight: Number(
        latestPerStudent.find((d) => d.status === "Overweight")?.count || 0
      ),
      obesitas: Number(
        latestPerStudent.find((d) => d.status === "Obesitas")?.count || 0
      ),
      stunting: Number(
        latestPerStudent.find((d) => d.status === "Stunting")?.count || 0
      ),
      severe_stunting: Number(
        latestPerStudent.find((d) => d.status === "Stunting Berat")?.count || 0
      ),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({
      totalSiswa: 0,
      diperiksaHariIni: 0,
      persentaseNormal: 0,
      perluPerhatian: 0,
      distribution: [],
    });
  }
}
