// Focused tests (test policy: core logic only): THE BRAKE stays Sensei's last word, and the agent gate holds where it
// must. The model itself is exercised for real in the app and the runner, never mocked here.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { type GateInput, gate } from "./agent.ts";
import { SENSEI_INSTRUCTIONS, THE_BRAKE } from "./sensei.ts";

describe("Sensei", () => {
  it("ends on THE BRAKE", () => {
    assert.ok(SENSEI_INSTRUCTIONS.trimEnd().endsWith(THE_BRAKE));
    assert.match(THE_BRAKE, /do not take this one/);
  });
});

const base: GateInput = {
  read: { side: "up", confidence: 0.8, why: "momentum" },
  posture: "balanced",
  sideShare: 0.5,
  lossStreak: 0,
  lastLossAt: null,
  lostToday: 0n,
  stakedToday: 0n,
  dailyCap: 100_000n,
  perBetCap: 20_000n,
  spendable: 1_000_000n,
  minStake: 5_000n,
  nowMs: Date.now(),
};

describe("agent gate", () => {
  it("enters within the smallest of the caps", () => {
    assert.deepEqual(gate(base), { enter: true, stake: 20_000n, reason: "Enter up at confidence 0.80." });
    assert.equal(gate({ ...base, stakedToday: 90_000n }).stake, 10_000n);
    assert.equal(gate({ ...base, spendable: 7_000n }).stake, 7_000n);
  });

  it("holds on a hold, low confidence, a crowded side, the loss breaker, the daily loss limit or no room", () => {
    assert.equal(gate({ ...base, read: { side: "hold", confidence: 0.9, why: "" } }).enter, false);
    assert.equal(gate({ ...base, read: { ...base.read, confidence: 0.6 } }).enter, false);
    assert.equal(gate({ ...base, sideShare: 0.9 }).enter, false);
    assert.equal(gate({ ...base, lossStreak: 4, lastLossAt: base.nowMs - 1_000 }).enter, false);
    assert.equal(gate({ ...base, lossStreak: 4, lastLossAt: base.nowMs - 5 * 3_600_000 }).enter, true);
    assert.equal(gate({ ...base, lostToday: 40_000n }).enter, false);
    assert.equal(gate({ ...base, stakedToday: 97_000n }).enter, false);
  });
});
