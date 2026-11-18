import "server-only";

/**
 * In-memory rate gates for the model routes (per server instance). Each rule is "at most `count` in `windowMs`", per
 * key (an IP, or "house" for everyone together). Model calls cost money; these keep a burst from becoming a bill.
 */
interface Rule {
  count: number;
  windowMs: number;
}

const hits = new Map<string, number[]>();

/** True when the call may go ahead (and is counted); false when a rule is full. */
export function allow(scope: string, key: string, rules: Rule[]): boolean {
  const now = Date.now();
  const longest = Math.max(...rules.map((rule) => rule.windowMs));
  const id = `${scope}:${key}`;
  const recent = (hits.get(id) ?? []).filter((at) => now - at < longest);
  const full = rules.some((rule) => recent.filter((at) => now - at < rule.windowMs).length >= rule.count);
  if (!full) recent.push(now);
  hits.set(id, recent);
  return !full;
}

/** The caller's IP as the proxy reports it (Coolify's Traefik sets x-forwarded-for). */
export const clientIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
