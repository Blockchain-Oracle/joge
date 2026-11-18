import "server-only";
import { z } from "zod";
import { AUTH_SECRET_MIN } from "./constants";

/** The web tier's server configuration, read once. Nothing here reaches the browser. */
const schema = z.object({
  DATABASE_URL: z.url(),
  JOGE_DEFAULT_NETWORK: z.enum(["chipnet", "mainnet"]).default("chipnet"),
  /** The agents' master public key: derives each agent's public key for its vault (the engine alone can sign). */
  AGENT_XPUB: z.string().min(1).optional(),
  /** Mainnet agents have their own master key (the engine for mainnet holds its private half). */
  AGENT_XPUB_MAINNET: z.string().min(1).optional(),
  /** Signs sign-in session cookies (agent edits need a sign-in proof first). */
  AUTH_SECRET: z.string().min(AUTH_SECRET_MIN).optional(),
});

export const serverEnv = schema.parse(process.env);
