"use client";

import { stringify } from "@bitauth/libauth";
import { useWizardConnect, type WizardConnectState } from "@wizardconnect/react";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MARK_BOX, markSvg } from "@/brand/geometry";
import { toast } from "@/kit";
import { useWorld } from "../shell/world.tsx";
import { PATHS, type PathName, type WalletKey, walletKey, walletKeys } from "./keys.ts";

const SESSION_KEY = "joge-wizardconnect";

/** One input the wallet signs: [input index, path name, address index]. */
export type InputPath = [number, PathName, number];

/** A signature the wallet is being asked for right now: what it is, since when, and whether it just came back. */
export interface SignRequest {
  what: string;
  since: number;
  done: boolean;
}

/** How long the "Signed" tick stays before the request card leaves. */
const SIGNED_HOLD_MS = 700;

interface WalletApi {
  state: WizardConnectState;
  /** The wallet itself has answered since the page loaded (false while a restored session waits for it). */
  online: boolean;
  walletName: string | null;
  walletIcon: string | null;
  /** Pairing URIs while connecting (null during an automatic reconnect: there is no QR then). */
  uri: string | null;
  qrUri: string | null;
  error: string | null;
  /** The wallet's first addresses (receive and change), derived from the keys it shared. */
  keys: WalletKey[];
  /** Any address of the paired wallet (the coin scan reads past the first ones); null while unpaired. */
  keyAt: (path: PathName, index: number) => WalletKey | null;
  /** Where a ticket's payout goes: the wallet's first receive address. */
  payout: WalletKey | null;
  connectOpen: boolean;
  openConnect: () => void;
  /** Starts pairing without the sheet (the guide shows the code itself). */
  pair: () => void;
  closeConnect: () => void;
  disconnect: () => Promise<void>;
  /** Asks the wallet to sign; resolves with the signed transaction (hex). The page broadcasts it. */
  sign: (transaction: unknown, inputPaths: InputPath[], signal?: AbortSignal) => Promise<string>;
  /** The signature waiting in the wallet, shown as one card on every page (null when none). */
  signing: SignRequest | null;
  /** Stops waiting for the wallet (the request card's Cancel). */
  cancelSigning: () => void;
}

const WalletContext = createContext<WalletApi | null>(null);

/**
 * WizardConnect, Jōge's way: the official hook keeps the relay, the session and reconnects; this context adds the
 * wallet's addresses, the pairing sheet's state, and signing with CashScript's request object made relay-safe.
 */
/**
 * The name and icon a wallet shows for us (his report: Cashonize listed "Unknown dApp" and the logo came and went).
 * The icon travels inside the pairing message as a data URI — no fetch, so no mixed-content block from an http page
 * and nothing to fail — and the name is plain.
 */
const DAPP_NAME = "Jōge";
const DAPP_ICON = `data:image/svg+xml;utf8,${encodeURIComponent(
  markSvg().replace(">", `><rect width="${MARK_BOX}" height="${MARK_BOX}" rx="14" fill="#0a0a0a"/>`),
)}`;

export function WalletProvider({ children }: { children: ReactNode }) {
  const network = useWorld();
  const wizard = useWizardConnect({ dappName: DAPP_NAME, dappIcon: DAPP_ICON, sessionKey: SESSION_KEY });
  const [connectOpen, setConnectOpen] = useState(false);
  const [signing, setSigning] = useState<SignRequest | null>(null);
  const waiting = useRef<AbortController | null>(null);
  const announced = useRef(false);
  const { manager, state } = wizard;
  // A refresh restores the stored session: the wallet's keys come back at once from storage, while the relay
  // reconnects behind the scenes and the wallet answers whenever it next opens. That is still a paired wallet.
  // (Only a pairing in progress shows a code; a restore never does.)
  const resuming = manager !== null && (state === "reconnecting" || (state === "connecting" && !wizard.uri));

  const keys = useMemo(
    () =>
      manager && (state === "connected" || resuming)
        ? walletKeys((child, index) => manager.getPubkey(child, index), network)
        : [],
    [manager, state, resuming, network],
  );
  const paired = state === "connected" || (resuming && keys.length > 0);
  const keyAt = useCallback(
    (name: PathName, index: number) => {
      const path = PATHS.find((each) => each.name === name);
      if (!manager || keys.length === 0 || !path) return null;
      return walletKey((child, at) => manager.getPubkey(child, at), path, index, network);
    },
    [manager, keys.length, network],
  );

  useEffect(() => {
    // Announce a new pairing only; a refresh that reconnects quietly is not news.
    if (state === "connected" && wizard.uri && !announced.current) {
      announced.current = true;
      setConnectOpen(false);
      toast({ tone: "up", title: `Paired with ${wizard.walletName ?? "your wallet"}` });
    }
    if (state === "disconnected" || state === "idle") announced.current = false;
  }, [state, wizard.uri, wizard.walletName]);

  const openConnect = useCallback(() => {
    setConnectOpen(true);
    if (state === "idle" || state === "disconnected") wizard.connect();
  }, [state, wizard]);

  const pair = useCallback(() => {
    if (state === "idle" || state === "disconnected") wizard.connect();
  }, [state, wizard]);

  const closeConnect = useCallback(() => {
    setConnectOpen(false);
    // Closing the sheet abandons a pairing in progress, never a stored session that is reconnecting.
    if (state === "connecting" && wizard.uri) void wizard.disconnect();
  }, [state, wizard]);

  const sign = useCallback(
    async (transaction: unknown, inputPaths: InputPath[], signal?: AbortSignal) => {
      if (!manager || !paired) throw new Error("Pair a wallet first");
      // Wallets parse libauth's extended JSON (tagged bigints and bytes); CashScript's object holds raw ones.
      const relaySafe = JSON.parse(stringify(transaction)) as never;
      // The request card names what is being signed with the same words the wallet shows (the transaction's prompt).
      const prompt = (transaction as { userPrompt?: unknown }).userPrompt;
      const controller = new AbortController();
      signal?.addEventListener("abort", () => controller.abort(), { once: true });
      waiting.current = controller;
      setSigning({
        what: typeof prompt === "string" ? prompt.replace(/^Jōge:\s*/, "") : "A transaction",
        since: Date.now(),
        done: false,
      });
      let signed = false;
      try {
        const response = await manager
          .signTransaction({ transaction: relaySafe, inputPaths }, { signal: controller.signal })
          .catch((cause: unknown) => {
            if (controller.signal.aborted) throw new Error("Cancelled");
            // The relay is still coming back after a refresh: say what to do, not the library's words.
            if (cause instanceof Error && /not connected/i.test(cause.message))
              throw new Error("Reconnecting to your wallet. Open it, then try again.");
            throw cause;
          });
        if (response.error) throw new Error(response.error);
        signed = true;
        return response.signedTransaction;
      } finally {
        waiting.current = null;
        if (signed) {
          setSigning((now) => (now ? { ...now, done: true } : now));
          setTimeout(() => setSigning(null), SIGNED_HOLD_MS);
        } else setSigning(null);
      }
    },
    [manager, paired],
  );

  const cancelSigning = useCallback(() => waiting.current?.abort(), []);

  const value: WalletApi = {
    // A restored session counts as paired: its addresses and balance show at once.
    state: paired ? "connected" : state,
    online: state === "connected",
    walletName: wizard.walletName,
    walletIcon: wizard.walletIcon,
    uri: wizard.uri,
    qrUri: wizard.qrUri,
    error: wizard.error,
    keys,
    keyAt,
    payout: keys.find((key) => key.path === "receive" && key.index === 0) ?? null,
    connectOpen,
    openConnect,
    pair,
    closeConnect,
    disconnect: wizard.disconnect,
    sign,
    signing,
    cancelSigning,
  };
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletApi {
  const wallet = useContext(WalletContext);
  if (!wallet) throw new Error("useWallet outside WalletProvider");
  return wallet;
}
