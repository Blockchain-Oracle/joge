import "server-only";
import { binToHex, hexToBin, lockingBytecodeToCashAddress } from "@bitauth/libauth";
import { PERSONA_MAX, POSTURES, type Posture } from "@joge/brain";
import { agentVaultContract } from "@joge/contracts";
import { type AgentMode, type AgentRow, deleteAgent, insertAgent, type Network, setAgentKeys } from "@joge/db";
import { agentPublicKey, HOUR_SECONDS, LANES, MAX_STAKE, MIN_STAKE } from "@joge/sdk";
import { z } from "zod";
import { serverContracts } from "./chain";
import { database } from "./db";
import { serverEnv } from "./env";

/** How many times the per-bet cap a day may stake at most (a daily cap above this is a typo, not a plan). */
const DAILY_CAP_MULTIPLE = 50n;
const NAME_MAX = 40;
const FACE_MAX = 40;

/** What a studio sends to create or change an agent. */
export const agentDraftSchema = z.object({
  name: z.string().trim().min(1).max(NAME_MAX),
  persona: z.string().trim().min(1).max(PERSONA_MAX),
  posture: z.enum(Object.keys(POSTURES) as [Posture, ...Posture[]]),
  lanes: z.array(z.number().int()).min(1),
  perBetCap: z.coerce.number().int().positive(),
  dailyCap: z.coerce.number().int().positive(),
  mode: z.enum(["ask", "auto"]),
  copiedFrom: z.number().int().positive().nullable().optional(),
  /** The face picked in the studio (a DiceBear seed). */
  face: z.string().trim().max(FACE_MAX).optional(),
});
export type AgentDraft = z.infer<typeof agentDraftSchema>;

/** Why a draft cannot become an agent, in words a person can act on, or null. */
export function draftProblem(draft: AgentDraft): string | null {
  const lanes = draft.lanes.map((thread) => LANES.find((lane) => lane.thread === thread));
  if (lanes.some((lane) => lane === undefined)) return "Pick lanes from the list.";
  // The vault's per-bet cap is in its covenant; a lane's own cap still applies, so the smallest one is the ceiling.
  const ceiling = lanes.reduce((low, lane) => {
    const cap = MAX_STAKE[(lane?.seconds ?? 0) >= HOUR_SECONDS ? "hourly" : "short"];
    return cap < low ? cap : low;
  }, MAX_STAKE.hourly);
  const perBet = BigInt(draft.perBetCap);
  if (perBet < MIN_STAKE) return "A bet must be at least the smallest stake a round takes.";
  if (perBet > ceiling) return "That bet is above what one of these lanes allows.";
  const daily = BigInt(draft.dailyCap);
  if (daily < perBet) return "The daily cap must cover at least one bet.";
  if (daily > perBet * DAILY_CAP_MULTIPLE) return "Keep the daily cap within 50 bets.";
  return null;
}

/** The agent's vault: the AgentVault covenant for (owner, the agent's key, the per-bet cap, the lane gate). */
export async function vaultOf(network: Network, terms: { ownerPkh: string; agentPubkey: string; perBetCap: number }) {
  const { round } = await serverContracts(network);
  const vault = agentVaultContract(round, round.gate.provider, {
    ownerPkh: hexToBin(terms.ownerPkh),
    agentKey: hexToBin(terms.agentPubkey),
    perBetCap: BigInt(terms.perBetCap),
  });
  const encoded = lockingBytecodeToCashAddress({
    bytecode: hexToBin(vault.lockingBytecode),
    prefix: network === "mainnet" ? "bitcoincash" : "bchtest",
  });
  if (typeof encoded === "string") throw new Error(encoded);
  return { vault, lockingBytecode: vault.lockingBytecode, address: encoded.address };
}

/**
 * Creates an agent: its row first (the id is its key's index), then its public key from the master public key and
 * its vault from those terms. The web server never holds a private key.
 */
export async function createAgent(network: Network, ownerPkh: string, draft: AgentDraft): Promise<AgentRow> {
  const xpub = network === "mainnet" ? serverEnv.AGENT_XPUB_MAINNET : serverEnv.AGENT_XPUB;
  if (!xpub) throw new Error(`${network === "mainnet" ? "AGENT_XPUB_MAINNET" : "AGENT_XPUB"} is not set on the server`);
  const row = await insertAgent(database.db, {
    network,
    ownerPkh,
    name: draft.name,
    persona: draft.persona,
    posture: draft.posture,
    lanes: draft.lanes,
    perBetCap: draft.perBetCap,
    dailyCap: draft.dailyCap,
    mode: draft.mode as AgentMode,
    agentPubkey: "",
    vaultLockingBytecode: "",
    copiedFrom: draft.copiedFrom ?? null,
    avatarSeed: draft.face ?? "",
  });
  try {
    const agentPubkey = binToHex(agentPublicKey(xpub, row.id));
    const { lockingBytecode } = await vaultOf(network, { ownerPkh, agentPubkey, perBetCap: draft.perBetCap });
    return await setAgentKeys(database.db, row.id, agentPubkey, lockingBytecode);
  } catch (error) {
    await deleteAgent(database.db, row.id);
    throw error;
  }
}
