import { NextResponse } from "next/server";

// In-memory fallback when Firebase is not configured
let memoryViews: { sessionId: string; visitedAt: string }[] = [];

async function getFirestore() {
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    // Quick check: will throw if not configured
    if (!process.env.FIREBASE_ADMIN_PROJECT_ID) throw new Error("Not configured");
    return adminDb;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const db = await getFirestore();

    if (db) {
      // Check if session already exists
      const existing = await db
        .collection("pageViews")
        .where("sessionId", "==", sessionId)
        .limit(1)
        .get();

      if (existing.empty) {
        await db.collection("pageViews").add({
          sessionId,
          visitedAt: new Date().toISOString(),
        });
      }
    } else {
      // In-memory fallback
      if (!memoryViews.find((v) => v.sessionId === sessionId)) {
        memoryViews.push({
          sessionId,
          visitedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Views POST error:", error);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await getFirestore();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    if (db) {
      const allViews = await db.collection("pageViews").get();
      const total = allViews.size;
      const todayCount = allViews.docs.filter(
        (doc) => doc.data().visitedAt >= todayStr
      ).length;

      return NextResponse.json({ total, today: todayCount });
    } else {
      // In-memory fallback
      const total = memoryViews.length;
      const todayCount = memoryViews.filter(
        (v) => v.visitedAt >= todayStr
      ).length;

      return NextResponse.json({ total, today: todayCount });
    }
  } catch (error) {
    console.error("Views GET error:", error);
    return NextResponse.json({ total: 0, today: 0 });
  }
}
