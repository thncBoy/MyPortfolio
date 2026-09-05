"use client";

import { useEffect, useState } from "react";

export default function ViewCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const trackView = async () => {
      try {
        // Check if already tracked this session
        let sessionId = localStorage.getItem("portfolio_session_id");
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          localStorage.setItem("portfolio_session_id", sessionId);

          // Record new view
          await fetch("/api/views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
        }

        // Fetch total count
        const res = await fetch("/api/views");
        if (res.ok) {
          const data = await res.json();
          setCount(data.total);
        }
      } catch {
        // Silently fail — view counter is non-critical
      }
    };

    trackView();
  }, []);

  if (count === null) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      <span>{count.toLocaleString()} visits</span>
    </div>
  );
}
