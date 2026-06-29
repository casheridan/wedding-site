"use client";

import { useEffect, useState } from "react";

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  passed: boolean;
};

function compute(target: number): Remaining {
  const diff = target - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
  }
  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    passed: false,
  };
}

export function Countdown({ date }: { date: string }) {
  const target = new Date(date).getTime();
  // Start null so server and first client render match (avoids hydration mismatch).
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    if (Number.isNaN(target)) return;
    // Defer the first update out of the effect body (avoids a synchronous
    // setState-in-effect) — the placeholder shows for a single frame.
    let intervalId: ReturnType<typeof setInterval>;
    const rafId = requestAnimationFrame(() => {
      setRemaining(compute(target));
      intervalId = setInterval(() => setRemaining(compute(target)), 1000);
    });
    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(intervalId);
    };
  }, [target]);

  const units = [
    { label: "Days", value: remaining?.days },
    { label: "Hours", value: remaining?.hours },
    { label: "Minutes", value: remaining?.minutes },
    { label: "Seconds", value: remaining?.seconds },
  ];

  if (remaining?.passed) {
    return (
      <p className="font-display text-2xl text-sage-700">
        Today&apos;s the day! 🎉
      </p>
    );
  }

  return (
    <div className="flex items-start justify-center gap-4 sm:gap-8">
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center">
          <span className="font-display text-4xl tabular-nums text-sage-800 sm:text-5xl">
            {u.value === undefined ? "—" : String(u.value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-ink/55">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
