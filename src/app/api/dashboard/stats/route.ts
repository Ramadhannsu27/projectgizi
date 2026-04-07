import { NextResponse } from "next/server";
import { students, measurements } from "@/db/schema";
import { getDb } from "@/db";
import { eq, sql, gte } from "drizzle-orm";

export async function GET() {
  try {
    const db = getDb();

    // Total students
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(students);
    const totalSiswa = Number(totalResult?.count) || 0;

    // Today's start (midnight) in YYYY-MM-DD HH:MM:SS format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 19).replace("T", " ");

    // Today's measurements
    const [todayResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(measurements)
      .where(gte(measurements.checked_at, sql`${todayStr}`));
    const diperiksaHariIni = Number(todayResult?.count) || 0;

    // Status distribution
    const distribution = await db
      .select({
        status: measurements.status_category,
        count: sql<number>`count(*)`,
      })
      .from(measurements)
      .groupBy(measurements.status_category);

    const totalMeasured = distribution.reduce(
      (sum: number, d: typeof distribution[number]) => sum + Number(d.count),
      0
    );
    const normalCount = Number(
      distribution.find(
        (d: typeof distribution[number]) => d.status === "Normal"
      )?.count || 0
    );
    const perluPerhatian =
      distribution
        .filter(
          (d: typeof distribution[number]) =>
            d.status === "Obesitas" ||
            d.status === "Overweight" ||
            d.status === "Stunting" ||
            d.status === "Stunting Berat"
        )
        .reduce(
          (sum: number, d: typeof distribution[number]) => sum + Number(d.count),
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
      distribution,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({
      totalSiswa: 0,
      diperiksaHariIni: 0,
      persentaseNormal: 0,
      perluPerhatian: 0,
      distribution: [],
    });
  }
}
