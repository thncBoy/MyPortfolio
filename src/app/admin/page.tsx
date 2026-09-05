"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { FiFolder, FiEye, FiTrendingUp } from "react-icons/fi";

export default function AdminDashboard() {
  const [projectCount, setProjectCount] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [todayViews, setTodayViews] = useState(0);
  const [dailyData, setDailyData] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Project count
        const projSnap = await getDocs(collection(db, "projects"));
        setProjectCount(projSnap.size);

        // Views
        const viewsRes = await fetch("/api/views");
        if (viewsRes.ok) {
          const data = await viewsRes.json();
          setTotalViews(data.total);
          setTodayViews(data.today);
        }

        // Daily data (last 7 days from pageViews)
        const viewsSnap = await getDocs(collection(db, "pageViews"));
        const days: Record<string, number> = {};
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split("T")[0];
          days[key] = 0;
        }
        viewsSnap.docs.forEach((doc) => {
          const dateStr = doc.data().visitedAt?.split("T")[0];
          if (dateStr && days[dateStr] !== undefined) {
            days[dateStr]++;
          }
        });
        setDailyData(
          Object.entries(days).map(([date, count]) => ({ date, count }))
        );
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxCount = Math.max(...dailyData.map((d) => d.count), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FiFolder size={20} />
            </div>
            <div>
              <p className="text-xs text-muted">Projects</p>
              <p className="text-2xl font-bold">
                {loading ? "—" : projectCount}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <FiEye size={20} />
            </div>
            <div>
              <p className="text-xs text-muted">Total Views</p>
              <p className="text-2xl font-bold">
                {loading ? "—" : totalViews.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
              <FiTrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-muted">Today</p>
              <p className="text-2xl font-bold">
                {loading ? "—" : todayViews}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="glass-card p-6">
        <h2 className="font-semibold mb-4">Views — Last 7 Days</h2>
        {loading ? (
          <div className="h-40 flex items-center justify-center text-muted">
            Loading...
          </div>
        ) : (
          <div className="flex items-end gap-2 h-40">
            {dailyData.map((d) => (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-xs text-muted">{d.count}</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary-light transition-all"
                  style={{
                    height: `${Math.max((d.count / maxCount) * 100, 4)}%`,
                    minHeight: "4px",
                  }}
                />
                <span className="text-[10px] text-muted">
                  {new Date(d.date).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
