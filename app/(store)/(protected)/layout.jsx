"use client";

import ProtectedRoute from "../../_legacy/components/ProtectedRoute.jsx";

export default function ProtectedStoreLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
