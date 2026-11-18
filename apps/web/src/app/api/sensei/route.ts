import {
  describeModelError,
  MODEL_HINT,
  marketNotes,
  resolveModel,
  SENSEI_INSTRUCTIONS,
  SENSEI_LIMITS,
  senseiSessionSchema,
} from "@joge/brain";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { ROUND_ID_MAX, SENSEI_CARD_LEAD_SECONDS, SENSEI_HOUSE, SENSEI_PER_IP } from "@/server/constants";
import { nowSeconds } from "@/server/db";
import { buildMarketNotes } from "@/server/market-notes";
import { allow, clientIp } from "@/server/rate";

export const maxDuration = 60;

const BAD_REQUEST = 400;
const TOO_MANY = 429;
const UNAVAILABLE = 503;

const bodySchema = z.object({
  messages: z.array(z.custom<UIMessage>()).max(SENSEI_LIMITS.turns),
  session: senseiSessionSchema,
});

const textOf = (message: UIMessage) => message.parts.map((part) => (part.type === "text" ? part.text : "")).join(" ");

/**
 * Sensei (F12): streams a reply over this turn's market notes. Its one tool, `ticket`, names a round taking entries and
 * a side; the server checks the round is real and open and returns what the page needs to draw a ticket card.
 * Nothing here signs or sends.
 */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "Send the conversation and the session." }, { status: BAD_REQUEST });
  const { messages, session } = parsed.data;
  if (messages.some((message) => textOf(message).length > SENSEI_LIMITS.charsPerTurn)) {
    return Response.json({ error: "That message is too long." }, { status: BAD_REQUEST });
  }
  const resolved = resolveModel();
  if (!resolved)
    return Response.json({ error: `Sensei is not set up on this server. ${MODEL_HINT}` }, { status: UNAVAILABLE });
  if (!allow("sensei", clientIp(request), SENSEI_PER_IP) || !allow("sensei", "house", SENSEI_HOUSE)) {
    return Response.json({ error: "Easy: one question at a time. Try again in a few seconds." }, { status: TOO_MANY });
  }

  const { notes, open } = await buildMarketNotes(session.network, session.stakeUsd);
  const lastQuestion = textOf(messages.at(-1) ?? ({ parts: [] } as unknown as UIMessage));
  const result = streamText({
    model: resolved.model,
    instructions: SENSEI_INSTRUCTIONS,
    messages: [
      { role: "user", content: marketNotes(notes, session, lastQuestion) },
      ...(await convertToModelMessages(messages)),
    ],
    tools: {
      ticket: tool({
        description:
          "Give the player a ticket card for one round taking entries. Use the round id from the market notes; outcome is 0 for Up and 1 for Down.",
        inputSchema: z.object({
          roundId: z.number().int().min(0).max(ROUND_ID_MAX),
          outcome: z.number().int().min(0).max(1),
        }),
        execute: async ({ roundId, outcome }) => {
          const round = open.find((candidate) => candidate.roundId === roundId);
          if (!round) return { ok: false as const, reason: `Round #${roundId} is not taking entries.` };
          if (outcome >= round.outcomes)
            return { ok: false as const, reason: `Round #${roundId} has no outcome ${outcome}.` };
          const left = round.lockTime - nowSeconds();
          if (left < SENSEI_CARD_LEAD_SECONDS)
            return {
              ok: false as const,
              reason: `Entries for round #${roundId} close in ${Math.max(0, left)} s, too soon to sign; name the next round.`,
            };
          return {
            ok: true as const,
            roundId,
            outcome,
            asset: round.asset,
            laneSeconds: round.laneSeconds,
            lockTime: round.lockTime,
          };
        },
      }),
    },
    stopWhen: stepCountIs(SENSEI_LIMITS.steps),
    maxOutputTokens: SENSEI_LIMITS.maxOutputTokens,
    timeout: SENSEI_LIMITS.timeoutMs,
    reasoning: "low",
  });
  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: (error) => `Sensei could not answer: ${describeModelError(error)}.`,
    }),
  });
}
