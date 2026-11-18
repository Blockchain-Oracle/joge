"use client";

import { Check, Download, Film as FilmIcon, Image as ImageIcon, Link2, LoaderCircle, Share2, X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { type Cue, cue, cx, Segmented, Sheet, Switch, toast, usePhone } from "@/kit";
import { copyText } from "@/lib/browser";
import { encodeVideo, VideoUnavailable } from "./encode.ts";

/** Something worth sharing, ready to draw as an image and as a video (a round's receipt, a player's run). */
export interface ShareSubject {
  /** Changes when what is drawn changes (a new video is needed). */
  key: string;
  name: string;
  title: string;
  url: string;
  post: string;
  imageLabel: string;
  imageSize: { w: number; h: number };
  drawImage: (ctx: CanvasRenderingContext2D) => void;
  sceneSize: { w: number; h: number };
  totalMs: number;
  drawScene: (ctx: CanvasRenderingContext2D, t: number) => void;
  cues: Array<{ at: number; cue: Cue; step: number }>;
}

type Look = "image" | "video";
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
 * The share sheet (FOMO's "pick a look", Senryo's share flow): the image or the video, previewed exactly as it will
 * leave (the preview is the export's own drawing), amounts hideable, then Save, Share, Post on X or Copy link.
 */
export function ShareFrame({
  open,
  onClose,
  subject,
  hidden,
  onHidden,
  waiting,
  controls,
}: {
  open: boolean;
  onClose: () => void;
  subject: ShareSubject | null;
  hidden: boolean;
  onHidden: (hidden: boolean) => void;
  /** What the sheet says while the subject loads. */
  waiting: string;
  /** Extra choices above the preview (a run's period). */
  controls?: ReactNode;
}) {
  const phone = usePhone();
  const [look, setLook] = useState<Look>("image");
  const canvas = useRef<HTMLCanvasElement>(null);
  const [making, setMaking] = useState<number | null>(null);
  const [video, setVideo] = useState<Blob | null>(null);
  const [copied, setCopied] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const key = subject?.key;

  // A new look or a new drawing makes a new video.
  useEffect(() => setVideo(null), [look, key]);
  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    const target = canvas.current;
    const ctx = target?.getContext("2d");
    if (!open || !target || !ctx || !subject) return;
    if (look === "image") {
      target.width = subject.imageSize.w;
      target.height = subject.imageSize.h;
      subject.drawImage(ctx);
      return;
    }
    target.width = subject.sceneSize.w;
    target.height = subject.sceneSize.h;
    const start = performance.now();
    let raf = 0;
    const tick = (clock: number) => {
      subject.drawScene(ctx, (clock - start) % subject.totalMs);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, look, subject]);

  if (!subject) {
    return (
      <Sheet open={open} onClose={onClose} title="Share">
        <div className="flex flex-col gap-4 pb-2">
          {controls}
          <p className="py-10 text-center text-[14px] text-[var(--muted)]">{waiting}</p>
        </div>
      </Sheet>
    );
  }
  const ext = look === "image" ? "png" : "mp4";
  const imageBlob = () =>
    new Promise<Blob>((resolve, reject) =>
      canvas.current?.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("no image"))), "image/png"),
    );
  const save = async () => {
    cue("tap");
    if (look === "image") download(await imageBlob(), `${subject.name}.png`);
    else if (video) download(video, `${subject.name}.mp4`);
  };
  const shareIt = async () => {
    const blob = look === "image" ? await imageBlob() : video;
    if (!blob) return;
    const shared = phone && (await shareFile(blob, `${subject.name}.${ext}`, subject.title));
    if (!shared) {
      download(blob, `${subject.name}.${ext}`);
      await copyText(subject.url);
      toast({ tone: "up", title: "Saved · link copied" });
    }
  };
  const makeVideo = async () => {
    abort.current = new AbortController();
    setMaking(0);
    try {
      setVideo(
        await encodeVideo(
          subject.sceneSize,
          subject.totalMs,
          subject.drawScene,
          subject.cues,
          setMaking,
          abort.current.signal,
        ),
      );
      cue("fill");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast({
        tone: "info",
        title: error instanceof VideoUnavailable ? "This browser can't save the video" : "Video not made",
        body:
          error instanceof VideoUnavailable
            ? "Saving video needs the https page in Chrome or Safari. The image works here."
            : String(error),
      });
    } finally {
      setMaking(null);
    }
  };
  const copy = async () => {
    if (await copyText(subject.url)) {
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_MS);
    }
  };
  const ready = look === "image" || video !== null;
  const button = "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full font-semibold text-[15px]";

  return (
    <Sheet open={open} onClose={onClose} title="Share">
      <div className="flex flex-col gap-4 pb-2">
        {controls}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented
            label="Look"
            value={look}
            onChange={setLook}
            options={[
              {
                value: "image",
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <ImageIcon size={15} aria-hidden /> {subject.imageLabel}
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
          <span className="flex items-center gap-2 text-[13px] text-[var(--ink-2)]">
            Hide amounts
            <Switch on={hidden} onChange={onHidden} label="Hide amounts" />
          </span>
        </div>
        <div className="flex justify-center rounded-[20px] bg-[var(--surface-1)] p-3">
          <canvas
            ref={canvas}
            aria-label={look === "image" ? subject.imageLabel : "Video"}
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
                `${X_INTENT}?${new URLSearchParams({ text: subject.post, url: subject.url })}`,
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
