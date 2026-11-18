"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { placeholderP2PKHUnlocker } from "cashscript";
import { useState } from "react";
import { SIGN_IN_FEE, SIGN_IN_LOCKTIME, SIGN_IN_SEQUENCE, SIGN_IN_TAG } from "@/lib/sign-in";
import { useWorld } from "../shell/world.tsx";
import { roundsOf } from "../wallet/chain.ts";
import { useWalletCoins, type WalletCoin } from "../wallet/coins.ts";
import { useWallet } from "../wallet/wallet-context.tsx";

/** The smallest output nodes accept. */
const DUST = 546n;
/** The proof pays itself back less the fee, so its coin must still leave a valid output. */
const SMALLEST_PROOF_COIN = SIGN_IN_FEE + DUST;
const SESSION_STALE_MS = 60_000;

const sessionQuery = {
  queryKey: ["session"],
  queryFn: async (): Promise<string | null> => {
    const response = await fetch("/api/auth/verify");
    if (!response.ok) return null;
    return ((await response.json()) as { pkh: string | null }).pkh;
  },
  staleTime: SESSION_STALE_MS,
};

/**
 * A coin to sign the proof over: one at the wanted address first (an agent's owner), then the payout address (tickets
 * pay there, so new agents' owners match it), then any.
 */
function proofCoin(coins: WalletCoin[], wanted: Array<string | undefined>): WalletCoin | null {
  const plain = coins
    .filter((coin) => !coin.token && coin.satoshis >= SMALLEST_PROOF_COIN)
    .sort((a, b) => (b.satoshis > a.satoshis ? 1 : -1));
  for (const pkh of wanted) {
    const found = pkh ? plain.find((coin) => coin.key.pkh === pkh) : undefined;
    if (found) return found;
  }
  return plain[0] ?? null;
}

/**
 * Signing in: WizardConnect wallets cannot sign messages, so the wallet signs a transaction that can never be
 * mined (locktime in 2100) holding a challenge from the server. The server checks the signature with the BCH VM and
 * sets a 24-hour session cookie for that address. Nothing is broadcast and nothing is spent.
 */
export function useSession() {
  const network = useWorld();
  const wallet = useWallet();
  const coins = useWalletCoins();
  const client = useQueryClient();
  const session = useQuery(sessionQuery);
  const [signing, setSigning] = useState(false);
  const mine = wallet.keys.map((key) => key.pkh);
  /** The wallet's address this browser is signed in as (null when signed out, or signed in as another wallet). */
  const pkh = session.data && mine.includes(session.data) ? session.data : null;

  /** Signs in; `as` names the address to prove (an agent's owner) when the wallet holds a coin there. */
  const signIn = async (as?: string): Promise<string> => {
    if (wallet.state !== "connected") throw new Error("Pair a wallet first.");
    const coin = proofCoin(coins.data ?? [], [as, wallet.payout?.pkh]);
    if (!coin)
      throw new Error("Signing in signs over one coin of yours (nothing is spent): add a little to your wallet.");
    setSigning(true);
    try {
      const { challenge } = (await (await fetch("/api/auth/challenge")).json()) as { challenge: string };
      const { round } = await roundsOf(network);
      const transaction = new round.TransactionBuilder({ provider: round.open.provider })
        .setLocktime(SIGN_IN_LOCKTIME)
        .addInput(coin, placeholderP2PKHUnlocker(coin.key.address), { sequence: SIGN_IN_SEQUENCE })
        .addOpReturnOutput([SIGN_IN_TAG, challenge])
        .addOutput({ to: coin.key.address, amount: coin.satoshis - SIGN_IN_FEE })
        .generateWcTransactionObject({
          broadcast: false,
          userPrompt: "Sign in to Jōge (never broadcast, nothing spent)",
        });
      const signed = await wallet.sign(transaction, [[0, coin.key.path, coin.key.index]]);
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          signedTransaction: signed,
          lockingBytecode: coin.key.lockingBytecode,
          satoshis: coin.satoshis.toString(),
        }),
      });
      const json = (await response.json()) as { pkh?: string; error?: string };
      if (!response.ok || !json.pkh) throw new Error(json.error ?? "The sign-in was not accepted.");
      client.setQueryData(sessionQuery.queryKey, json.pkh);
      return json.pkh;
    } finally {
      setSigning(false);
    }
  };

  return { pkh, signIn, signing, ready: !session.isPending };
}
