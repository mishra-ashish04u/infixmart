"use client";

import AdminGuard from "../../_legacy/admin/AdminGuard.jsx";
import AdminLayout from "../../_legacy/admin/AdminLayout.jsx";

export default function ProtectedAdminLayout({ children }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}
