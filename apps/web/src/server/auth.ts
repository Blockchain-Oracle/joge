import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createVirtualMachineBCH, decodeTransaction, hexToBin } from "@bitauth/libauth";
import { SIGN_IN_LOCKTIME, SIGN_IN_TAG } from "@/lib/sign-in";
import { CHALLENGE_PATTERN, CHALLENGE_TTL_MS, OP_RETURN, SECOND_MS, SESSION_TTL_MS } from "./constants";
import { serverEnv } from "./env";

/**
 * Sign-in: WizardConnect cannot sign messages, so an address proves itself by signing a transaction that can
 * never be mined (locktime in 2100) and carries a challenge this server issued. The server checks the signature with
 * the BCH virtual machine and answers with a session cookie for that address. Only agent edits need it: everything
 * else in Jōge is a transaction the wallet signs anyway.
 */
const NONCE_BYTES = 16;
const P2PKH = /^76a914([0-9a-f]{40})88ac$/;
export const SESSION_COOKIE = "joge_session";

function secret(): string {
  if (!serverEnv.AUTH_SECRET) throw new Error("AUTH_SECRET is not set on the server");
  return serverEnv.AUTH_SECRET;
}

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("hex");
const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** A challenge: `expiry.nonce.mac`, checkable later without storing anything. */
export function issueChallenge(): string {
  const body = `${Date.now() + CHALLENGE_TTL_MS}.${randomBytes(NONCE_BYTES).toString("hex")}`;
  return `${body}.${sign(body)}`;
}

function challengeValid(challenge: string): boolean {
  const [expiry, nonce, mac] = challenge.split(".");
  if (!expiry || !nonce || !mac) return false;
  return same(mac, sign(`${expiry}.${nonce}`)) && Number(expiry) > Date.now();
}

/**
 * Checks a sign-in proof: one input, signed by the key of `pkh` over a coin of `value` sats, locktime 2100, and an
 * OP_RETURN holding the tag and a live challenge. Returns the proven key hash, or why not.
 */
export function verifySignIn(
  signedHex: string,
  lockingBytecode: string,
  value: bigint,
): { pkh: string } | { error: string } {
  const owner = P2PKH.exec(lockingBytecode)?.[1];
  if (!owner) return { error: "Sign in with a standard address." };
  const decoded = decodeTransaction(hexToBin(signedHex));
  if (typeof decoded === "string") return { error: "That is not a transaction." };
  if (decoded.locktime !== SIGN_IN_LOCKTIME) return { error: "A sign-in proof must never be mineable." };
  if (decoded.inputs.length !== 1) return { error: "A sign-in proof spends exactly one coin." };
  const memo = decoded.outputs.find((output) => output.lockingBytecode[0] === OP_RETURN);
  const text = memo ? Buffer.from(memo.lockingBytecode).toString("latin1") : "";
  const challenge = CHALLENGE_PATTERN.exec(text)?.[0];
  if (!text.includes(SIGN_IN_TAG) || !challenge || !challengeValid(challenge)) {
    return { error: "The sign-in challenge is missing or has expired. Try again." };
  }
  const verdict = createVirtualMachineBCH().verify({
    transaction: decoded,
    sourceOutputs: [{ lockingBytecode: hexToBin(lockingBytecode), valueSatoshis: value }],
  });
  if (verdict !== true) return { error: "The signature does not match that address." };
  return { pkh: owner };
}

/** A session cookie value for a proven address: `pkh.expiry.mac`. */
export function sessionFor(pkh: string): { value: string; maxAge: number } {
  const body = `${pkh}.${Date.now() + SESSION_TTL_MS}`;
  return { value: `${body}.${sign(body)}`, maxAge: SESSION_TTL_MS / SECOND_MS };
}

/** The address a request's session cookie proves, or null. */
export function sessionPkh(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const value = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  if (!value || !serverEnv.AUTH_SECRET) return null;
  const [pkh, expiry, mac] = decodeURIComponent(value).split(".");
  if (!pkh || !expiry || !mac || !same(mac, sign(`${pkh}.${expiry}`)) || Number(expiry) < Date.now()) return null;
  return pkh;
}
