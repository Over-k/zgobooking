"use client";

import { useSearchParams } from "next/navigation";

export default function SearchParamsContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return error ? <p>Error: {error}</p> : null;
}
