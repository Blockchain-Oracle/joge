"use client";

import { Check, Link as LinkIcon } from "lucide-react";
import { type CSSProperties, type ReactNode, useState } from "react";
import { cx } from "@/kit/cx";
import { copyText } from "@/lib/browser";
import s from "./deck.module.css";

/*
 * The seven slides of Jōge's "Widget Factory" deck, laid out exactly as the Google Slides copy places them. Positions
 * are the deck's own EMU numbers (a slide is 9,144,000 × 5,143,500), sizes are points on a 720 pt wide slide, and the
 * art is the template's own layers (public/slides). Anything with a `d` builds in, in that order, when its slide opens.
 */

const W = 9_144_000;
const H = 5_143_500;
const SLIDE_PT = 720;
const CRIMSON = "#860620";
const LINK = "#0097a7";
const SHADE = "rgba(0, 0, 0, 0.41)";
const COPIED_MS = 1500;

const REPO = "https://github.com/Blockchain-Oracle/joge";
const CASHTOKENS = "bitcoincash:zqnvys4cpkjk9qtsmjwmhysgtlm9vvf6uvms3x8sh9";

type Rect = readonly [x: number, y: number, w: number, h: number];
type Build = { d?: number; build?: "up" | "pop" | "wipe" | "rise" };

const at = ([x, y, w, h]: Rect): CSSProperties => ({
  left: `${(x / W) * 100}%`,
  top: `${(y / H) * 100}%`,
  width: `${(w / W) * 100}%`,
  height: `${(h / H) * 100}%`,
});

/** Points on the slide, as a share of the stage's width (so type scales with the slide). */
const pt = (n: number) => `${(n / SLIDE_PT) * 100}cqw`;

function built({ d, build = "up" }: Build) {
  if (d === undefined) return { className: undefined, style: {} };
  return { className: cx(s.build, s[build]), style: { "--d": d } as CSSProperties };
}

function Art({ src, rect, className, ...b }: { src: string; rect?: Rect; className?: string | undefined } & Build) {
  const m = built(b);
  return (
    <img
      src={`/slides/${src}`}
      alt=""
      draggable={false}
      className={cx(s.art, rect && s.placed, className, m.className)}
      style={{ ...(rect ? at(rect) : {}), ...m.style }}
    />
  );
}

function Shape({
  rect,
  fill,
  round,
  outline,
  ...b
}: { rect: Rect; fill: string; round?: boolean; outline?: string } & Build) {
  const m = built(b);
  return (
    <div
      aria-hidden
      className={cx(s.shape, m.className)}
      style={{
        ...at(rect),
        background: fill,
        borderRadius: round ? "50%" : undefined,
        boxShadow: outline ? `inset 0 0 0 ${pt(1.5)} ${outline}` : undefined,
        ...m.style,
      }}
    />
  );
}

function Text({
  rect,
  anchor = "top",
  align = "left",
  font,
  children,
  ...b
}: { rect: Rect; anchor?: "top" | "middle"; align?: "left" | "center"; font: string; children: ReactNode } & Build) {
  const m = built(b);
  return (
    <div
      className={cx(s.text, m.className)}
      style={{
        ...at(rect),
        font,
        justifyContent: anchor === "middle" ? "center" : "flex-start",
        textAlign: align,
        ...m.style,
      }}
    >
      {children}
    </div>
  );
}

/** One paragraph of a text box that builds in on its own. */
function Line({ d, size, gap, children }: { d: number; size: number; gap?: number; children: ReactNode }) {
  const m = built({ d });
  return (
    <p
      className={m.className}
      style={{ ...m.style, fontSize: pt(size), marginTop: gap ? `calc(${pt(gap)} * 1.22)` : 0 }}
    >
      {children}
    </p>
  );
}

const roboto = (size: number) => `700 ${pt(size)}/1.2 var(--font-roboto), sans-serif`;
const montserrat = (size: number, weight = 400) => `${weight} ${pt(size)}/1.22 var(--font-montserrat), sans-serif`;

function Cover() {
  return (
    <>
      <Art src="cover-bg.webp" className={s.kb} />
      <Art src="fire.webp" className={s.drift} />
      <Art src="shadow.webp" rect={[-448_900, 2_873_025, 7_264_075, 3_239_275]} />
      <Art src="top-shade.webp" />
      <Shape rect={[381_000, 0, 557_100, 680_400]} fill={CRIMSON} />
      <Art src="blaze-flame.webp" rect={[397_627, 66_125, 523_850, 523_850]} />
      <Text rect={[769_250, 2_271_850, 3_982_500, 847_800]} anchor="middle" font={roboto(33)} d={0}>
        Jōge
      </Text>
      <Text rect={[717_050, 3_025_350, 3_982_500, 847_800]} anchor="middle" font={roboto(20)} d={1}>
        Built by Blockchain Oracle
      </Text>
      <Shape rect={[797_743, 4_503_000, 250_800, 250_800]} fill={CRIMSON} round d={2} />
      <span
        className={cx(s.chain, s.build, s.up)}
        style={{ ...at([797_743, 4_503_000, 250_800, 250_800]), "--d": 2 } as CSSProperties}
      >
        <LinkIcon aria-hidden strokeWidth={2.5} />
      </span>
      <Text rect={[982_778, 4_402_200, 2_256_000, 358_500]} font={montserrat(16)} d={2}>
        <a href="/" className={s.link} style={{ color: LINK }}>
          Play Jōge
        </a>
      </Text>
      <Art src="joge-logo.webp" rect={[4_946_325, 525_350, 3_749_026, 3_749_026]} d={1} build="pop" />
    </>
  );
}

function Title() {
  return (
    <>
      <Art src="fire.webp" rect={[0, 193_450, W, 4_950_050]} className={s.drift} />
      <Art src="top-shade.webp" />
      <Text rect={[1_154_250, 546_325, 6_835_500, 3_815_400]} align="center" font={montserrat(35)}>
        <Line d={0} size={43}>
          Jōge<b>!</b>
        </Line>
        <Line d={1} size={35} gap={35}>
          Up or down, in minutes. A contract on Bitcoin Cash pays the winners. No house.
        </Line>
        <Line d={2} size={23} gap={35}>
          <a href={REPO} target="_blank" rel="noreferrer" className={s.link} style={{ color: LINK, fontWeight: 700 }}>
            github.com/Blockchain-Oracle/joge
          </a>
        </Line>
        <Line d={3} size={23}>
          <a href="/" className={s.link} style={{ color: LINK, fontWeight: 700 }}>
            getjoge.xyz
          </a>
        </Line>
      </Text>
    </>
  );
}

function Story() {
  return (
    <>
      <Art src="story-bg.webp" className={s.kb} />
      <Art src="embers.webp" className={s.drift} />
      <Shape rect={[796_475, 909_750, 3_882_900, 3_394_200]} fill={SHADE} d={1} />
      <Text rect={[796_475, 909_750, 3_882_900, 3_394_200]} font={montserrat(17, 700)}>
        <Line d={1} size={17}>
          Short up-or-down price games exist, but an operator runs every round: it starts it, posts the price, holds the
          pot and decides who gets paid. Bitcoin Cash had none at all.
        </Line>
        <Line d={2} size={17} gap={17}>
          So we built rounds that run themselves: General Protocols signs the price, CashScript and SolidCash contracts
          check it and pay the winners, and anyone can finish a round.
        </Line>
      </Text>
      <Shape rect={[796_475, 425_625, 5_788_800, 397_800]} fill={CRIMSON} d={0} build="wipe" />
      <Text rect={[1_109_025, 339_825, 5_341_800, 569_400]} anchor="middle" font={roboto(25)} d={0}>
        The Story of Jōge
      </Text>
      <Shape rect={[4_873_825, 886_800, 3_775_500, 3_555_600]} fill={SHADE} outline={CRIMSON} d={3} />
      <Art src="round-phone.webp" rect={[5_500_956, 1_027_197, 2_521_240, 3_274_810]} d={3} build="pop" />
      <Art src="flourish.webp" rect={[7_252_025, 3_738_825, 1_750_650, 1_750_650]} className={s.flicker} />
    </>
  );
}

/** Benefits and Vision share one layout: a title on the left, the points on a shaded panel to the right. */
function Points({ title, points }: { title: ReactNode; points: string[] }) {
  return (
    <>
      <Art src="room-bg.webp" className={s.kb} />
      <Art src="embers.webp" className={s.drift} />
      <Shape rect={[3_553_950, 307_250, 5_274_600, 4_403_700]} fill={SHADE} />
      <Shape rect={[900_425, 2_440_350, 823_800, 262_800]} fill={CRIMSON} d={1} build="wipe" />
      <Text rect={[791_800, 525_450, 2_088_000, 1_385_400]} font={roboto(29)} d={0}>
        <span style={{ paddingTop: `calc(${pt(29)} * 1.2)` }}>{title}</span>
      </Text>
      <Text
        rect={[3_871_450, 525_450, 4_782_900, 3_890_100]}
        font={`700 ${pt(22)}/1.27 var(--font-montserrat), sans-serif`}
      >
        <ul className={s.points}>
          {points.map((point, i) => {
            const m = built({ d: i + 1 });
            return (
              <li key={point} className={m.className} style={m.style}>
                {point}
              </li>
            );
          })}
        </ul>
      </Text>
      <Art src="flourish.webp" rect={[7_252_025, 3_738_825, 1_750_650, 1_750_650]} className={s.flicker} />
    </>
  );
}

function Usage() {
  return (
    <>
      <Art src="fire.webp" rect={[0, 193_450, W, 4_950_050]} className={s.drift} />
      <Art src="top-shade.webp" />
      <Text rect={[480_900, 193_450, 8_182_200, 2_857_200]} align="center" font={montserrat(25)}>
        <Line d={0} size={43}>
          BCH <b style={{ color: CRIMSON }}>Usage</b>
        </Line>
        <Line d={1} size={25} gap={10}>
          Every stake, pot and payout is BCH in CashTokens covenants, on mainnet.
        </Line>
        <Line d={2} size={25}>
          Agents bet from SolidCash vaults that only pay their owner.
        </Line>
      </Text>
      <Art src="fig-round.webp" rect={[3_141_698, 2_883_116, 2_860_583, 1_985_918]} d={3} build="pop" />
    </>
  );
}

function Address() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title="Copy the address"
      onClick={async () => {
        if (await copyText(CASHTOKENS)) {
          setCopied(true);
          setTimeout(() => setCopied(false), COPIED_MS);
        }
      }}
      className={cx(s.text, s.address, s.build, s.up)}
      style={
        {
          ...at([6_775_000, 4_450_000, 2_250_000, 380_100]),
          font: `400 ${pt(6)}/1.3 var(--font-roboto-mono), monospace`,
          "--d": 2,
        } as CSSProperties
      }
    >
      {copied ? (
        <span className={s.copied}>
          <Check aria-hidden /> Copied
        </span>
      ) : (
        <>
          <span>bitcoincash:</span>
          <span>{CASHTOKENS.replace(/^bitcoincash:/, "")}</span>
        </>
      )}
    </button>
  );
}

function Thanks() {
  return (
    <>
      <Art src="thanks-wordmark.webp" />
      <Text rect={[1_477_175, 1_631_300, 6_299_700, 864_900]} align="center" font={roboto(77)} d={0}>
        THANK YOU!
      </Text>
      <Art src="thanks-fire.webp" rect={[110_025, 30_950, 9_033_974, 5_081_611]} className={s.drift} />
      <Art src="thanks-embers.webp" className={s.drift} />
      <Art src="thanks-flame.webp" />
      <Art src="mascot.webp" rect={[55_012, 1_242_650, W, H]} d={1} build="rise" />
      <Art src="vignette.webp" />
      <Text rect={[6_775_000, 2_770_000, 2_250_000, 230_100]} align="center" font={montserrat(8, 700)} d={2}>
        SCAN TO SEND TO JŌGE
      </Text>
      <Art src="cashtokens-qr.png" rect={[7_200_000, 3_020_000, 1_400_000, 1_400_000]} d={2} build="pop" />
      <Address />
    </>
  );
}

export const SLIDES: { title: string; dark?: boolean; Slide: () => ReactNode }[] = [
  { title: "Jōge, built by Blockchain Oracle", Slide: Cover },
  { title: "Jōge: up or down, in minutes", dark: true, Slide: Title },
  { title: "The Story of Jōge", Slide: Story },
  {
    title: "Benefits of Jōge",
    Slide: () => (
      <Points
        title="Benefits of Jōge"
        points={[
          "A few cents, a five-minute round",
          "No house: winners split the pot",
          "Paid straight to your wallet",
          "Every price signed, checked on chain",
          "AI agents in vaults that only pay you",
          "Live on Bitcoin Cash mainnet",
        ]}
      />
    ),
  },
  { title: "BCH Usage", dark: true, Slide: Usage },
  {
    title: "The Vision for Jōge",
    Slide: () => (
      <Points
        title="The Vision for Jōge"
        points={[
          "Every market and length: 13 lanes already on chain",
          "Events and custom rounds, already in the contracts",
          "Rounds staked in ParyonUSD",
          "Agents anyone can copy and fund",
          "Target: a round open on every market, all day",
        ]}
      />
    ),
  },
  { title: "Thank you", dark: true, Slide: Thanks },
];
