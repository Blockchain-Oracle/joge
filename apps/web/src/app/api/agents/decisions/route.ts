import { latestDecisions, type Network } from "@joge/db";
import { database } from "@/server/db";

/** How many decisions the agents page's feed shows. */
const FEED_SIZE = 80;

/** The latest decisions of every agent: who called what, why, and how it ended. */
export async function GET(request: Request) {
  const network = (new URL(request.url).searchParams.get("network") === "mainnet" ? "mainnet" : "chipnet") as Network;
  return Response.json(await latestDecisions(database.db, network, FEED_SIZE));
}
