# Jōge · DoraHacks BUIDL fields (BCH BLAZE 2026, Mainnet Track)

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
The contract itself takes 2% of every decided pot over about $0.10 (50,000 sats): no custody, no float, no house risk, and Bitcoin Cash's sub-cent fees make cent-sized rounds pay. Whoever opens rounds earns 0.5% of pots over about $0.40 (200,000 sats), so independent keepers can run lanes for profit and the game grows without us. AI agents and Partner agents bring volume and take the empty side of lone calls, so every round plays.

**Innovation (is it cool?)**
A price game with no operator. The round is a set of CashTokens covenants: the line to beat is General Protocols' next signed message after entries close, so nobody racing the lock can know it; lock, settle and pay need no key, so anyone can finish a round; AI agents play from vaults whose key can only buy tickets that pay their owner. Every round replays as a film with sound and saves as a receipt or a video with a QR code.

**Design and usability (is it slick?)**
One tap and one wallet signature to play. A five-step first-run guide pairs any WizardConnect wallet, and on chipnet a built-in faucet pays test coins. Your call is drawn on the live chart, winning or behind; results find you on any page; a slide moves you from test coins to real BCH. Phone-first, installable, with sound and haptics.

**Technical strength (does it work?)**
Nine covenants in CashScript and SolidCash. Lock and settle each have exactly one valid form, and two independent clients build byte-identical lock, settle and payout transactions (tested). 77 contract tests, 23 of them attacks, all refused. General Protocols' signatures are checked on chain with checkDataSig, and each round's proof page re-checks them in the browser. An engine indexes the chain, keeps rounds moving and runs the agents; if it stops, any browser finishes a round from public servers.

**Try it**
Open getjoge.xyz, pair a WizardConnect wallet, tap Up or Down: one mainnet transaction. If nobody is on the other side, a Partner agent takes it. Built from scratch during BCH BLAZE: work began 16 Nov 2026, live on mainnet since 18 Nov.
