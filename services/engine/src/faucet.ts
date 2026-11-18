import { binToHex, cashAddressToLockingBytecode, hashTransaction, hexToBin } from "@bitauth/libauth";
import {
  type Database,
  FAUCET_DAILY_SATS,
  FAUCET_DAY_MS,
  FAUCET_RESERVE_SATS,
  FAUCET_TARGET_SATS,
  FAUCET_THRESHOLD_SATS,
  type FaucetClaim,
  faucetPaidSince,
  journalFaucetClaim,
  type Network,
  pendingFaucetClaims,
  settleFaucetClaim,
} from "@joge/db";
import { TransactionBuilder } from "cashscript";
import { broadcast, chainProvider, type Fulcrum, utxosAt } from "./chain/electrum.ts";
import { FAUCET_BATCH, FAUCET_FEE_MARGIN, FAUCET_TICK_MS } from "./constants.ts";
import { KeeperWallet } from "./keeper/wallet.ts";
import { errorText, logger } from "./log.ts";
import { beat, every, nowSeconds } from "./runtime.ts";

const log = logger("faucet");
/** A refusal that re-sending the same bytes can never fix (a spent or missing input, an invalid script). */
const REJECTED = /missing|conflict|mandatory|non-?standard|insufficient|dust|bad-txns|invalid/i;
/** The network already has it: the claim is paid. */
const ALREADY = /already|known|txn-already/i;

/**
 * Chipnet test coins: each waiting claim is checked against the address's balance and
 * topped up to the target, never more; the signed transaction is written down before it is broadcast, so a retry
 * re-sends the same bytes and a claim is never paid twice; a daily total and a reserve keep the wallet from draining.
 */
export async function runFaucet(
  database: Database,
  fulcrum: Fulcrum,
  network: Network,
  wif: string,
  signal: AbortSignal,
) {
  if (network !== "chipnet") throw new Error("the faucet only runs on chipnet");
  const wallet = new KeeperWallet(wif, network, fulcrum);
  const db = database.db;
  log.info("listening", { address: wallet.address });

  const balanceOf = async (address: string) => {
    const locking = cashAddressToLockingBytecode(address);
    if (typeof locking === "string") return null;
    const coins = await utxosAt(fulcrum, binToHex(locking.bytecode));
    return coins.filter((coin) => !coin.token).reduce((sum, coin) => sum + coin.satoshis, 0n);
  };

  const resend = async (claim: FaucetClaim, hex: string) => {
    try {
      await broadcast(fulcrum, hex);
      await settleFaucetClaim(db, claim.id, "sent");
    } catch (error) {
      const message = errorText(error);
      if (ALREADY.test(message)) await settleFaucetClaim(db, claim.id, "sent");
      else if (REJECTED.test(message)) await settleFaucetClaim(db, claim.id, "failed");
      else throw error;
    }
  };

  const serve = async (claim: FaucetClaim) => {
    if (claim.hex) return resend(claim, claim.hex);
    const balance = await balanceOf(claim.address);
    if (balance === null) return settleFaucetClaim(db, claim.id, "failed");
    if (balance >= FAUCET_THRESHOLD_SATS) return settleFaucetClaim(db, claim.id, "full");
    const amount = FAUCET_TARGET_SATS - balance;
    const paidToday = await faucetPaidSince(db, network, new Date(Date.now() - FAUCET_DAY_MS));
    const holding = await wallet.balance();
    if (paidToday + amount > FAUCET_DAILY_SATS || holding - amount - FAUCET_FEE_MARGIN < FAUCET_RESERVE_SATS) {
      return settleFaucetClaim(db, claim.id, "dry");
    }
    const coins = await wallet.coins(amount + FAUCET_FEE_MARGIN);
    if (!coins) return settleFaucetClaim(db, claim.id, "dry");
    const builder = new TransactionBuilder({ provider: chainProvider(fulcrum, network) });
    for (const coin of coins) builder.addInput(coin.utxo, coin.unlocker);
    builder.addOutput({ to: claim.address, amount });
    const hex = builder.addBchChangeOutputIfNeeded({ to: wallet.address, feeRate: 1 }).build();
    await journalFaucetClaim(db, claim.id, { hex, txid: hashTransaction(hexToBin(hex)), satoshis: amount });
    try {
      await broadcast(fulcrum, hex);
      wallet.track(hex);
      await settleFaucetClaim(db, claim.id, "sent");
      log.info("sent", { claim: claim.id, sats: amount.toString() });
    } catch (error) {
      for (const coin of coins) wallet.forget(coin);
      if (REJECTED.test(errorText(error))) await settleFaucetClaim(db, claim.id, "failed");
      throw error;
    }
  };

  await every(
    FAUCET_TICK_MS,
    signal,
    async () => {
      for (const claim of await pendingFaucetClaims(db, network, FAUCET_BATCH)) {
        try {
          await serve(claim);
        } catch (error) {
          log.warn("claim failed", { claim: claim.id, error: errorText(error) });
        }
      }
      // The balance rides on the heartbeat: /status shows how much the faucet has left.
      await beat(database, `faucet:${network}`, { at: nowSeconds(), balance: Number(await wallet.balance()) });
    },
    (error) => log.warn("faucet pass failed", { error: errorText(error) }),
  );
}
