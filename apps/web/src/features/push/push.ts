"use client";

import type { Network } from "@joge/db";
import { useCallback, useEffect, useState } from "react";
import { useWorld } from "../shell/world.tsx";
import { useWallet } from "../wallet/wallet-context.tsx";

/**
 * Round alerts by Web Push (Next's PWA guide): the page registers /sw.js, asks permission only from a tap, and
 * hands the browser's subscription and the wallet's payout addresses to /api/push; the engine sends. On iPhone, web push
 * works only from the app added to the Home Screen.
 */
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const BASE64_BLOCK = 4;

export type PushState = "unsupported" | "install" | "blocked" | "no-wallet" | "off" | "on" | "busy";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((BASE64_BLOCK - (base64.length % BASE64_BLOCK)) % BASE64_BLOCK);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

const supported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window &&
  VAPID_PUBLIC_KEY !== "";
const onIphone = () => /iPad|iPhone|iPod/.test(navigator.userAgent);
const installed = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

/** Registers the service worker once per page load (it also keeps the shell for offline visits). */
export function registerWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => undefined);
}

async function currentSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.getRegistration();
  return (await registration?.pushManager.getSubscription()) ?? null;
}

async function send(network: Network, pkhs: string[], subscription: PushSubscription) {
  const response = await fetch("/api/push", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ network, pkhs, subscription: subscription.toJSON() }),
  });
  if (!response.ok) throw new Error("The alert sign-up was refused.");
}

/** The alerts switch: where this browser stands, and a toggle that runs from the user's tap. */
export function usePush() {
  const network = useWorld();
  const wallet = useWallet();
  const pkhs = wallet.keys.filter((key) => key.path === "receive").map((key) => key.pkh);
  const addresses = pkhs.join(",");
  const [state, setState] = useState<PushState>("busy");

  const read = useCallback(async () => {
    if (!supported()) return setState(onIphone() && !installed() ? "install" : "unsupported");
    if (Notification.permission === "denied") return setState("blocked");
    setState((await currentSubscription()) ? "on" : "off");
  }, []);

  useEffect(() => {
    void read();
  }, [read]);

  // A subscribed browser keeps its addresses current as the wallet changes.
  useEffect(() => {
    if (state !== "on" || addresses === "") return;
    void currentSubscription().then((subscription) =>
      subscription ? send(network, addresses.split(","), subscription).catch(() => undefined) : undefined,
    );
  }, [state, network, addresses]);

  const toggle = async () => {
    if (state === "on") {
      setState("busy");
      const subscription = await currentSubscription();
      if (subscription) {
        await fetch("/api/push", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        }).catch(() => undefined);
        await subscription.unsubscribe();
      }
      return read();
    }
    if (pkhs.length === 0) return setState("no-wallet");
    setState("busy");
    try {
      if ((await Notification.requestPermission()) !== "granted") return read();
      registerWorker();
      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }));
      await send(network, pkhs, subscription);
      setState("on");
    } catch {
      await read();
    }
  };

  return { state: pkhs.length === 0 && state === "off" ? ("no-wallet" as const) : state, toggle };
}
