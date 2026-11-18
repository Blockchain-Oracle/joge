import { type Cue, renderCues } from "@/kit";

/**
 * Turns a drawing into an MP4 (Senryo's `exportFilm`): every frame drawn at t = i / 30 by the same function the preview
 * runs — never a screen recording — and encoded with Mediabunny (WebCodecs), H.264 about 6 Mbps with the drawing's own
 * sounds as AAC. Where the browser cannot encode H.264 (a plain-http page, or no WebCodecs) it says so instead of
 * handing over a file other apps refuse.
 */

const FPS = 30;
const MS_PER_SECOND = 1_000;
const VIDEO_BITRATE = 6_000_000;
const AUDIO_BITRATE = 128_000;

export class VideoUnavailable extends Error {}

export async function encodeVideo(
  size: { w: number; h: number },
  totalMs: number,
  draw: (ctx: CanvasRenderingContext2D, t: number) => void,
  cues: Array<{ at: number; cue: Cue; step: number }>,
  onProgress: (share: number) => void,
  signal: AbortSignal,
): Promise<Blob> {
  if (!window.isSecureContext || typeof VideoEncoder === "undefined") throw new VideoUnavailable();
  const media = await import("mediabunny");
  if (!(await media.canEncodeVideo("avc", { width: size.w, height: size.h, bitrate: VIDEO_BITRATE })))
    throw new VideoUnavailable();
  const canvas = document.createElement("canvas");
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new VideoUnavailable();
  const output = new media.Output({
    format: new media.Mp4OutputFormat({ fastStart: "in-memory" }),
    target: new media.BufferTarget(),
  });
  const video = new media.CanvasSource(canvas, { codec: "avc", bitrate: VIDEO_BITRATE });
  output.addVideoTrack(video, { frameRate: FPS });
  const audio = (await media.canEncodeAudio("aac"))
    ? new media.AudioBufferSource({ codec: "aac", bitrate: AUDIO_BITRATE })
    : null;
  if (audio) output.addAudioTrack(audio);
  await output.start();
  const frames = Math.ceil((totalMs / MS_PER_SECOND) * FPS) + 1;
  try {
    for (let index = 0; index < frames; index += 1) {
      if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
      draw(ctx, (index / FPS) * MS_PER_SECOND);
      await video.add(index / FPS, 1 / FPS);
      onProgress(index / frames);
    }
    if (audio) await audio.add(await renderCues(cues, totalMs));
    await output.finalize();
  } catch (error) {
    await output.cancel();
    throw error;
  }
  const buffer = output.target.buffer;
  if (!buffer) throw new VideoUnavailable();
  return new Blob([buffer], { type: "video/mp4" });
}
