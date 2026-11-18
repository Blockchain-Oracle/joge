"use client";

import type { AssetId } from "@joge/sdk";
import { Inbox } from "lucide-react";
import { useState } from "react";
import { Logo, Mark } from "@/brand/mark";
import { RoundStamp, SealStamp } from "@/features/round/verdict";
import { Hanko } from "@/features/shell/seal";
import {
  Button,
  type Cue,
  confetti,
  cue,
  DottedQr,
  Drawer,
  EmptyState,
  Marble,
  Ring,
  RollingNumber,
  Segmented,
  Sheet,
  Skeleton,
  Switch,
  Tag,
  ToneDisc,
  toast,
  Wait,
} from "@/kit";
import { AssetCube } from "@/marks/asset";
import { RING_SAMPLES, RING_SPAN, SAMPLE_JITTER, SAMPLE_PRICE, SAMPLE_QR_SIZE } from "./constants.ts";

const CUES: Cue[] = [
  "tap",
  "open",
  "close",
  "send",
  "arrive",
  "fill",
  "win",
  "loss",
  "error",
  "tick",
  "go",
  "profit",
  "adverse",
  "stamp",
];
const ASSETS: AssetId[] = ["BTC", "ETH", "BCH", "GOLD"];
const SAMPLE_RING = 72;

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-[24px] bg-[var(--surface-1)] p-5">
      <h3 className="nx-eyebrow">{title}</h3>
      {children}
    </section>
  );
}

/** Every piece the app uses, in its states, live (sounds play when sound is on in More). */
export function KitGallery() {
  const [on, setOn] = useState(true);
  const [side, setSide] = useState<"up" | "down">("up");
  const [rolling, setRolling] = useState(SAMPLE_PRICE);
  const [sheet, setSheet] = useState(false);
  const [drawer, setDrawer] = useState(false);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Block title="Mark, wordmark, Sensei's seal, players' marbles and the coins">
        <div className="flex flex-wrap items-center gap-5">
          <Logo size={56} />
          <Mark size={32} />
          <Mark size={16} />
          <Hanko size={48} />
          <Marble seed="b7624f08af8c72acafe0163cecb3076baf6ea00d" size={44} />
          <Marble seed="a7c0df0f54ea35578dda2b394626dae928da6a61" size={44} />
          {ASSETS.map((asset) => (
            <AssetCube key={asset} asset={asset} size={56} />
          ))}
        </div>
      </Block>
      <Block title="Up and Down plates">
        <div className="grid grid-cols-2 gap-3">
          {(["up", "down"] as const).map((each) => (
            <button key={each} type="button" data-side={each} className="nx-plate h-[76px]" onClick={() => cue("tap")}>
              <span aria-hidden className="nx-jp text-[30px] leading-none">
                {each === "up" ? "上" : "下"}
              </span>
              <span className="flex flex-col items-start leading-none">
                <span className="text-[19px] tracking-[0.06em]">{each === "up" ? "UP" : "DOWN"}</span>
                <span className="nx-num mt-1 text-[13px] font-semibold opacity-75">
                  {each === "up" ? "1.84×" : "2.19×"}
                </span>
              </span>
            </button>
          ))}
        </div>
      </Block>
      <Block title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button tone="primary">Primary</Button>
          <Button tone="ink">Ink</Button>
          <Button>Secondary</Button>
          <Button tone="ghost">Ghost</Button>
          <Button tone="primary" disabled>
            Disabled
          </Button>
        </div>
      </Block>
      <Block title="Time: the ring (calm, near, last)">
        <div className="flex flex-wrap items-center gap-4">
          <Ring leftMs={RING_SAMPLES.calm} spanMs={RING_SPAN} size={SAMPLE_RING} label="Calm" />
          <Ring leftMs={RING_SAMPLES.near} spanMs={RING_SPAN} size={SAMPLE_RING} label="Near" />
          <Ring leftMs={RING_SAMPLES.last} spanMs={RING_SPAN} size={SAMPLE_RING} label="Last" />
          <Ring leftMs={RING_SAMPLES.calm} spanMs={RING_SPAN} size={40} label="Small" />
        </div>
      </Block>
      <Block title="Result stamps: the round's plate, your seal">
        <div className="flex flex-wrap items-center gap-6">
          <RoundStamp state="settled" winner={0} />
          <RoundStamp state="settled" winner={1} />
          <RoundStamp state="void" winner={null} />
          <SealStamp verdict="hit" />
          <SealStamp verdict="miss" />
          <SealStamp verdict="void" />
        </div>
      </Block>
      <Block title="Tags and discs">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="up">Signature</Tag>
          <Tag tone="down">Differs</Tag>
          <Tag tone="gold">試 Chipnet</Tag>
          <ToneDisc tone="up" />
          <ToneDisc tone="info" />
          <ToneDisc tone="down" />
          <ToneDisc tone="up" seal="的中" size={40} />
        </div>
      </Block>
      <Block title="Numbers">
        <button
          type="button"
          className="self-start"
          onClick={() => setRolling((value) => value + (Math.random() - 1 / 2) * SAMPLE_JITTER)}
          aria-label="Roll the sample price"
        >
          <RollingNumber
            value={rolling}
            format={{ style: "currency", currency: "USD", minimumFractionDigits: 2 }}
            className="nx-num text-[32px] font-semibold"
          />
        </button>
      </Block>
      <Block title="Choices">
        <Segmented
          label="Side"
          options={[
            { value: "up", label: "上 Up" },
            { value: "down", label: "下 Down" },
          ]}
          value={side}
          onChange={setSide}
        />
        <Switch label="Example" on={on} onChange={setOn} />
      </Block>
      <Block title="Waiting and empty">
        <Skeleton className="h-10" />
        <Wait verb="Waiting for the oracle" />
        <EmptyState icon={Inbox} title="No tickets yet" action={{ label: "See rounds", href: "/rounds" }} />
      </Block>
      <Block title="Overlays, toasts, the verdict">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setSheet(true)}>Sheet</Button>
          <Button onClick={() => setDrawer(true)}>Drawer</Button>
          <Button size="sm" onClick={() => toast({ tone: "up", title: "Paid $0.42", body: "#528" })}>
            Paid toast
          </Button>
          <Button size="sm" onClick={() => toast({ tone: "down", title: "Entry failed", body: "Sign again" })}>
            Error toast
          </Button>
          <Button
            size="sm"
            onClick={() => {
              toast({ tone: "up", seal: "的中", title: "You were right", body: "Up won · #528" });
              confetti();
            }}
          >
            Win
          </Button>
          <Button
            size="sm"
            onClick={() => toast({ tone: "info", seal: "外れ", title: "Not this time", body: "Down won · #529" })}
          >
            Miss
          </Button>
        </div>
        <Sheet open={sheet} onClose={() => setSheet(false)} title="Lanes">
          <p className="text-[15px] text-[var(--ink-2)]">A bottom sheet on phones, a card on desktop.</p>
        </Sheet>
        <Drawer open={drawer} onClose={() => setDrawer(false)} title="Drawer">
          <p className="text-[15px] text-[var(--ink-2)]">A side panel from 768 px.</p>
        </Drawer>
      </Block>
      <Block title="Sound and haptics (turn sound on in More)">
        <div className="flex flex-wrap gap-2">
          {CUES.map((name) => (
            <Button key={name} size="sm" onClick={() => cue(name)}>
              {name}
            </Button>
          ))}
        </div>
      </Block>
      <Block title="Pairing code">
        <DottedQr value="wc:joge-pairing-preview" size={SAMPLE_QR_SIZE} label="Pairing code preview" />
      </Block>
    </div>
  );
}
