import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, createGateway, type LanguageModel } from "ai";

/**
 * Which model answers, as Sensei and for the agents. Server only; a setting, not code:
 *
 * AI_MODEL="openai/gpt-5.4-mini" (the default: a short read every round, so a small fast model)
 *   AI_MODEL="openai/gpt-5.4"        (a bigger model, if ever wanted)
 *
 * The credential decides the route, first match wins:
 *   1. AI_BASE_URL + AI_API_KEY → any OpenAI-compatible endpoint (OpenRouter, Together, a local server).
 *   2. the named provider's own key (ANTHROPIC_API_KEY, OPENAI_API_KEY) → that provider directly.
 *   3. AI_GATEWAY_API_KEY → Vercel's AI Gateway, which routes the whole `creator/model` string.
 *   4. nothing → null, and the caller says which variable to set.
 * A key you already hold is tried before the gateway, so it needs no gateway account.
 */
export const DEFAULT_AI_MODEL = "openai/gpt-5.4-mini";

type Factory = (modelId: string) => LanguageModel;

const DIRECT: Record<string, { keyEnv: string; create: (apiKey: string) => Factory }> = {
  anthropic: { keyEnv: "ANTHROPIC_API_KEY", create: (apiKey) => createAnthropic({ apiKey }) },
  openai: { keyEnv: "OPENAI_API_KEY", create: (apiKey) => createOpenAI({ apiKey }) },
};

export interface ResolvedModel {
  model: LanguageModel;
  /** How the model is reached, for logs and /status. Never a key. */
  via: "custom-endpoint" | "direct" | "gateway";
  /** `creator/model`, as configured. */
  id: string;
}

/** What to tell someone when no model can be reached. */
export const MODEL_HINT =
  "Set AI_MODEL and a key for it (OPENAI_API_KEY or ANTHROPIC_API_KEY), or AI_GATEWAY_API_KEY, in the server's environment.";

/** Splits `creator/model` once, so a model id with further slashes survives. */
function split(spec: string) {
  const at = spec.indexOf("/");
  return at === -1 ? { provider: "", modelId: spec } : { provider: spec.slice(0, at), modelId: spec.slice(at + 1) };
}

export function resolveModel(env: NodeJS.ProcessEnv = process.env): ResolvedModel | null {
  const id = env.AI_MODEL?.trim() || DEFAULT_AI_MODEL;
  const { provider, modelId } = split(id);

  const baseURL = env.AI_BASE_URL?.trim();
  const customKey = env.AI_API_KEY?.trim();
  if (baseURL && customKey) {
    return { model: createOpenAI({ baseURL, apiKey: customKey }).chat(modelId), via: "custom-endpoint", id };
  }
  const direct = DIRECT[provider];
  const directKey = direct ? env[direct.keyEnv]?.trim() : undefined;
  if (direct && directKey) return { model: direct.create(directKey)(modelId), via: "direct", id };
  const gatewayKey = env.AI_GATEWAY_API_KEY?.trim();
  if (gatewayKey) return { model: createGateway({ apiKey: gatewayKey })(id), via: "gateway", id };
  return null;
}

const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_RATE_LIMITED = 429;

/**
 * A model failure in words fit for a log, the agent's memory or the screen. Provider messages can quote part of the
 * key (an invalid-key error does), so they are never passed through.
 */
export function describeModelError(error: unknown): string {
  if (APICallError.isInstance(error)) {
    if (error.statusCode === HTTP_UNAUTHORIZED || error.statusCode === HTTP_FORBIDDEN) {
      return "the model provider refused the key";
    }
    if (error.statusCode === HTTP_RATE_LIMITED) return "the model provider is rate limiting; try again shortly";
    return `the model provider answered ${error.statusCode ?? "an error"}`;
  }
  if (error instanceof Error && /abort|timeout|timed out/i.test(`${error.name} ${error.message}`)) {
    return "the model took too long";
  }
  return "the model call failed";
}
