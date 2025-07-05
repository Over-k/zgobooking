"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamic import with ssr: false must be done in a Client Component
const SearchParamsContent = dynamic(() => import("./SearchParamsContent"), {
  ssr: false,
  loading: () => <div>Loading error details...</div>,
});

export default function ClientNotFound() {
  return (
    <div>
      <h1>Page Not Found</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchParamsContent />
      </Suspense>
    </div>
  );
}
