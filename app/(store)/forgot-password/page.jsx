"use client";

import { Suspense } from "react";
import ForgotPasswordPage from "../../_legacy/Pages/ForgotPassword/index.jsx";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordPage />
    </Suspense>
  );
}
