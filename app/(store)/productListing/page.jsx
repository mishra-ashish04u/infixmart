"use client";

import { Suspense } from "react";
import ProductListingPage from "../../_legacy/Pages/ProductListing/index.jsx";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProductListingPage />
    </Suspense>
  );
}
