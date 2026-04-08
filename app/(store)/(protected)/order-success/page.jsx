"use client";

import { Suspense } from "react";
import OrderSuccessPage from "../../../_legacy/Pages/OrderSuccess/index.jsx";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessPage />
    </Suspense>
  );
}
