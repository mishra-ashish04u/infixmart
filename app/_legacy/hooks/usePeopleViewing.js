"use client";
import { useState, useEffect } from 'react';

function randomCount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function usePeopleViewing(productId) {
  const [count, setCount] = useState(null);

  useEffect(() => {
    if (!productId) return;
    // Seed from productId so initial value is deterministic per product
    const seed = typeof productId === 'number' ? productId : String(productId).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const base = (seed % 18) + 8; // 8–25
    setCount(base);
    const id = setInterval(() => {
      setCount(prev => {
        const delta = Math.random() < 0.5 ? -1 : 1;
        return Math.max(4, Math.min(40, prev + delta));
      });
    }, 28000);
    return () => clearInterval(id);
  }, [productId]);

  return count;
}
