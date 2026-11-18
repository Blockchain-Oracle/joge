import { hexToBin, swapEndianness } from "@bitauth/libauth";
import { FEEDS } from "@joge/sdk";
import { Contract, type NetworkProvider } from "cashscript";
import dollarGate from "../artifacts/DollarGate.ts";
import dollarMasterLocked from "../artifacts/DollarMasterLocked.ts";
import dollarMasterOpen from "../artifacts/DollarMasterOpen.ts";
import dollarMasterSweep from "../artifacts/DollarMasterSweep.ts";
import tokenSide from "../artifacts/TokenSide.ts";
import type { RoundContracts } from "./contracts.ts";

const CATEGORY_HEX = /^[0-9a-f]{64}$/;
/**
 * A deployment made before dollar events (no dollar token recorded) still gets every other contract: its dollar
 * contracts are bound to the all-zero category, which has no coins, so no dollar event can ever be made there.
 */
const CATEGORY_BYTES = 32;
export const NO_DOLLAR_CATEGORY = "00".repeat(CATEGORY_BYTES);

export interface DollarContractsOptions {
  /** The dollar token's category in display order (ParyonUSD on mainnet; a test token on chipnet). */
  dollarCategory: string;
  provider: NetworkProvider;
  /** Where the protocol fee goes (hex locking bytecode); the same as the satoshi rounds'. */
  protocolLockingBytecode: string;
}

/**
 * The covenants of dollar events (F11) for one category K and one dollar token: the sidecar that holds a round's
 * dollars beside its gate or master, the dollar gate, and the three dollar masters. The ticket contract is the satoshi
 * rounds' own. Built in dependency order like `roundContracts`.
 */
export function dollarContracts(
  round: RoundContracts,
  { dollarCategory, provider, protocolLockingBytecode }: DollarContractsOptions,
) {
  const raw = swapEndianness(round.category);
  const resolved = CATEGORY_HEX.test(dollarCategory ?? "") ? dollarCategory : NO_DOLLAR_CATEGORY;
  const dollar = swapEndianness(resolved);
  const ticket = hexToBin(round.ticket.lockingBytecode);
  const [btc, eth, bch, xau] = [FEEDS["USD/BTC"], FEEDS["USD/ETH"], FEEDS["USD/BCH"], FEEDS["XAU/BCH"]].map(
    (feed) => feed.publicKey,
  ) as [string, string, string, string];

  const side = new Contract(tokenSide, [raw], { provider });
  const sideBytes = hexToBin(side.lockingBytecode);
  const gate = new Contract(dollarGate, [raw, ticket, sideBytes, dollar], { provider });
  const sweep = new Contract(dollarMasterSweep, [raw, ticket, sideBytes, dollar], { provider });
  const locked = new Contract(
    dollarMasterLocked,
    [raw, hexToBin(sweep.lockingBytecode), hexToBin(protocolLockingBytecode), sideBytes, dollar, btc, eth, bch, xau],
    { provider },
  );
  const open = new Contract(
    dollarMasterOpen,
    [raw, hexToBin(locked.lockingBytecode), hexToBin(sweep.lockingBytecode), sideBytes, dollar, btc, eth, bch, xau],
    { provider },
  );
  return { dollarCategory: resolved, side, gate, open, locked, sweep };
}

export type DollarContracts = ReturnType<typeof dollarContracts>;
