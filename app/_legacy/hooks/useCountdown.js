"use client";
import { useState, useEffect } from 'react';

function getTimeLeft(endsAt) {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s, totalMs: diff };
}

export default function useCountdown(endsAt) {
  const [timeLeft, setTimeLeft] = useState(() => endsAt ? getTimeLeft(endsAt) : null);

  useEffect(() => {
    if (!endsAt) return;
    const tick = () => setTimeLeft(getTimeLeft(endsAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return timeLeft;
}
