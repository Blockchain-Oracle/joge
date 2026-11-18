/**
 * Jōge on Bitcoin Cash mainnet, from packages/contracts/deployments/mainnet.json and the live indexer (read
 * 18 Nov 2026). Contract addresses are the token-aware P2SH32 encodings of the deployment's locking bytecodes;
 * tickets are bare-script (P2S) outputs, so they have no address.
 */
export const MAINNET = {
  since: "18 Nov 2026",
  category: "196b15bfdfab0cf49d0502a6e70ab91834875319db80d41e0a1586d395ad7fd1",
  genesis: "4d904970adeb0ebbaaa61b306fee54c4e7c3f5cb76c6d97e3d5a4a81ee211a92",
  /** The 2% protocol fee and the keeper (it opens, locks, settles and sweeps rounds). */
  keeper: "bitcoincash:qrt2vqhfuk050cgcnwxjcywed0wa37qrdyfh7a4zlp",
  /** The links the home page's mainnet band shows. */
  proof: [
    { label: "Genesis", txid: "4d904970adeb0ebbaaa61b306fee54c4e7c3f5cb76c6d97e3d5a4a81ee211a92" },
    { label: "First round", txid: "60cb768f1d2484431b21c75b3843f27b3943502c5bd6175312bfb95a9de3ad23" },
    { label: "A payout", txid: "1474ff082d7a3e70f56b580bbf3cb107374b3c5e30215462aae1a803ae666acf" },
  ],
  contracts: {
    "Lane thread": "bitcoincash:rdj2xe4hm8tygux73r3ptehsucag6kd0taesw853ahm3mplyyuugjrw4us060",
    Gate: "bitcoincash:r0zqy3cc6yxqpv4drmf0fjuc82lmwrk6m24m0723rpraa2l9gh396tjr2svjw",
    "Master · open": "bitcoincash:rdessyxls886nngr3h8e328jfq8dz96hx0kl3ya92u6z0e78psu6y83fmgqzp",
    "Master · locked": "bitcoincash:rdj8n4g4n2chz3aqp224aey22dgad9w6v6q33r2c4vrhz3jyu60hxhh59pd9w",
    "Master · sweep": "bitcoincash:rwrywwjmescks8tufxp2ue9ltmjhywr5dl8fknsjzzh97qwf3cqhc5pdjnx8n",
    Factory: "bitcoincash:rv5234trn2pg48nefaapkm57tqywxyv5kmt6t4xjrr5suh3sct5pgdxw9hlkq",
    "Event gate": "bitcoincash:rwk72rggjl56sjkf97pzuesy4qx9nwutnsr635hla28glq48j3e62l53m83pr",
  },
} as const
