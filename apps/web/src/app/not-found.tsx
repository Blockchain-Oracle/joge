import type { Metadata } from "next";
import { LostPage } from "@/features/shell/lost-page";

export const metadata: Metadata = { title: "Not here" };

/** Any address the app does not have. */
export default function NotFound() {
  return (
    <LostPage
      code="404"
      title="This page went down."
      line="Nothing lives at this address. The rounds are still running."
    />
  );
}
