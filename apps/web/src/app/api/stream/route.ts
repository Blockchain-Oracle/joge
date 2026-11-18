import { CHANNEL, type Channel } from "@joge/db";
import { STREAM_KEEP_ALIVE_MS } from "@/server/constants";
import { hub } from "@/server/hub";

const encoder = new TextEncoder();

/**
 * One Server-Sent Events stream per tab: oracle prints, the indicative price line and round changes, as the engine
 * writes them. `?topics=price,oracle,round` narrows it; `?network=` filters round events to one world.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const wanted = new Set(
    (url.searchParams.get("topics") ?? "oracle,price,round,agent").split(",").map((topic) => `joge_${topic.trim()}`),
  );
  const network = url.searchParams.get("network");
  const { listeners, ready } = hub();
  await ready;
  let cleanup = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (text: string) => controller.enqueue(encoder.encode(text));
      const listener = <C extends Channel>(channel: C, notice: unknown) => {
        if (!wanted.has(channel)) return;
        const scoped = channel === CHANNEL.round || channel === CHANNEL.agent;
        if (scoped && network && (notice as { network: string }).network !== network) return;
        send(`event: ${channel.replace("joge_", "")}\ndata: ${JSON.stringify(notice)}\n\n`);
      };
      listeners.add(listener);
      const keepAlive = setInterval(() => send(": keep-alive\n\n"), STREAM_KEEP_ALIVE_MS);
      send(": connected\n\n");
      cleanup = () => {
        clearInterval(keepAlive);
        listeners.delete(listener);
      };
      request.signal.addEventListener("abort", () => {
        cleanup();
        controller.close();
      });
    },
    cancel() {
      cleanup();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Proxies (Traefik on Coolify, nginx) must not buffer the stream.
      "X-Accel-Buffering": "no",
    },
  });
}
