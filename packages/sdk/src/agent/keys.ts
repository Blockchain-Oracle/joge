import {
  decodeHdPrivateKey,
  decodeHdPublicKey,
  deriveHdPrivateNodeChild,
  deriveHdPublicNodeChild,
  secp256k1,
} from "@bitauth/libauth";

/**
 * Agents' keys (F13): one master key, one child per agent, at the agent's id (non-hardened, so the public half can
 * derive it). The web server holds only the public half (AGENT_XPUB) and derives each agent's public key for its vault
 * address; only the engine holds the private half (AGENT_XPRV) and signs vault bets. A leaked child key can still only
 * do what the vault covenant allows: enter lane rounds for the vault's owner within the per-bet cap.
 */
export function agentPublicKey(xpub: string, agentId: number): Uint8Array {
  const decoded = decodeHdPublicKey(xpub);
  if (typeof decoded === "string") throw new Error(`AGENT_XPUB: ${decoded}`);
  const child = deriveHdPublicNodeChild(decoded.node, agentId);
  if (typeof child === "string") throw new Error(child);
  return child.publicKey;
}

export function agentPrivateKey(xprv: string, agentId: number): Uint8Array {
  const decoded = decodeHdPrivateKey(xprv);
  if (typeof decoded === "string") throw new Error(`AGENT_XPRV: ${decoded}`);
  const child = deriveHdPrivateNodeChild(decoded.node, agentId);
  if (typeof child === "string") throw new Error(child);
  return child.privateKey;
}

/** The compressed public key of a private key (for checking a derived pair matches). */
export function publicKeyOf(privateKey: Uint8Array): Uint8Array {
  const key = secp256k1.derivePublicKeyCompressed(privateKey);
  if (typeof key === "string") throw new Error(key);
  return key;
}
