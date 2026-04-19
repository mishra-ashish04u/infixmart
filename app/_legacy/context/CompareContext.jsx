"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'infix_compare';
const MAX_COMPARE = 3;

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(stored)) setCompareList(stored);
    } catch {}
  }, []);

  const save = (list) => {
    setCompareList(list);
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
  };

  const addToCompare = (product) => {
    setCompareList(prev => {
      if (prev.find(p => p.id === product.id)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      const next = [...prev, product];
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const removeFromCompare = (productId) => {
    save(compareList.filter(p => p.id !== productId));
  };

  const clearCompare = () => save([]);

  const isComparing = (productId) => compareList.some(p => p.id === productId);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isComparing, maxCompare: MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
