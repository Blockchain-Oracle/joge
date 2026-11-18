import { z } from "zod";

/**
 * The engine's configuration, parsed once at boot with zod; any problem stops the process with every variable name
 * at fault (values are never printed). Local development reads services/engine/.env (git-ignored).
 */
const list = z
  .string()
  .transform((value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  )
  .optional();

const envSchema = z.object({
  DATABASE_URL: z.url(),
  JOGE_NETWORK: z.enum(["chipnet", "mainnet"]).default("chipnet"),
  /** Comma-separated Fulcrum WebSocket URLs; defaults to the public servers for the network. */
  FULCRUM_URLS: list,
  /** The keeper's funding key (WIF). Without it the keeper still locks, settles and pays (those are free) but opens no lanes. */
  KEEPER_WIF: z.string().min(1).optional(),
  /** Lane threads the keeper keeps open (hex bytes like 0x10, or "all"). */
  KEEPER_LANES: z.string().default("all"),
  /** "on": lanes outside KEEPER_LANES open while a viewer has woken them (the app wakes a lane on screen). */
  KEEPER_DEMAND: z.enum(["on", "off"]).default("off"),
  /** Which parts run in this process. */
  ENGINE_COMPONENTS: list,
  /** The agents' master private key: signs each agent's vault bets (S07). Without it agents only make proposals. */
  AGENT_XPRV: z.string().min(1).optional(),
  /** Web Push (S08): the VAPID key pair and a contact URL (mailto: or https:). Without them no alerts are sent. */
  VAPID_PUBLIC_KEY: z.string().min(1).optional(),
  VAPID_PRIVATE_KEY: z.string().min(1).optional(),
  VAPID_SUBJECT: z.string().min(1).optional(),
  /** The chipnet faucet's key (WIF): pays first-time players' test coins (S09R). Without it no faucet runs. */
  FAUCET_WIF: z.string().min(1).optional(),
  /** House-wide model calls per hour across every agent. */
  AGENT_MAX_CALLS_PER_HOUR: z.coerce.number().int().positive().default(60),
});

export type EngineEnv = z.output<typeof envSchema>;

export const COMPONENTS = ["oracle", "price", "indexer", "keeper", "agents", "push", "paths", "faucet"] as const;
export type Component = (typeof COMPONENTS)[number];

export function readEnv(source: Record<string, string | undefined> = process.env) {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    throw new Error(`engine configuration:\n  ${problems.join("\n  ")}`);
  }
  const env = parsed.data;
  const components = (env.ENGINE_COMPONENTS ?? [...COMPONENTS]).filter((name): name is Component =>
    (COMPONENTS as readonly string[]).includes(name),
  );
  return { ...env, components };
}
