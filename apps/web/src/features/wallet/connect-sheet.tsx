"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button, DottedQr, Sheet, usePhone, Wait } from "@/kit";
import { useWorld } from "../shell/world.tsx";
import { useWallet } from "./wallet-context.tsx";
import { WalletPlate } from "./wallet-plate.tsx";
import { WALLETS, WIZARDCONNECT_LOGO } from "./wallets.ts";

const QR_SIZE = 232;
const COPIED_MS = 1_600;

/** Pairing over WizardConnect: scan the code (or open the link on this phone), approve in the wallet. */
export function ConnectSheet() {
  const wallet = useWallet();
  const world = useWorld();
  const phone = usePhone();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!wallet.uri) return;
    await navigator.clipboard.writeText(wallet.uri);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_MS);
  };
  return (
    <Sheet
      open={wallet.connectOpen}
      onClose={wallet.closeConnect}
      title={wallet.state === "connected" ? "Your wallet" : "Pair a wallet"}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {wallet.state === "connected" ? (
          // Paired: the wallet card (its logo, balance, payout address and disconnect), not a new pairing.
          <WalletPlate className="w-full text-left" />
        ) : wallet.state === "reconnecting" ? (
          <Wait verb="Reconnecting to your wallet" />
        ) : wallet.error ? (
          <>
            <p className="type-body text-down-text">{wallet.error}</p>
            <Button tone="primary" onClick={wallet.openConnect}>
              Try again
            </Button>
          </>
        ) : wallet.qrUri && wallet.uri ? (
          <>
            <DottedQr value={wallet.qrUri} size={QR_SIZE} label="WizardConnect pairing code" />
            <div className="flex w-full flex-col gap-2">
              <p className="nx-eyebrow inline-flex items-center justify-center gap-1.5">
                <img src={WIZARDCONNECT_LOGO} alt="" className="size-4 rounded-sm" />
                Scan with WizardConnect
              </p>
              <ul className="flex justify-center gap-2" aria-label="Wallets that pair">
                {WALLETS.map((each) => (
                  <li
                    key={each.name}
                    title={each.name}
                    className="grid size-12 place-items-center rounded-[14px] bg-[var(--surface-2)]"
                  >
                    <img src={each.logo} alt={each.name} className="size-7 rounded-lg object-contain" />
                  </li>
                ))}
              </ul>
            </div>
            {world === "chipnet" ? (
              <span
                className="nx-sticker bg-[var(--gold)] text-[#1a1406]"
                title="Set your wallet to chipnet: test coins"
              >
                <span className="nx-jp">試</span> chipnet
              </span>
            ) : null}
            <div className="flex w-full flex-col gap-2">
              {phone ? (
                <a href={wallet.uri} data-tone="accent" className="jg-key type-cta h-14 rounded-full">
                  Open wallet <ExternalLink size={18} aria-hidden />
                </a>
              ) : null}
              <Button onClick={copy} icon={copied ? <Check size={16} /> : <Copy size={16} />}>
                {copied ? "Copied" : "Copy link"}
              </Button>
            </div>
            <Wait verb="Waiting for your wallet" />
          </>
        ) : (
          <Wait verb="Opening a secure relay" />
        )}
      </div>
    </Sheet>
  );
}
