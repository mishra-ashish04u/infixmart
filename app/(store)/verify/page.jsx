"use client";

import { Suspense } from "react";
import VerifyPage from "../../_legacy/Pages/Verify/index.jsx";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyPage />
    </Suspense>
  );
}
