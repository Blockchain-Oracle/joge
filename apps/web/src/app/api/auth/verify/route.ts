import { SESSION_COOKIE, sessionFor, sessionPkh, verifySignIn } from "@/server/auth";

const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const HEX = /^[0-9a-f]+$/i;

interface Body {
  signedTransaction: string;
  /** The signed coin's locking bytecode (hex) and value: the proof signs over both. */
  lockingBytecode: string;
  satoshis: string;
}

/** Checks a sign-in proof and answers with a session cookie for the proven address. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body || !HEX.test(body.signedTransaction ?? "") || !HEX.test(body.lockingBytecode ?? "")) {
    return Response.json({ error: "Send the signed proof." }, { status: BAD_REQUEST });
  }
  const result = verifySignIn(
    body.signedTransaction.toLowerCase(),
    body.lockingBytecode.toLowerCase(),
    BigInt(body.satoshis),
  );
  if ("error" in result) return Response.json(result, { status: UNAUTHORIZED });
  const session = sessionFor(result.pkh);
  const response = Response.json({ pkh: result.pkh });
  response.headers.append(
    "set-cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(session.value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${session.maxAge}`,
  );
  return response;
}

/** Which address this browser is signed in as, if any. */
export function GET(request: Request) {
  return Response.json({ pkh: sessionPkh(request) });
}
