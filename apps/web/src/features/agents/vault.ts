"use client";

import { hexToBin } from "@bitauth/libauth";
import { utxosAt } from "@joge/contracts/browser";
import type { Network } from "@joge/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { placeholderP2PKHUnlocker } from "cashscript";
import { useEffect } from "react";
import { pickCoins } from "../ticket/entry.ts";
import { fulcrum, roundsOf } from "../wallet/chain.ts";
import type { WalletCoin } from "../wallet/coins.ts";
import type { WalletKey } from "../wallet/keys.ts";
import type { InputPath } from "../wallet/wallet-context.tsx";
import { requestWithdraw } from "./api.ts";
import { DUST, FUND_FEE_BASE, FUND_FEE_PER_INPUT } from "./constants.ts";

/**
 * An agent's vault read straight from the chain (D17), kept live by Fulcrum's notifications on its address: what the
 * owner has entrusted right now, not what our database last saw.
 */
export function useVault(network: Network, lockingBytecode: string | undefined) {
  const client = useQueryClient();
  const queryKey = ["vault", network, lockingBytecode ?? ""];
  const query = useQuery({
    queryKey,
    enabled: Boolean(lockingBytecode),
    queryFn: async () => {
      const coins = (await utxosAt(await fulcrum(network), lockingBytecode ?? "")).filter((coin) => !coin.token);
      return { coins: coins.length, sats: coins.reduce((sum, coin) => sum + coin.satoshis, 0n) };
    },
  });
  useEffect(() => {
    if (!lockingBytecode) return;
    let stop: (() => Promise<void>) | null = null;
    let cancelled = false;
    void (async () => {
      const pool = await fulcrum(network);
      const { scripthashOf } = await import("@joge/contracts/browser");
      const unsubscribe = await pool.subscribe("blockchain.scripthash.subscribe", [scripthashOf(lockingBytecode)], () =>
        client.invalidateQueries({ queryKey: ["vault", network, lockingBytecode] }),
      );
      if (cancelled) void unsubscribe();
      else stop = unsubscribe;
    })();
    return () => {
      cancelled = true;
      if (stop) void stop();
    };
  }, [client, network, lockingBytecode]);
  return query;
}

/**
 * Funding a vault is a plain payment from the wallet to the vault's address; the change goes to the owner's address,
 * which also leaves the owner a coin there to sign a withdrawal with later.
 */
export async function buildFunding({
  network,
  coins,
  amount,
  vaultLockingBytecode,
  change,
  prompt,
}: {
  network: Network;
  coins: WalletCoin[];
  amount: bigint;
  vaultLockingBytecode: string;
  change: WalletKey;
  prompt: string;
}): Promise<{ transaction: unknown; inputPaths: InputPath[] }> {
  const plain = coins.filter((coin) => !coin.token);
  const roughFee = FUND_FEE_BASE + FUND_FEE_PER_INPUT * 2n;
  const funding = pickCoins(plain, amount + roughFee + DUST);
  if (!funding) throw new Error("Not enough in your wallet for that amount");
  const fee = FUND_FEE_BASE + FUND_FEE_PER_INPUT * BigInt(funding.length);
  const total = funding.reduce((sum, coin) => sum + coin.satoshis, 0n);
  const rest = total - amount - fee;
  if (rest < 0n) throw new Error("Not enough in your wallet for that amount and the network fee");
  const { round } = await roundsOf(network);
  const builder = new round.TransactionBuilder({ provider: round.open.provider });
  for (const coin of funding) builder.addInput(coin, placeholderP2PKHUnlocker(coin.key.address));
  builder.addOutput({ to: hexToBin(vaultLockingBytecode), amount });
  if (rest >= DUST) builder.addOutput({ to: change.address, amount: rest });
  return {
    transaction: builder.generateWcTransactionObject({ broadcast: false, userPrompt: prompt }),
    inputPaths: funding.map((coin, index): InputPath => [index, coin.key.path, coin.key.index]),
  };
}

/**
 * The owner's withdrawal: a coin at the owner's address is the authority (the vault checks it is signed over every
 * output), the server builds the SolidCash spend, and only that coin is signed in the wallet.
 */
export async function buildWithdrawal({
  network,
  agentId,
  coins,
  ownerPkh,
}: {
  network: Network;
  agentId: number;
  coins: WalletCoin[];
  ownerPkh: string;
}) {
  const coin = coins
    .filter((each) => !each.token && each.key.pkh === ownerPkh)
    .sort((a, b) => (a.satoshis > b.satoshis ? 1 : -1))[0];
  if (!coin) throw new Error("Taking it back needs a coin at your owner address (any amount): it is your signature.");
  const { transaction, amount } = await requestWithdraw(network, agentId, {
    txid: coin.txid,
    vout: coin.vout,
    satoshis: coin.satoshis,
    address: coin.key.address,
  });
  return { transaction, amount, inputPaths: [[1, coin.key.path, coin.key.index]] as InputPath[] };
}
