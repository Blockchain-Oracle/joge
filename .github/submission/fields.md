# Jōge · DoraHacks BUIDL fields (BCH BLAZE 2026, Mainnet Track)

Ready to paste. Character limits on the DoraHacks form were not visible without a login: the tagline below stays under 200 characters.

**Name:** Jōge

**Tagline:** Up or down, in minutes. Call BTC, ETH, BCH or gold for a few cents; a contract on Bitcoin Cash pays the winners. No house.

**Track:** Mainnet Track

**Links**
- Live app: https://getjoge.xyz
- Docs: https://docs.getjoge.xyz
- Source: https://github.com/Blockchain-Oracle/joge
- Widget Factory deck: https://docs.google.com/presentation/d/1Qp5ucxWRxmVQPF2h8TTw9VVcokC_6BMCUVuwDr3cw-Y/edit?usp=sharing
- CashTokens address: bitcoincash:zqnvys4cpkjk9qtsmjwmhysgtlm9vvf6uvms3x8sh9
- Mainnet genesis: https://explorer.bch.ninja/tx/4d904970adeb0ebbaaa61b306fee54c4e7c3f5cb76c6d97e3d5a4a81ee211a92

**The problem**
People like calling a short price move for a few cents. Today they do it on apps where an operator runs every round: it opens the round, holds everyone's stake, posts the closing price, decides who won and pays out when it chooses. Players trust that price, that payout and that the operator is still there tomorrow. On Bitcoin Cash there was no game like this at all.

**What it does**
Jōge makes the round itself the operator. Every few minutes a round opens on Bitcoin, Ether, Bitcoin Cash or gold. You tap Up or Down; your own wallet signs one entry over WizardConnect. When the round closes, CashScript covenants check the price General Protocols signed and pay the winning side the pot, less a 2% fee once the pot is big enough for it, straight to their wallets. Lock and settle have exactly one valid form, and payouts are fixed at settlement; none of them needs a key, so our keeper sends them and so can any browser. Sensei, an AI coach, reads a round with you; AI agents play from SolidCash vaults whose key can only buy tickets that pay their owner. Every round replays as a film with sound and becomes a receipt or a video with a QR code.

**How BCH is used**
Every stake, pot and payout is BCH held by CashTokens covenants of Jōge's own category: entering, locking, settling and paying a round are all mainnet transactions. General Protocols' signatures are checked on chain with checkDataSig. Live since 18 Nov 2026; for example round 785 paid its winner 26,450 sats (tx 1474ff08…).

**Business model**
2% of each decided pot of 50,000 sats or more, taken by the contract; 0.5% to whoever opens a round on pots of 200,000 sats or more, so a keeper earns once its rounds' pots outgrow each round's fixed fees. Agents and Partner agents bring volume and take the empty side of lone calls.
