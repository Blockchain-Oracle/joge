/** Shared by the page that builds a sign-in proof and the server that checks it (D11). */

/** 2100-01-01T00:00:00Z: a transaction with this locktime can never be mined. */
export const SIGN_IN_LOCKTIME = 4_102_444_800;
/** The first push of the proof's OP_RETURN. */
export const SIGN_IN_TAG = "joge-sign-in";
/** A non-final sequence, so the locktime counts. */
export const SIGN_IN_SEQUENCE = 0xfffffffe;
/** What the proof pays itself back less (it is never broadcast; a fee only keeps it well-formed). */
export const SIGN_IN_FEE = 500n;
