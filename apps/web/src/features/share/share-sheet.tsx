"use client";

import { Check, Download, Film as FilmIcon, Link2, LoaderCircle, Receipt, Share2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cue, cx, Segmented, Sheet, Switch, toast, usePhone } from "@/kit";
import { copyText } from "@/lib/browser";
import { assetCoin, type Fonts, loadFonts, readFonts } from "./paint-kit.ts";
import { drawReceipt, RECEIPT } from "./receipt.ts";
import { drawScene, exportReplay, SCENE, type SceneParts, VideoUnavailable } from "./replay-video.ts";
import { useShare } from "./use-share.ts";

type Look = "receipt" | "video";
const COIN_PX = 96;
const COPIED_MS = 1_600;
const PERCENT = 100;
const X_INTENT = "https://x.com/intent/post";

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), COPIED_MS);
}

/** Native share with the file only on phones that can (Senryo's rule); elsewhere the caller saves it. */
async function shareFile(blob: Blob, name: string, title: string): Promise<boolean> {
  const file = new File([blob], name, { type: blob.type });
  if (!navigator.canShare?.({ files: [file] })) return false;
  try {
    await navigator.share({ files: [file], title });
  } catch (error) {
    // Closing the share sheet is a choice, not a failure.
    if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
  }
  return true;
}

/**
 * Share a decided round (his feedback: receipts with a QR, the replay as a video, "I made this trade"): pick a look —
 * the paper receipt or the replay video — see it exactly as it will leave, hide the amounts if you like (the return
 * still shows), then save it, share it, post it on X or copy the round's link. Both carry a QR to the round.
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
  const phone = usePhone();
  const [look, setLook] = useState<Look>("receipt");
  const [hidden, setHidden] = useState(false);
  const share = useShare(roundId, hidden, focus);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [parts, setParts] = useState<{ fonts: Fonts; coin: HTMLImageElement } | null>(null);
  const [making, setMaking] = useState<number | null>(null);
  const [video, setVideo] = useState<Blob | null>(null);
  const [copied, setCopied] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const asset = share?.round.asset;

  useEffect(() => {
    if (!open || !asset) return;
    const fonts = readFonts();
    void Promise.all([loadFonts(fonts), assetCoin(asset, COIN_PX)]).then(([, coin]) => setParts({ fonts, coin }));
  }, [open, asset]);
  // A new look or new amounts make a new video.
  useEffect(() => setVideo(null), [look, hidden, roundId]);
  useEffect(() => () => abort.current?.abort(), []);

  // The preview is the export's own drawing: the receipt once, the video looping.
  useEffect(() => {
    const target = canvas.current;
    const ctx = target?.getContext("2d");
    if (!open || !target || !ctx || !share || !parts) return;
    if (look === "receipt") {
      target.width = RECEIPT.frame.w;
      target.height = RECEIPT.frame.h;
      drawReceipt(ctx, share.film, share.words, parts.fonts, parts.coin);
      return;
    }
    target.width = SCENE.frame.w;
    target.height = SCENE.frame.h;
    const scene = sceneParts(parts, hidden, share.stakeSats);
    const start = performance.now();
    let raf = 0;
    const tick = (clock: number) => {
      drawScene(ctx, share.film, (clock - start) % share.film.totalMs, share.words, scene);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, look, share, parts, hidden]);

  if (!share) {
    return (
      <Sheet open={open} onClose={onClose} title="Share">
        <p className="py-10 text-center text-[14px] text-[var(--muted)]">Getting your round…</p>
      </Sheet>
    );
  }
  const name = `joge-${share.round.asset.toLowerCase()}-${share.round.roundId}`;
  const title = `Jōge · ${share.words.assetName} ${share.words.lane}`;
  const post =
    share.words.verdict === "hit"
      ? `Called ${share.words.assetName} ${share.words.side === 0 ? "up" : "down"} in ${share.words.lane} on Jōge: ${share.roi}. No house, settled on Bitcoin Cash.`
      : share.words.verdict === "miss"
        ? `${share.words.assetName} went the other way this time. Next round in a few minutes on Jōge.`
        : `Nobody took the other side of my ${share.words.assetName} call, so Jōge refunded it. No house.`;

  const imageBlob = () =>
    new Promise<Blob>((resolve, reject) =>
      canvas.current?.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("no image"))), "image/png"),
    );
  const save = async () => {
    cue("tap");
    if (look === "receipt") download(await imageBlob(), `${name}.png`);
    else if (video) download(video, `${name}.mp4`);
  };
  const shareIt = async () => {
    const blob = look === "receipt" ? await imageBlob() : video;
    if (!blob) return;
    const shared = phone && (await shareFile(blob, `${name}.${look === "receipt" ? "png" : "mp4"}`, title));
    if (!shared) {
      download(blob, `${name}.${look === "receipt" ? "png" : "mp4"}`);
      await copyText(share.words.url);
      toast({ tone: "up", title: "Saved · link copied" });
    }
  };
  const makeVideo = async () => {
    if (!parts) return;
    abort.current = new AbortController();
    setMaking(0);
    try {
      const blob = await exportReplay(
        share.film,
        share.words,
        sceneParts(parts, hidden, share.stakeSats),
        setMaking,
        abort.current.signal,
      );
      setVideo(blob);
      cue("fill");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast({
        tone: "info",
        title: error instanceof VideoUnavailable ? "This browser can't save the video" : "Video not made",
        body:
          error instanceof VideoUnavailable
            ? "Saving video needs a secure (https) page in Chrome or Safari. The receipt image works here."
            : String(error),
      });
    } finally {
      setMaking(null);
    }
  };
  const copy = async () => {
    if (await copyText(share.words.url)) {
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_MS);
    }
  };
  const ready = look === "receipt" || video !== null;
  const button = "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full font-semibold text-[15px]";

  return (
    <Sheet open={open} onClose={onClose} title="Share">
      <div className="flex flex-col gap-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented
            label="Look"
            value={look}
            onChange={setLook}
            options={[
              {
                value: "receipt",
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <Receipt size={15} aria-hidden /> Receipt
                  </span>
                ),
              },
              {
                value: "video",
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <FilmIcon size={15} aria-hidden /> Video
                  </span>
                ),
              },
            ]}
          />
          <Switch on={hidden} onChange={setHidden} label="Hide amounts" />
        </div>
        <div className="flex justify-center rounded-[20px] bg-[var(--surface-1)] p-3">
          <canvas
            ref={canvas}
            aria-label={look === "receipt" ? "Your receipt" : "Your replay"}
            className="h-auto max-h-[52dvh] w-auto max-w-full rounded-[12px]"
          />
        </div>
        {look === "video" && !video ? (
          making === null ? (
            <button
              type="button"
              onClick={() => void makeVideo()}
              className={cx(button, "bg-[var(--vermilion)] text-white")}
            >
              <FilmIcon size={18} aria-hidden /> Make video
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className={cx(button, "bg-[var(--surface-2)]")}>
                <LoaderCircle size={18} aria-hidden className="motion-safe:animate-spin" />
                Making video · {Math.round(making * PERCENT)}%
              </span>
              <button
                type="button"
                aria-label="Cancel"
                onClick={() => abort.current?.abort()}
                className="grid size-12 place-items-center rounded-full bg-[var(--surface-2)]"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
          )
        ) : null}
        {ready ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void save()}
              className={cx(button, "bg-[var(--ink)] text-[var(--ink-inverse)]")}
            >
              <Download size={18} aria-hidden /> Save
            </button>
            <button type="button" onClick={() => void shareIt()} className={cx(button, "bg-[var(--surface-2)]")}>
              <Share2 size={18} aria-hidden /> Share
            </button>
          </div>
        ) : null}
        <div className="flex gap-2">
          <button
            type="button"
            // Opened before any wait so popup blockers let it through (Senryo's rule).
            onClick={() =>
              window.open(
                `${X_INTENT}?${new URLSearchParams({ text: post, url: share.words.url })}`,
                "_blank",
                "noreferrer",
              )
            }
            className={cx(button, "bg-[var(--surface-1)]")}
          >
            Post on X
          </button>
          <button type="button" onClick={() => void copy()} className={cx(button, "bg-[var(--surface-1)]")}>
            {copied ? <Check size={16} aria-hidden /> : <Link2 size={16} aria-hidden />}
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

function sceneParts(parts: { fonts: Fonts; coin: HTMLImageElement }, hidden: boolean, stakeSats: number): SceneParts {
  const plot = document.createElement("canvas");
  plot.width = SCENE.plot.w;
  plot.height = SCENE.plot.h;
  return { fonts: parts.fonts, coin: parts.coin, plot, hidden, stakeSats };
}
