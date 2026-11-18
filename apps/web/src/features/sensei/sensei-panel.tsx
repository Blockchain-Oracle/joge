"use client";

import { useChat } from "@ai-sdk/react";
import { HOUR_SECONDS } from "@joge/sdk";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowUp, Square } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cue, Drawer } from "@/kit";
import { laneLabel } from "../rounds/format.ts";
import { Hanko } from "../shell/seal.tsx";
import { useLane } from "../terminal/use-lane.ts";
import { useOneTap } from "../terminal/use-one-tap.ts";
import { useSenseiSession } from "./session.ts";
import { closeSensei, takeAsk, useSensei } from "./store.ts";
import { followUps, ReadingDots, SenseiMeter, SenseiRow, Typed } from "./thread.tsx";
import { type CallOutput, TradeCard } from "./trade-card.tsx";

/** Sensei keeps the last dozen turns (the server refuses more). */
const TURNS = 12;
/** Two quieter asks under the read button (the reply's own chips take over after the first answer). */
const STARTERS = ["Coin-flip?", "I lost my last two"];

/** The server answers errors as JSON `{ error }`; the transport hands back its text. */
function errorText(error: Error): string {
  try {
    return (JSON.parse(error.message) as { error?: string }).error ?? error.message;
  } catch {
    return error.message || "Sensei could not answer.";
  }
}

const textOf = (message: UIMessage) => message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");

/**
 * Sensei (F12): a straight call on the live rounds, one reason and one risk, with ticket cards that open the normal
 * ticket. It hears this browser's record (results, stakes, limits, tilt) but never the address, and it can say "not
 * this one". Owarine's panel: a 400 px side panel (a sheet on a phone), the live strip on top, replies that type
 * themselves beside the seal, follow-up chips read from the answer.
 */
export function SenseiPanel() {
  const { open, ask } = useSensei();
  const { lane, next } = useLane();
  // Sensei prices every side at the stake one tap would send, so its "pays" matches the plates.
  const { stakeUsd } = useOneTap(next, lane && lane.seconds >= HOUR_SECONDS ? "hourly" : "short");
  const read = lane ? `${lane.asset} ${laneLabel(lane.seconds)}` : "the market";
  const { session, tilt, recordAsk } = useSenseiSession(stakeUsd);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const [draft, setDraft] = useState("");
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/sensei",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { messages: messages.slice(-TURNS), session: sessionRef.current },
        }),
      }),
    [],
  );
  const { messages, sendMessage, status, error, stop, clearError } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";
  const end = useRef<HTMLDivElement>(null);
  const [thread, setThread] = useState<HTMLDivElement | null>(null);

  const send = (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    cue("tap");
    clearError();
    recordAsk();
    void sendMessage({ text: question });
    setDraft("");
  };

  useEffect(() => {
    if (open && ask && !busy) {
      takeAsk();
      send(ask);
    }
  });
  // Follow the conversation as it grows: streamed text, "Reading the market…", and ticket cards that load late.
  useEffect(() => {
    if (!thread) return;
    const follow = new ResizeObserver(() => end.current?.scrollIntoView({ block: "end" }));
    follow.observe(thread);
    return () => follow.disconnect();
  }, [thread]);

  const lastSensei = messages.findLast((message) => message.role === "assistant");
  const chips = !busy && lastSensei && messages.at(-1) === lastSensei ? followUps(textOf(lastSensei)) : [];

  return (
    <Drawer
      open={open}
      onClose={closeSensei}
      title={
        <span className="flex items-center gap-3">
          <Hanko size={34} />
          <span className="nx-display text-[22px]">Sensei</span>
          <span className="nx-eyebrow rounded-full px-2 py-0.5 shadow-[inset_0_0_0_1px_var(--hairline)]">
            not advice
          </span>
        </span>
      }
    >
      <div className="flex min-h-full flex-col gap-4">
        <div className="sticky top-0 z-10 -mx-1 bg-surface-1 px-1 pb-1">
          <SenseiMeter />
        </div>
        {tilt ? (
          <p className="nx-sticker self-start bg-[var(--down)] text-[var(--down-ink)]">
            Slow down · Play limits in More
          </p>
        ) : null}
        {messages.length === 0 ? (
          <div className="flex flex-col items-stretch gap-3 pt-1">
            <button
              type="button"
              onClick={() => send(`Read ${read} for me.`)}
              className="flex items-center justify-center gap-3 rounded-[22px] bg-[var(--ink)] py-5 text-[var(--ink-inverse)] transition-transform active:scale-[0.98]"
            >
              <span className="nx-display text-[22px]">Read {read}</span>
            </button>
            <div className="flex flex-wrap justify-center gap-1.5">
              {STARTERS.map((starter) => (
                <button key={starter} type="button" onClick={() => send(starter)} className="nx-chip">
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div ref={setThread} className="flex flex-col gap-3.5">
          {messages.map((message) =>
            message.role === "user" ? (
              <p key={message.id} data-from="you" className="nx-msg nx-bubble self-end">
                {textOf(message)}
              </p>
            ) : (
              <SenseiRow key={message.id}>
                {textOf(message).trim() ? (
                  <p data-from="sensei" className="nx-bubble">
                    <Typed text={textOf(message)} live={busy && message === messages.at(-1)} />
                  </p>
                ) : null}
                {/* The cards come after the reasoning, whatever order the model called the tool in. */}
                {message.parts.map((part, index) =>
                  part.type === "tool-ticket" && part.state === "output-available" ? (
                    <TradeCard key={index} call={part.output as CallOutput} />
                  ) : null,
                )}
              </SenseiRow>
            ),
          )}
          {status === "submitted" ? <ReadingDots /> : null}
          {error ? (
            <SenseiRow>
              <p data-from="sensei" className="nx-bubble">
                {errorText(error)}
              </p>
            </SenseiRow>
          ) : null}
          {chips.length > 0 ? (
            <div className="nx-msg flex flex-wrap gap-1.5 pl-[37px]">
              {chips.map((chip) => (
                <button key={chip} type="button" onClick={() => send(chip)} className="nx-chip">
                  {chip}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {/* Clears the sticky composer when the thread scrolls to its end. */}
        <div ref={end} className="scroll-mb-20" />
        <form
          className="sticky bottom-0 mt-auto flex items-end gap-2 bg-surface-1 pt-2 pb-[max(env(safe-area-inset-bottom),4px)]"
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
          }}
        >
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send(draft);
              }
            }}
            rows={1}
            placeholder="Ask Sensei"
            aria-label="Ask Sensei"
            className="max-h-32 min-h-12 flex-1 resize-none rounded-[24px] bg-surface-2 px-4 py-3 text-[15px] outline-none placeholder:text-muted"
          />
          {busy ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Stop"
              className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--ink)] text-[var(--ink-inverse)]"
            >
              <Square size={15} aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Send"
              disabled={!draft.trim()}
              className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--vermilion)] text-white transition-opacity disabled:opacity-35"
            >
              <ArrowUp size={19} aria-hidden />
            </button>
          )}
        </form>
      </div>
    </Drawer>
  );
}
