import SearchPageComponent from "@/page-components/search-page";
import { Suspense } from "react";

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageComponent />
    </Suspense>
  );
}
