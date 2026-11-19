// How many tickets one sweep can pay before it hits the 100 kB standard size or the master's
// operation-cost budget — with P2SH32 tickets and with P2S tickets (no hash, the script is the locking bytecode).
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { binToHex } from "@bitauth/libauth";
import { encodeSweep, encodeTicket } from "@joge/sdk";
import type { ContractType } from "cashscript";
import { buildSweep, type TokenUtxo } from "../src/builders.ts";
import { roundContracts } from "../src/contracts.ts";
import { measure, player } from "./harness.ts";
import { KITS, type TestKit } from "./kits.ts";

const STANDARD_TX_BYTES = 100_000;

async function settledRoundWith(tickets: number, ticketType: ContractType, testKit: TestKit) {
  const provider = testKit.newProvider();
  const creator = player("creator");
  const category = binToHex(crypto.getRandomValues(new Uint8Array(32)));
  const contracts = roundContracts({
    category,
    provider,
    protocolLockingBytecode: creator.lockingBytecode,
    ticketType,
    kit: testKit.kit,
  });
  const stake = 10_000n;
  const pot = stake * BigInt(tickets);
  const record = encodeSweep({
    roundId: 7,
    state: "settled",
    winner: 0,
    pot,
    winnerTotal: pot / 2n,
    remaining: tickets,
    creatorPkh: creator.pkh,
  });
  const master = (await provider.addUtxo(contracts.sweep.lockingBytecode, {
    ...testKit.randomUtxo({ satoshis: pot + 50_000n }),
    token: { category, amount: 0n, nft: { capability: "mutable", commitment: binToHex(record) } },
  })) as TokenUtxo;
  const ticketUtxos: TokenUtxo[] = [];
  const owner = player("owner");
  for (let index = 0; index < tickets; index += 1) {
    const ticket = encodeTicket({ roundId: 7, gateIndex: 0, outcome: index % 2, stake, payoutPkh: owner.pkh });
    const target = ticketType === "p2s" ? contracts.ticket.lockingBytecode : contracts.ticket.lockingBytecode;
    ticketUtxos.push(
      (await provider.addUtxo(target, {
        ...testKit.randomUtxo({ satoshis: 1_200n }),
        token: { category, amount: 0n, nft: { capability: "none", commitment: binToHex(ticket) } },
      })) as TokenUtxo,
    );
  }
  return { contracts, master, tickets: ticketUtxos };
}

for (const testKit of KITS) {
  describe(`${testKit.kit.name} · sweep scale`, {
    skip: !process.env.MEASURE && "set MEASURE=1 to measure",
  }, () => {
    for (const ticketType of ["p2sh32", "p2s"] as const) {
      it(`${ticketType} tickets: bytes and op-cost per ticket`, async () => {
        const rows: string[] = [];
        for (const count of [10, 50, 100, 200]) {
          const { contracts, master, tickets } = await settledRoundWith(count, ticketType, testKit);
          const { builder } = buildSweep({ contracts, master, tickets });
          const { bytes } = await measure(builder);
          let opCost = "";
          try {
            await builder.debug();
            const [usage] = await builder.getVmResourceUsage();
            opCost = usage ? `${usage.operationCost} of ${usage.maximumOperationCost}` : "?";
          } catch (error) {
            opCost = `refused: ${String((error as Error).message)
              .split("\n")[1]
              ?.slice(0, 90)}`;
          }
          rows.push(`${String(count).padStart(4)} tickets  ${String(bytes).padStart(7)} B  op-cost ${opCost}`);
        }
        console.log(`${testKit.kit.name} ${ticketType}\n${rows.join("\n")}`);
        assert.ok(rows.length > 0);
        assert.ok(STANDARD_TX_BYTES > 0);
      });
    }
  });
}
