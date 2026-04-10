import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { measurements } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pending } = body as {
      pending: Array<{
        id: string;
        student_id: number;
        height: number;
        weight: number;
        bmi: number;
        status_category: string;
        z_score: string;
        notes: string | null;
        saved_at: string;
      }>;
    };

    if (!pending || !Array.isArray(pending)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const db = getDb();
    const results: { id: string; serverId?: number; success: boolean }[] = [];

    for (const item of pending) {
      try {
        const result = await db
          .insert(measurements)
          .values({
            student_id: item.student_id,
            user_id: 1,
            height: item.height.toString(),
            weight: item.weight.toString(),
            bmi: item.bmi.toString(),
            z_score: item.z_score || "0",
            status_category: item.status_category || "Normal",
            notes: item.notes || null,
            is_synced: true,
            checked_at: item.saved_at ? new Date(item.saved_at) : new Date(),
          });

        const insertId = (result as unknown as { insertId: number }).insertId;
        results.push({ id: item.id, serverId: insertId, success: true });
      } catch {
        results.push({ id: item.id, success: false });
      }
    }

    return NextResponse.json({
      synced: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync gagal" }, { status: 500 });
  }
}
