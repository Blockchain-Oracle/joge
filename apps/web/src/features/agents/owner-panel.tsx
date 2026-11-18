"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowDownToLine, LoaderCircle, Pause, Play, Plus } from "lucide-react";
import { type ReactNode, useState } from "react";
import { AmountSheet, cue, Segmented, toast } from "@/kit";
import { useSession } from "../auth/session.ts";
import { NotEnough } from "../guide/top-up.tsx";
import { useWorld } from "../shell/world.tsx";
import { lostRace, sendEntry } from "../ticket/entry.ts";
import { useWalletCoins } from "../wallet/coins.ts";
import { useWallet } from "../wallet/wallet-context.tsx";
import { type Agent, patchAgent } from "./api.ts";
import { FUND_CHIPS_USD, FUND_FEE_ROOM, FUND_MIN_USD } from "./constants.ts";
import { chipUsd, MODE_COPY, useSatsUsd } from "./format.ts";
import { buildFunding, buildWithdrawal } from "./vault.ts";

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

function Action({
  icon,
  label,
  onClick,
  busy = false,
  disabled = false,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  busy?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className="flex flex-1 flex-col items-center gap-2 rounded-[20px] bg-[var(--surface-1)] px-2 py-4 transition-colors hover:bg-[var(--surface-2)] disabled:opacity-40"
    >
      <span className="grid size-11 place-items-center rounded-full bg-[var(--ink)] text-[var(--ink-inverse)]">
        {busy ? <LoaderCircle aria-hidden className="size-5 motion-safe:animate-spin" /> : icon}
      </span>
      <span className="nx-num text-[12px] font-semibold">{label}</span>
    </button>
  );
}

/**
 * What only the owner does, as four buttons (an icon and a few characters each): put money in, take it all back,
 * pause or resume, and switch between asking first and playing alone. Settings changes need a sign-in proof;
 * money moves are proven by the owner's own signature.
 */
export function OwnerPanel({ agent, vaultSats }: { agent: Agent; vaultSats: bigint }) {
  const network = useWorld();
  const wallet = useWallet();
  const coins = useWalletCoins();
  const session = useSession();
  const client = useQueryClient();
  const money = useSatsUsd();
  const [fundOpen, setFundOpen] = useState(false);
  const [busy, setBusy] = useState<"fund" | "take" | "save" | null>(null);
  const ownerKey = wallet.keys.find((key) => key.pkh === agent.ownerPkh);
  const refresh = () => {
    for (const key of [
      ["vault", network],
      ["coins", network],
      ["agent", network, agent.id],
      ["agents", network],
    ]) {
      void client.invalidateQueries({ queryKey: key });
    }
  };
  const needWallet = () => {
    if (wallet.state === "connected") return false;
    wallet.openConnect();
    return true;
  };

  const fund = async (dollars: number) => {
    const fundSats = money.toSats(dollars);
    if (needWallet() || !fundSats || !ownerKey || !coins.data) return;
    try {
      setBusy("fund");
      const request = await buildFunding({
        network,
        coins: coins.data,
        amount: BigInt(fundSats),
        vaultLockingBytecode: agent.vaultLockingBytecode,
        change: ownerKey,
        prompt: `Jōge: ${money.format(fundSats)} to ${agent.name}`,
      });
      await sendEntry(network, await wallet.sign(request.transaction, request.inputPaths));
      cue("send");
      toast({ tone: "up", title: `+${money.format(fundSats)}`, body: agent.name, href: `/agents/${agent.id}` });
      setFundOpen(false);
      refresh();
    } catch (error) {
      toast({ tone: lostRace(errorText(error)) ? "info" : "down", title: "Not sent", body: errorText(error) });
    } finally {
      setBusy(null);
    }
  };

  const takeBack = async () => {
    if (needWallet() || !coins.data) return;
    try {
      setBusy("take");
      const request = await buildWithdrawal({
        network,
        agentId: agent.id,
        coins: coins.data,
        ownerPkh: agent.ownerPkh,
      });
      await sendEntry(network, await wallet.sign(request.transaction, request.inputPaths));
      cue("arrive");
      toast({
        tone: "up",
        title: `${money.format(request.amount)} back`,
        body: agent.name,
        href: `/agents/${agent.id}`,
      });
      refresh();
    } catch (error) {
      toast({ tone: lostRace(errorText(error)) ? "info" : "down", title: "Not taken back", body: errorText(error) });
    } finally {
      setBusy(null);
    }
  };

  const change = async (patch: Parameters<typeof patchAgent>[2]) => {
    if (needWallet()) return;
    try {
      setBusy("save");
      if (session.pkh !== agent.ownerPkh) {
        const proven = await session.signIn(agent.ownerPkh);
        if (proven !== agent.ownerPkh) throw new Error("Sign in with the address that owns this agent.");
      }
      await patchAgent(network, agent.id, patch);
      cue("tap");
      refresh();
    } catch (error) {
      toast({ tone: "down", title: "Not changed", body: errorText(error) });
    } finally {
      setBusy(null);
    }
  };

  const active = agent.status === "active";
  return (
    <section className="flex flex-col gap-3" aria-label="Owner">
      <div className="flex gap-2">
        <Action
          icon={<Plus size={20} aria-hidden />}
          label="Add"
          onClick={() => setFundOpen(true)}
          busy={busy === "fund"}
        />
        <Action
          icon={<ArrowDownToLine size={20} aria-hidden />}
          label={vaultSats > 0n ? money.format(vaultSats) : "Empty"}
          onClick={() => void takeBack()}
          busy={busy === "take"}
          disabled={vaultSats === 0n}
        />
        <Action
          icon={active ? <Pause size={20} aria-hidden /> : <Play size={20} aria-hidden />}
          label={active ? "Pause" : "Resume"}
          onClick={() => void change({ status: active ? "paused" : "active" })}
          busy={busy === "save"}
        />
      </div>
      <Segmented
        label="How it plays"
        value={agent.mode}
        onChange={(mode) => void change({ mode })}
        options={(["ask", "auto"] as const).map((mode) => ({ value: mode, label: MODE_COPY[mode].label }))}
        className="self-start"
      />
      <AmountSheet
        open={fundOpen}
        onClose={() => setFundOpen(false)}
        title={`Add to ${agent.name}`}
        initial={FUND_CHIPS_USD[1]}
        presets={FUND_CHIPS_USD}
        min={FUND_MIN_USD}
        max={null}
        busy={busy === "fund"}
        confirm={(dollars) => (busy === "fund" ? "Signing…" : `Send ${chipUsd(dollars)}`)}
        problem={(dollars) => {
          const sats = money.toSats(dollars);
          return sats !== null && coins.data && BigInt(sats) + FUND_FEE_ROOM > coins.balance ? <NotEnough /> : null;
        }}
        onConfirm={(dollars) => fund(dollars)}
      />
    </section>
  );
}
