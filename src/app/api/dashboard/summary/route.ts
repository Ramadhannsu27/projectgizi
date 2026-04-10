import { NextResponse } from "next/server";
import { students, measurements } from "@/db/schema";
import { getDb } from "@/db";
import { eq, sql, desc, count } from "drizzle-orm";

export async function GET() {
  try {
    const db = getDb();

    // === SCHOOL-LEVEL SUMMARY ===
    const schoolSummary = await db
      .select({
        school_name: students.school_name,
        total_students: count(students.id),
        measured: sql`COUNT(DISTINCT ${measurements.student_id})`,
      })
      .from(students)
      .leftJoin(measurements, eq(students.id, measurements.student_id))
      .groupBy(students.school_name)
      .orderBy(students.school_name);

    // === CLASS-LEVEL SUMMARY ===
    const classSummary = await db
      .select({
        school_name: students.school_name,
        class_name: students.class_name,
        total_students: count(students.id),
        measured: sql`COUNT(DISTINCT ${measurements.student_id})`,
      })
      .from(students)
      .leftJoin(measurements, eq(students.id, measurements.student_id))
      .groupBy(students.school_name, students.class_name)
      .orderBy(students.school_name, students.class_name);

    // Get latest measurement per class (latest status)
    const latestPerClass = await db
      .select({
        school_name: students.school_name,
        class_name: students.class_name,
        status_category: measurements.status_category,
        checked_at: measurements.checked_at,
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
      .orderBy(desc(measurements.checked_at));

    // Map latest status per (school, class)
    const latestStatus: Record<string, string> = {};
    for (const m of latestPerClass) {
      const key = `${m.school_name}::${m.class_name}`;
      if (!latestStatus[key]) {
        latestStatus[key] = m.status_category;
      }
    }

    // Calculate normal percentage per class from all measurements
    const statusPerClass = await db
      .select({
        school_name: students.school_name,
        class_name: students.class_name,
        status_category: measurements.status_category,
        count: count(measurements.id),
      })
      .from(students)
      .innerJoin(measurements, eq(students.id, measurements.student_id))
      .groupBy(students.school_name, students.class_name, measurements.status_category);

    const classStats: Record<string, { normal: number; total: number }> = {};
    for (const s of statusPerClass) {
      const key = `${s.school_name}::${s.class_name}`;
      if (!classStats[key]) {
        classStats[key] = { normal: 0, total: 0 };
      }
      classStats[key].total += Number(s.count);
      if (s.status_category === "Normal") {
        classStats[key].normal += Number(s.count);
      }
    }

    // Calculate school-level stats
    const schoolStats: Record<string, { normal: number; total: number; measured: number; total_students: number }> = {};
    for (const c of schoolSummary) {
      const school = String(c.school_name || "Unknown");
      if (!schoolStats[school]) {
        schoolStats[school] = { normal: 0, total: 0, measured: 0, total_students: 0 };
      }
      schoolStats[school].total_students += Number(c.total_students);
      schoolStats[school].measured += Number(c.measured);
    }

    // Accumulate class stats to school level
    for (const s of statusPerClass) {
      const school = String(s.school_name || "Unknown");
      if (!schoolStats[school]) {
        schoolStats[school] = { normal: 0, total: 0, measured: 0, total_students: 0 };
      }
      schoolStats[school].total += Number(s.count);
      if (s.status_category === "Normal") {
        schoolStats[school].normal += Number(s.count);
      }
    }

    // Get total measured today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 19).replace("T", " ");

    const [todayResult] = await db
      .select({ count: sql`count(*)` })
      .from(measurements)
      .where(sql`${measurements.checked_at} >= ${todayStr}`);

    const [yesterdayResult] = await db
      .select({ count: sql`count(*)` })
      .from(measurements)
      .where(
        sql`${measurements.checked_at} >= DATE_SUB(${todayStr}, INTERVAL 1 DAY) AND ${measurements.checked_at} < ${todayStr}`
      );

    const todayCount = Number(todayResult?.count) || 0;
    const yesterdayCount = Number(yesterdayResult?.count) || 0;
    const todayChange = yesterdayCount > 0
      ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100)
      : todayCount > 0 ? 100 : 0;

    // Format class-level data
    const formattedClasses = classSummary.map((c) => {
      const key = `${c.school_name}::${c.class_name}`;
      const stats = classStats[key] || { normal: 0, total: 0 };
      const normalPercent = stats.total > 0
        ? Math.round((stats.normal / stats.total) * 100)
        : 0;
      const latest = latestStatus[key] || "Belum Diperiksa";
      const measured = Number(c.measured);
      const total = Number(c.total_students);
      const progressPercent = total > 0 ? Math.round((measured / total) * 100) : 0;

      return {
        school_name: String(c.school_name || "Unknown"),
        class_name: c.class_name,
        total_students: total,
        measured,
        normal_percent: normalPercent,
        status: latest,
        progress: progressPercent,
      };
    });

    // Format school-level data
    const formattedSchools = schoolSummary.map((s) => {
      const school = String(s.school_name || "Unknown");
      const stats = schoolStats[school] || { normal: 0, total: 0, measured: 0, total_students: 0 };
      const normalPercent = stats.total > 0
        ? Math.round((stats.normal / stats.total) * 100)
        : 0;
      const measured = stats.measured;
      const total = Number(s.total_students);
      const progressPercent = total > 0 ? Math.round((measured / total) * 100) : 0;

      return {
        school_name: school,
        total_students: total,
        measured,
        normal_percent: normalPercent,
        progress: progressPercent,
      };
    });

    return NextResponse.json({
      classes: formattedClasses,
      schools: formattedSchools,
      today_change: todayChange,
      today_total: todayCount,
    });
  } catch (error) {
    console.error("Summary error:", error);
    return NextResponse.json({ classes: [], schools: [], today_change: 0, today_total: 0 });
  }
}
