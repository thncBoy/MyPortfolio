import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Upsert — ignore if session already exists
    await supabaseAdmin
      .from("page_views")
      .upsert(
        { session_id: sessionId, visited_at: new Date().toISOString() },
        { onConflict: "session_id", ignoreDuplicates: true }
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Views POST error:", error);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    // Total views
    const { count: total } = await supabaseAdmin
      .from("page_views")
      .select("*", { count: "exact", head: true });

    // Today views
    const { count: todayCount } = await supabaseAdmin
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .gte("visited_at", todayStr);

    return NextResponse.json({
      total: total || 0,
      today: todayCount || 0,
    });
  } catch (error) {
    console.error("Views GET error:", error);
    return NextResponse.json({ total: 0, today: 0 });
  }
}
