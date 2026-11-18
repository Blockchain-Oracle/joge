"use client";

import { stringify } from "@bitauth/libauth";
import { useWizardConnect, type WizardConnectState } from "@wizardconnect/react";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@/kit";
import { useWorld } from "../shell/world.tsx";
import { type PathName, type WalletKey, walletKeys } from "./keys.ts";

const SESSION_KEY = "joge-wizardconnect";

/** One input the wallet signs: [input index, path name, address index]. */
export type InputPath = [number, PathName, number];

interface WalletApi {
  state: WizardConnectState;
  walletName: string | null;
  walletIcon: string | null;
  /** Pairing URIs while connecting (null during an automatic reconnect: there is no QR then). */
  uri: string | null;
  qrUri: string | null;
  error: string | null;
  /** The wallet's addresses (receive and change), derived from the keys it shared. */
  keys: WalletKey[];
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
}

const WalletContext = createContext<WalletApi | null>(null);

/**
 * WizardConnect, Jōge's way: the official hook keeps the relay, the session and reconnects; this context adds the
 * wallet's addresses, the pairing sheet's state, and signing with CashScript's request object made relay-safe.
 */
const APP_ICON = "/icons/icon-192.png";

export function WalletProvider({ children }: { children: ReactNode }) {
  const network = useWorld();
  // The wallet shows this icon on its own screen, so it must be a full URL, not a path on our site.
  const dappIcon = typeof window === "undefined" ? APP_ICON : new URL(APP_ICON, window.location.origin).href;
  const wizard = useWizardConnect({ dappName: "Jōge 上下", dappIcon, sessionKey: SESSION_KEY });
  const [connectOpen, setConnectOpen] = useState(false);
  const announced = useRef(false);
  const { manager, state } = wizard;

  const keys = useMemo(
    () =>
      manager && state === "connected" ? walletKeys((child, index) => manager.getPubkey(child, index), network) : [],
    [manager, state, network],
  );

  useEffect(() => {
    if (state === "connected" && !announced.current) {
      announced.current = true;
      setConnectOpen(false);
      toast({ tone: "up", title: `Paired with ${wizard.walletName ?? "your wallet"}` });
    }
    if (state === "disconnected" || state === "idle") announced.current = false;
  }, [state, wizard.walletName]);

  const openConnect = useCallback(() => {
    setConnectOpen(true);
    if (state === "idle" || state === "disconnected") wizard.connect();
  }, [state, wizard]);

  const pair = useCallback(() => {
    if (state === "idle" || state === "disconnected") wizard.connect();
  }, [state, wizard]);

  const closeConnect = useCallback(() => {
    setConnectOpen(false);
    if (state === "connecting") void wizard.disconnect();
  }, [state, wizard]);

  const sign = useCallback(
    async (transaction: unknown, inputPaths: InputPath[], signal?: AbortSignal) => {
      if (!manager || state !== "connected") throw new Error("Pair a wallet first");
      // Wallets parse libauth's extended JSON (tagged bigints and bytes); CashScript's object holds raw ones.
      const relaySafe = JSON.parse(stringify(transaction)) as never;
      const response = await manager.signTransaction(
        { transaction: relaySafe, inputPaths },
        signal ? { signal } : undefined,
      );
      if (response.error) throw new Error(response.error);
      return response.signedTransaction;
    },
    [manager, state],
  );

  const value: WalletApi = {
    state,
    walletName: wizard.walletName,
    walletIcon: wizard.walletIcon,
    uri: wizard.uri,
    qrUri: wizard.qrUri,
    error: wizard.error,
    keys,
    payout: keys.find((key) => key.path === "receive" && key.index === 0) ?? null,
    connectOpen,
    openConnect,
    pair,
    closeConnect,
    disconnect: wizard.disconnect,
    sign,
  };
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletApi {
  const wallet = useContext(WalletContext);
  if (!wallet) throw new Error("useWallet outside WalletProvider");
  return wallet;
}
