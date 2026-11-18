import type { Metadata } from "next";
import { Suspense } from "react";
import { PreviousRounds } from "@/features/previous/previous-rounds";
import { Skeleton } from "@/kit";

export const metadata: Metadata = { title: "Previous rounds" };

export default function PreviousRoundsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[480px] rounded-[24px]" label="Loading previous rounds" />}>
      <PreviousRounds />
    </Suspense>
  );
}
