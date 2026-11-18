"use client";

import { useEffect, useMemo, useState } from "react";
import { assetCoin, type Fonts, loadFonts, readFonts } from "./paint-kit.ts";
import { drawReceipt, RECEIPT } from "./receipt.ts";
import { drawScene, SCENE, type SceneParts } from "./replay-video.ts";
import { ShareFrame, type ShareSubject } from "./share-frame.tsx";
import { useShare } from "./use-share.ts";

const COIN_PX = 96;

/**
 * Share a decided round of yours (his feedback: receipts with a QR, the replay as a video, "I made this trade"): the
 * dark receipt or the replay video, both carrying a QR to the round.
 */
export function ShareSheet({
  roundId,
  open,
  onClose,
  focus,
}: {
  roundId: number;
  open: boolean;
  onClose: () => void;
  /** The design gallery's stand-in for "your" tickets. */
  focus?: string;
}) {
  const [hidden, setHidden] = useState(false);
  const share = useShare(roundId, hidden, focus);
  const [parts, setParts] = useState<{ fonts: Fonts; coin: HTMLImageElement } | null>(null);
  const asset = share?.round.asset;
  useEffect(() => {
    if (!open || !asset) return;
    const fonts = readFonts();
    void Promise.all([loadFonts(fonts), assetCoin(asset, COIN_PX)]).then(([, coin]) => setParts({ fonts, coin }));
  }, [open, asset]);

  const subject = useMemo((): ShareSubject | null => {
    if (!share || !parts) return null;
    const { film, words } = share;
    const plot = document.createElement("canvas");
    plot.width = SCENE.plot.w;
    plot.height = SCENE.plot.h;
    const scene: SceneParts = { fonts: parts.fonts, coin: parts.coin, plot, hidden, stakeSats: share.stakeSats };
    return {
      key: `${roundId}:${hidden}`,
      name: `joge-${share.round.asset.toLowerCase()}-${share.round.roundId}`,
      title: `Jōge · ${words.assetName} ${words.lane}`,
      url: words.url,
      post:
        words.verdict === "hit"
          ? `Called ${words.assetName} ${words.side === 0 ? "up" : "down"} in ${words.lane} on Jōge: ${share.roi}. No house, settled on Bitcoin Cash.`
          : words.verdict === "miss"
            ? `${words.assetName} went the other way this time. Next round in a few minutes on Jōge.`
            : `Nobody took the other side of my ${words.assetName} call, so Jōge refunded it. No house.`,
      imageLabel: "Receipt",
      imageSize: RECEIPT.frame,
      drawImage: (ctx) => drawReceipt(ctx, film, words, parts.fonts, parts.coin),
      sceneSize: SCENE.frame,
      totalMs: film.totalMs,
      drawScene: (ctx, t) => drawScene(ctx, film, t, words, scene),
      cues: film.cues,
    };
  }, [share, parts, hidden, roundId]);

  return (
    <ShareFrame
      open={open}
      onClose={onClose}
      subject={subject}
      hidden={hidden}
      onHidden={setHidden}
      waiting="Getting your round…"
    />
  );
}
