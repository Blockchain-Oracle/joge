import { engineHealth } from "@joge/db";
import { database, nowSeconds } from "@/server/db";

/** Each engine part's last heartbeat (oracle relay, price relay, indexer, keeper), for /status. */
export async function GET() {
  const beats = await engineHealth(database.db);
  return Response.json({ now: nowSeconds(), components: beats });
}
