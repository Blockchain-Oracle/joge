export default {
  "contractName": "Ticket",
  "constructorInputs": [
    {
      "name": "category",
      "type": "bytes32"
    }
  ],
  "abi": [
    {
      "name": "spend",
      "inputs": []
    }
  ],
  "bytecode": "OP_INPUTINDEX OP_UTXOTOKENCOMMITMENT OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_5 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_2 OP_PICK OP_5 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_EQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_3 OP_PICK OP_1 OP_CAT OP_EQUAL OP_OVER OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUAL OP_BOOLAND OP_OVER OP_6 OP_SPLIT OP_DROP OP_5 OP_SPLIT OP_NIP OP_BIN2NUM OP_2 OP_GREATERTHANOREQUAL OP_BOOLAND OP_0 OP_UTXOTOKENCATEGORY OP_4 OP_ROLL OP_2 OP_CAT OP_EQUAL OP_2 OP_PICK OP_1 OP_SPLIT OP_DROP OP_2 OP_EQUAL OP_BOOLAND OP_ROT OP_6 OP_SPLIT OP_DROP OP_5 OP_SPLIT OP_NIP OP_3 OP_ROLL OP_6 OP_SPLIT OP_DROP OP_5 OP_SPLIT OP_NIP OP_EQUAL OP_BOOLAND OP_BOOLOR",
  "source": "pragma cashscript ^0.14.0;\n\nimport \"./rules.cash\";\n\n// A player's entry (an immutable NFT of category K, 32 bytes):\n//   [0] tag 0x03 · [1,5) round id · [5] gate index · [6] outcome · [7,12) stake · [12,32) payout pubkey hash\n// It moves only together with its own round master once settled or void (payout or refund), or with its own gate\n// (an event's exit before lock). Those functions account for every input, so nobody can sweep it elsewhere.\ncontract Ticket(bytes32 category) {\n    function spend() {\n        bytes own = tx.inputs[this.activeInputIndex].nftCommitment;\n        bytes first = tx.inputs[0].nftCommitment;\n        require(first.slice(1, 5) == own.slice(1, 5), \"input 0 belongs to another round\");\n\n        bool byMaster = tx.inputs[0].tokenCategory == category + 0x01\n            && first.slice(0, 1) == TAG_MASTER\n            && int(first.slice(5, 6)) >= STATE_SETTLED;\n        bool byGate = tx.inputs[0].tokenCategory == category + 0x02\n            && first.slice(0, 1) == TAG_GATE\n            && first.slice(5, 6) == own.slice(5, 6);\n        require(byMaster || byGate, \"a ticket moves only with its settled master or its own gate\");\n    }\n}\n",
  "fingerprint": "42368bb92207448038f2de91f0c1601cc6339d1a08a0e225c28cc922141465d1",
  "debug": {
    "bytecode": "c0cf00cf76557f75517f775279557f75517f778800ce5379517e8778517f7551879a78567f75557f778152a29a00ce547a527e875279517f7552879a7b567f75557f77537a567f75557f77879a9b",
    "sourceMap": "11:30:11:51;:20::66:1;12:32:12:33:0;:22::48:1;13:16:13:21:0;:31::32;:16::33:1;;:28::29:0;:16::33:1;;:37::40:0;;:50::51;:37::52:1;;:47::48:0;:37::52:1;;:8::90;15:34:15:35:0;:24::50:1;:54::62:0;;:65::69;:54:::1;:24;16:15:16:20:0;:30::31;:15::32:1;;:36::46;:15;15:24;17:19:17:24:0;:34::35;:19::36:1;;:31::32:0;:19::36:1;;:15::37;:41::54;:15;15:24;18:32:18:33:0;:22::48:1;:52::60:0;;:63::67;:52:::1;:22;19:15:19:20:0;;:30::31;:15::32:1;;:36::44;:15;18:22;20:15:20:20:0;:30::31;:15::32:1;;:27::28:0;:15::32:1;;:36::39:0;;:49::50;:36::51:1;;:46::47:0;:36::51:1;;:15;18:22;21:8:21:99",
    "logs": [],
    "requires": [
      {
        "ip": 20,
        "line": 13,
        "message": "input 0 belongs to another round"
      },
      {
        "ip": 79,
        "line": 21,
        "message": "a ticket moves only with its settled master or its own gate"
      }
    ],
    "functions": [
      {
        "name": "TAG_MASTER",
        "kind": "constant",
        "inputs": [],
        "bytecode": "51",
        "sourceMap": "7:28:7:32",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "STATE_SETTLED",
        "kind": "constant",
        "inputs": [],
        "bytecode": "52",
        "sourceMap": "14:29:14:30",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "TAG_GATE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "52",
        "sourceMap": "8:26:8:30",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      }
    ],
    "sources": {
      "rules.cash": "pragma cashscript ^0.14.0;\n\n// Jōge's shared rules: NFT tags, round states, stake classes and fixed lifecycle fees.\n// Every number here is mirrored in packages/sdk/src/round/constants.ts; change both together.\n\n// First byte of every commitment of category K.\nbytes constant TAG_MASTER = 0x01;\nbytes constant TAG_GATE = 0x02;\nbytes constant TAG_TICKET = 0x03;\n\n// Master state byte (offset 5).\nbytes constant STATE_OPEN = 0x00;\nbytes constant STATE_LOCKED = 0x01;\nint constant STATE_SETTLED = 2;\nint constant STATE_VOID = 3;\n\n// Assets: index into the oracle table. Gold needs two feeds (USD/BCH and XAU/BCH).\nint constant ASSET_BTC = 0;\nint constant ASSET_ETH = 1;\nint constant ASSET_BCH = 2;\nint constant ASSET_GOLD = 3;\n// USD/BCH is in cents, XAU/BCH in ounces × 100000, so usd × 10^7 ÷ xau is dollars per ounce × 10^4.\nint constant GOLD_FACTOR = 10000000;\n\n// Modes (high nibble of the mode byte); outcomes are the low nibble.\nint constant MODE_UPDOWN = 0;\nint constant MODE_RANGES = 1;\nint constant NIBBLE = 16;\nint constant MAX_OUTCOMES = 6;\n\n// Stake classes (high nibble of the gate's class byte): satoshi bounds per entry and per gate.\nint constant CLASS_SHORT = 0;\nint constant CLASS_HOURLY = 1;\nint constant CLASS_EVENT = 2;\nint constant MIN_STAKE = 5000;\nint constant SHORT_MAX_STAKE = 500000;\nint constant HOURLY_MAX_STAKE = 5000000;\nint constant EVENT_MAX_STAKE = 25000000;\nint constant SHORT_GATE_CAP = 10000000;\nint constant HOURLY_GATE_CAP = 100000000;\nint constant EVENT_GATE_CAP = 500000000;\n\n// Fees and dust (satoshis). Lifecycle fees are fixed so every client builds the same bytes; calibrated in S00 from\n// measured sizes (gold settle ~1,840 B, gold lock with one gate ~1,940 B, ~190 B per swept P2SH32 ticket) with headroom.\n// P2S tickets carry their ~112-byte script in the output: dust is 444 + 3 × ~188 B ≈ 1,008 sats, so 1,200.\nint constant TICKET_DUST = 1200;\n// Every gate is created holding exactly this; the lock counts anything beyond it as pot.\nint constant GATE_DUST = 1000;\n// An event entrant may leave before the lock; this share of the stake stays in the gate and joins the winners' pot.\nint constant EVENT_EXIT_FEE_BPS = 300;\n// P2PKH unlocking bytecode: 0x41 push, 64-byte Schnorr signature, then the sighash byte.\nbytes constant SIGNATURE_PUSH = 0x41;\nint constant SIGHASH_BYTE = 65;\nint constant MIN_FEE_OUTPUT = 1000;\nint constant LOCK_FEE_BASE = 1600;\nint constant LOCK_FEE_PER_GATE = 700;\n// An event gate's script is nearly twice a lane gate's (~690 bytes per merged gate, measured 2026-11-17: a 2-gate event\n// lock is ~3,090 bytes, which 1,600 + 2 × 700 could not pay), so events pay more per gate.\nint constant EVENT_LOCK_FEE_PER_GATE = 1100;\nint constant SETTLE_FEE = 2200;\nint constant SWEEP_FEE_BASE = 1000;\nint constant SWEEP_FEE_PER_TICKET = 250;\n// Each swept ticket costs ~20,000 operation-cost units; 32 padding bytes buy 25,600 (measured in S00).\nint constant SWEEP_PAD_PER_TICKET = 32;\nint constant PROTOCOL_FEE_BPS = 200;\nint constant MAX_CREATOR_FEE_BPS = 300;\nint constant BPS = 10000;\n\n// Lifecycle transactions take every input at this sequence; the SDK default (0xfffffffe) would allow a second variant.\nint constant FINAL_SEQUENCE = 4294967295;\n// Timeout paths need a non-final sequence so the node enforces their locktime.\nint constant TIMEOUT_SEQUENCE = 4294967294;\nint constant TX_VERSION = 2;\n// After T_close, how long settlement has before anyone may void the round (MTP lags about an hour on mainnet).\nint constant SETTLE_TIMEOUT = 21600;\n\nfunction maxStake(int stakeClass) returns (int) {\n    require(stakeClass >= CLASS_SHORT && stakeClass <= CLASS_EVENT, \"unknown stake class\");\n    int limit = SHORT_MAX_STAKE;\n    if (stakeClass == CLASS_HOURLY) {\n        limit = HOURLY_MAX_STAKE;\n    } else if (stakeClass == CLASS_EVENT) {\n        limit = EVENT_MAX_STAKE;\n    }\n    return limit;\n}\n\nfunction gateCap(int stakeClass) returns (int) {\n    int cap = SHORT_GATE_CAP;\n    if (stakeClass == CLASS_HOURLY) {\n        cap = HOURLY_GATE_CAP;\n    } else if (stakeClass == CLASS_EVENT) {\n        cap = EVENT_GATE_CAP;\n    }\n    return cap;\n}\n\n// Gold in ten-thousandths of a US dollar per ounce, from the USD/BCH and XAU/BCH prices of the same minute.\nfunction goldPrice(int usdPerBch, int xauPerBch) returns (int) {\n    return usdPerBch * GOLD_FACTOR / xauPerBch;\n}\n"
    },
    "inlineRanges": "32:32:TAG_MASTER;43:43:STATE_SETTLED;58:58:TAG_GATE"
  },
  "compiler": {
    "name": "cashc",
    "version": "0.14.0",
    "options": {
      "enforceFunctionParameterTypes": true,
      "enforceLocktimeGuard": false
    }
  },
  "updatedAt": "2026-11-18T19:51:45.423Z"
} as const;
