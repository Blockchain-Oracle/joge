import { issueChallenge } from "@/server/auth";

/** A fresh sign-in challenge (signed and expiring, so the server stores nothing). */
export function GET() {
  return Response.json({ challenge: issueChallenge() });
}
