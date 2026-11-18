import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { roundView } from "@joge/db";
import { toDollars } from "@joge/sdk";
import { ImageResponse } from "next/og";
import { markSvg } from "@/brand/geometry";
import { database } from "@/server/db";
import { serverEnv } from "@/server/env";

/** The share card a round's link unfurls into (F21), in the redo's look (D21): the night stage, the seal, the plates. */
export const alt = "A Jōge round: up or down";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STAGE = "#050505";
const INK = "#ffffff";
const MUTE = "#7a7a7a";
const UP = "#b5f543";
const UP_EDGE = "#7fb224";
const UP_INK = "#0b0f02";
const DOWN = "#ff647c";
const DOWN_EDGE = "#d9435c";
const DOWN_INK = "#1a0307";
const VERMILION = "#e04d26";
const NAMES = { BTC: "Bitcoin", ETH: "Ether", BCH: "Bitcoin Cash", GOLD: "Gold" } as const;
const SECOND_MS = 1_000;
const MINUTE_SECONDS = 60;
const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
const UTC_TIME = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" });
const MULTIPLE_DIGITS = 2;
/** The mark (the line to beat, 上 above, 下 below) as the image satori draws. */
const MARK_SOURCE = `data:image/svg+xml;base64,${Buffer.from(markSvg()).toString("base64")}`;
const MARK_PX = 68;
/** A losing plate fades back. */
const LOST_OPACITY = 0.35;

const fonts = Promise.all([
  readFile(join(process.cwd(), "src/fonts/og/sora-800.ttf")),
  readFile(join(process.cwd(), "src/fonts/og/jetbrains-mono-600.ttf")),
  readFile(join(process.cwd(), "src/fonts/og/noto-serif-jp-700-subset.woff")),
]);

function Plate({ side, label, won }: { side: 0 | 1; label: string; won: boolean | null }) {
  const up = side === 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        flex: 1,
        height: 120,
        padding: "0 32px",
        borderRadius: 30,
        background: up ? UP : DOWN,
        color: up ? UP_INK : DOWN_INK,
        boxShadow: `inset 0 -8px 0 ${up ? UP_EDGE : DOWN_EDGE}`,
        opacity: won === false ? LOST_OPACITY : 1,
      }}
    >
      <div style={{ display: "flex", fontFamily: "Serif", fontSize: 58 }}>{up ? "上" : "下"}</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 38, letterSpacing: 2 }}>{up ? "UP" : "DOWN"}</div>
        <div style={{ display: "flex", fontFamily: "Mono", fontSize: 22 }}>{label}</div>
      </div>
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const roundId = Number((await params).id);
  const view = Number.isSafeInteger(roundId)
    ? await roundView(database.db, serverEnv.JOGE_DEFAULT_NETWORK, roundId)
    : null;
  const [display, mono, serif] = await fonts;
  const round = view?.round;
  const name = round ? NAMES[round.asset] : "Jōge";
  const [up = 0, down = 0] = round?.totals ?? [];
  const total = up + down;
  const pays = (side: number) => (side > 0 ? `${(total / side).toFixed(MULTIPLE_DIGITS)}×` : "—");
  const strike = round?.liveStrike ?? round?.strikePrice ?? null;
  const settled = round?.state === "settled";
  const length = round?.laneSeconds ? `${round.laneSeconds / MINUTE_SECONDS} min` : "";
  const headline = settled ? (round?.winner === 0 ? "Up won." : "Down won.") : `${name}, up or down?`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: STAGE,
        color: INK,
        padding: 56,
        fontFamily: "Sora",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={MARK_SOURCE} width={MARK_PX} height={MARK_PX} alt="" />
          <div style={{ display: "flex", fontSize: 40, letterSpacing: -1.5 }}>
            J
            <div style={{ display: "flex", position: "relative" }}>
              o
              <div
                style={{
                  position: "absolute",
                  left: 3,
                  right: 3,
                  top: 6,
                  height: 4,
                  borderRadius: 2,
                  background: VERMILION,
                }}
              />
            </div>
            ge
          </div>
        </div>
        <div style={{ display: "flex", fontFamily: "Mono", fontSize: 22, color: MUTE }}>
          {round
            ? `${round.asset} ${length} · ${UTC_TIME.format(round.lockTime * SECOND_MS)}–${UTC_TIME.format(round.closeTime * SECOND_MS)} UTC`
            : "Bitcoin Cash"}
        </div>
      </div>
      <div style={{ display: "flex", marginTop: 40, fontSize: 84, letterSpacing: -4, lineHeight: 1.02 }}>
        {round?.title ?? headline}
      </div>
      <div style={{ display: "flex", marginTop: 18, fontFamily: "Mono", fontSize: 26, color: MUTE }}>
        {round && strike !== null
          ? `to beat ${USD.format(toDollars(round.asset, strike))}`
          : round
            ? `entries close ${UTC_TIME.format(round.lockTime * SECOND_MS)} UTC`
            : "No house. The chain pays."}
      </div>
      <div style={{ display: "flex", marginTop: "auto", gap: 20 }}>
        <Plate
          side={0}
          label={settled ? (round?.winner === 0 ? "won" : "") : pays(up)}
          won={settled ? round?.winner === 0 : null}
        />
        <Plate
          side={1}
          label={settled ? (round?.winner === 1 ? "won" : "") : pays(down)}
          won={settled ? round?.winner === 1 : null}
        />
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Sora", data: display, weight: 800, style: "normal" },
        { name: "Mono", data: mono, weight: 600, style: "normal" },
        { name: "Serif", data: serif, weight: 700, style: "normal" },
      ],
    },
  );
}
