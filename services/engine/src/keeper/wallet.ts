import {
  binToHex,
  decodePrivateKeyWif,
  decodeTransaction,
  encodeCashAddress,
  hash160,
  hashTransaction,
  hexToBin,
} from "@bitauth/libauth";
import type { Funding } from "@joge/contracts";
import type { Network } from "@joge/db";
import { SignatureTemplate } from "cashscript";
import { type Fulcrum, type ListedUtxo, utxosAt } from "../chain/electrum.ts";
import { COIN_RESERVE_MS, MAX_FUNDING_INPUTS } from "../constants.ts";

/**
 * The keeper's own coins: they fund lane openings (each round's budget comes back to this address after its last
 * payout, plus the 0.5 % opener fee). Locks, settles and sweeps cost the keeper nothing: they pay from the round.
 */
export class KeeperWallet {
  readonly signer: SignatureTemplate;
  readonly pkh: Uint8Array;
  readonly address: string;
  readonly lockingBytecode: string;
  readonly #reserved = new Map<string, number>();
  /** Change from our own broadcasts, usable before the server lists it. */
  readonly #pending = new Map<string, { coin: ListedUtxo; until: number }>();

  private readonly fulcrum: Fulcrum;

  constructor(wif: string, network: Network, fulcrum: Fulcrum) {
    this.fulcrum = fulcrum;
    const decoded = decodePrivateKeyWif(wif);
    if (typeof decoded === "string") throw new Error("KEEPER_WIF is not a valid WIF key");
    this.signer = new SignatureTemplate(decoded.privateKey);
    this.pkh = hash160(this.signer.publicKey);
    const prefix = network === "mainnet" ? "bitcoincash" : "bchtest";
    this.address = encodeCashAddress({ prefix, type: "p2pkh", payload: this.pkh }).address;
    this.lockingBytecode = `76a914${binToHex(this.pkh)}88ac`;
  }

  async balance(): Promise<bigint> {
    const coins = await utxosAt(this.fulcrum, this.lockingBytecode);
    return coins.filter((coin) => !coin.token).reduce((sum, coin) => sum + coin.satoshis, 0n);
  }

  /**
   * Free plain coins adding up to at least `minimum` sats, largest first (at most MAX_FUNDING_INPUTS), reserved for the
   * caller. Rounds return their budgets as small coins; spending several at once folds them back into one change coin.
   */
  async coins(minimum: bigint): Promise<Funding[] | undefined> {
    const now = Date.now();
    for (const [outpoint, until] of this.#reserved) if (until < now) this.#reserved.delete(outpoint);
    for (const [outpoint, { until }] of this.#pending) if (until < now) this.#pending.delete(outpoint);
    const listed = await utxosAt(this.fulcrum, this.lockingBytecode);
    const known = new Set(listed.map((coin) => `${coin.txid}:${coin.vout}`));
    const pending = [...this.#pending].filter(([outpoint]) => !known.has(outpoint)).map(([, { coin }]) => coin);
    const free = [...listed, ...pending]
      .filter((coin) => !coin.token && !this.#reserved.has(`${coin.txid}:${coin.vout}`))
      .sort((a, b) => (b.satoshis > a.satoshis ? 1 : -1));
    const picked: typeof free = [];
    let total = 0n;
    for (const coin of free) {
      if (total >= minimum || picked.length >= MAX_FUNDING_INPUTS) break;
      picked.push(coin);
      total += coin.satoshis;
    }
    if (total < minimum) return undefined;
    for (const coin of picked) this.#reserved.set(`${coin.txid}:${coin.vout}`, now + COIN_RESERVE_MS);
    return picked.map((utxo) => ({ utxo, unlocker: this.signer.unlockP2PKH() }));
  }

  /** One coin of at least `minimum` (or several that add up to it). */
  async coin(minimum: bigint): Promise<Funding | undefined> {
    const [only, ...rest] = (await this.coins(minimum)) ?? [];
    if (only && rest.length === 0) return only;
    for (const extra of [only, ...rest]) if (extra) this.release(extra);
    return undefined;
  }

  /** Remembers the change a transaction we just broadcast pays back to us. */
  track(hex: string) {
    const bin = hexToBin(hex);
    const decoded = decodeTransaction(bin);
    if (typeof decoded === "string") return;
    const txid = hashTransaction(bin);
    const until = Date.now() + COIN_RESERVE_MS;
    decoded.outputs.forEach((output, vout) => {
      if (output.token || binToHex(output.lockingBytecode) !== this.lockingBytecode) return;
      const coin = { txid, vout, satoshis: output.valueSatoshis, lockingBytecode: this.lockingBytecode, height: 0 };
      this.#pending.set(`${txid}:${vout}`, { coin: coin as ListedUtxo, until });
    });
  }

  release(funding: Funding) {
    this.#reserved.delete(`${funding.utxo.txid}:${funding.utxo.vout}`);
  }

  /**
   * After a broadcast that spent `funding` was refused: free the coins, and stop trusting any of them that only our
   * own change tracking vouched for. Such a coin may have been spent elsewhere (by hand, or by another process with
   * this key), and Fulcrum, which lists our real change within seconds, is the better judge from here on.
   */
  forget(funding: Funding) {
    const outpoint = `${funding.utxo.txid}:${funding.utxo.vout}`;
    this.#reserved.delete(outpoint);
    this.#pending.delete(outpoint);
  }
}
