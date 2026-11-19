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
      "selector": "f598582f",
      "inputs": [],
      "sourceEffectOrder": "unsupported-flow"
    }
  ],
  "bytecode": "OP_INPUTINDEX OP_UTXOTOKENCOMMITMENT OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_5 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_2 OP_PICK OP_5 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_EQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_3 OP_PICK OP_1 OP_CAT OP_EQUAL OP_IF OP_DUP OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUAL OP_ELSE OP_0 OP_ENDIF OP_IF OP_DUP OP_6 OP_SPLIT OP_DROP OP_5 OP_SPLIT OP_NIP OP_BIN2NUM OP_2 OP_GREATERTHANOREQUAL OP_ELSE OP_0 OP_ENDIF OP_0 OP_UTXOTOKENCATEGORY OP_4 OP_ROLL OP_2 OP_CAT OP_EQUAL OP_IF OP_OVER OP_1 OP_SPLIT OP_DROP OP_2 OP_EQUAL OP_ELSE OP_0 OP_ENDIF OP_IF OP_OVER OP_6 OP_SPLIT OP_DROP OP_5 OP_SPLIT OP_NIP OP_3 OP_PICK OP_6 OP_SPLIT OP_DROP OP_5 OP_SPLIT OP_NIP OP_EQUAL OP_ELSE OP_0 OP_ENDIF OP_SWAP OP_IF OP_1 OP_ELSE OP_DUP OP_ENDIF OP_NIP OP_NIP OP_NIP",
  "source": "pragma solidcash ^0.51.0;\n\n// SolidCash version of cashscript/Ticket.cash (language bake-off; kept in step for BAKEOFF=1 runs).\n\n// Jōge's shared rules: NFT tags, round states, stake classes and fixed lifecycle fees.\n// Generated from cashscript/rules.cash (same values); mirrored in packages/sdk/src/round/constants.ts.\n\n// First byte of every commitment of category K.\nbytes1 constant TAG_MASTER = 0x01;\nbytes1 constant TAG_GATE = 0x02;\nbytes1 constant TAG_TICKET = 0x03;\n\n// Master state byte (offset 5).\nbytes1 constant STATE_OPEN = 0x00;\nbytes1 constant STATE_LOCKED = 0x01;\nbigint constant STATE_SETTLED = 2;\nbigint constant STATE_VOID = 3;\n\n// Assets: index into the oracle table. Gold needs two feeds (USD/BCH and XAU/BCH).\nbigint constant ASSET_BTC = 0;\nbigint constant ASSET_ETH = 1;\nbigint constant ASSET_BCH = 2;\nbigint constant ASSET_GOLD = 3;\n// USD/BCH is in cents, XAU/BCH in ounces × 100000, so usd × 10^7 ÷ xau is dollars per ounce × 10^4.\nbigint constant GOLD_FACTOR = 10000000;\n\n// Modes (high nibble of the mode byte); outcomes are the low nibble.\nbigint constant MODE_UPDOWN = 0;\nbigint constant MODE_RANGES = 1;\nbigint constant NIBBLE = 16;\nbigint constant MAX_OUTCOMES = 6;\n\n// Stake classes (high nibble of the gate's class byte): satoshi bounds per entry and per gate.\nbigint constant CLASS_SHORT = 0;\nbigint constant CLASS_HOURLY = 1;\nbigint constant CLASS_EVENT = 2;\nbigint constant MIN_STAKE = 5000;\nbigint constant SHORT_MAX_STAKE = 500000;\nbigint constant HOURLY_MAX_STAKE = 5000000;\nbigint constant EVENT_MAX_STAKE = 25000000;\nbigint constant SHORT_GATE_CAP = 10000000;\nbigint constant HOURLY_GATE_CAP = 100000000;\nbigint constant EVENT_GATE_CAP = 500000000;\n\n// Fees and dust (satoshis). Lifecycle fees are fixed so every client builds the same bytes; calibrated on chipnet from\n// measured sizes (gold settle ~1,840 B, gold lock with one gate ~1,940 B, ~190 B per swept P2SH32 ticket) with headroom.\n// P2S tickets carry their ~112-byte script in the output: dust is 444 + 3 × ~188 B ≈ 1,008 sats, so 1,200.\nbigint constant TICKET_DUST = 1200;\n// Every gate is created holding exactly this; the lock counts anything beyond it as pot.\nbigint constant GATE_DUST = 1000;\n// An event entrant may leave before the lock; this share of the stake stays in the gate and joins the winners' pot.\nbigint constant EVENT_EXIT_FEE_BPS = 300;\n// P2PKH unlocking bytecode: 0x41 push, 64-byte Schnorr signature, then the sighash byte.\nbytes1 constant SIGNATURE_PUSH = 0x41;\nbigint constant SIGHASH_BYTE = 65;\nbigint constant MIN_FEE_OUTPUT = 1000;\nbigint constant LOCK_FEE_BASE = 1600;\nbigint constant LOCK_FEE_PER_GATE = 700;\nbigint constant SETTLE_FEE = 2200;\nbigint constant SWEEP_FEE_BASE = 1000;\nbigint constant SWEEP_FEE_PER_TICKET = 250;\n// Each swept ticket costs ~20,000 operation-cost units; 32 padding bytes buy 25,600 (measured).\nbigint constant SWEEP_PAD_PER_TICKET = 32;\nbigint constant PROTOCOL_FEE_BPS = 200;\nbigint constant MAX_CREATOR_FEE_BPS = 300;\nbigint constant BPS = 10000;\n\n// Lifecycle transactions take every input at this sequence; the SDK default (0xfffffffe) would allow a second variant.\nbigint constant FINAL_SEQUENCE = 4294967295;\n// Timeout paths need a non-final sequence so the node enforces their locktime.\nbigint constant TIMEOUT_SEQUENCE = 4294967294;\nbigint constant TX_VERSION = 2;\n// After T_close, how long settlement has before anyone may void the round (MTP lags about an hour on mainnet).\nbigint constant SETTLE_TIMEOUT = 21600;\n\nfunction maxStake(bigint stakeClass) returns (int) {\n    require(stakeClass >= CLASS_SHORT && stakeClass <= CLASS_EVENT, \"unknown stake class\");\n    bigint limit = SHORT_MAX_STAKE;\n    if (stakeClass == CLASS_HOURLY) {\n        limit = HOURLY_MAX_STAKE;\n    } else if (stakeClass == CLASS_EVENT) {\n        limit = EVENT_MAX_STAKE;\n    }\n    return limit;\n}\n\nfunction gateCap(bigint stakeClass) returns (int) {\n    bigint cap = SHORT_GATE_CAP;\n    if (stakeClass == CLASS_HOURLY) {\n        cap = HOURLY_GATE_CAP;\n    } else if (stakeClass == CLASS_EVENT) {\n        cap = EVENT_GATE_CAP;\n    }\n    return cap;\n}\n\n// Gold in ten-thousandths of a US dollar per ounce, from the USD/BCH and XAU/BCH prices of the same minute.\nfunction goldPrice(bigint usdPerBch, bigint xauPerBch) returns (int) {\n    return usdPerBch * GOLD_FACTOR / xauPerBch;\n}\n\n\n// A player's entry (an immutable NFT of category K, 32 bytes):\n//   [0] tag 0x03 · [1,5) round id · [5] gate index · [6] outcome · [7,12) stake · [12,32) payout pubkey hash\n// It moves only together with its own round master once settled or void (payout or refund), or with its own gate\n// (an event's exit before lock). Those functions account for every input, so nobody can sweep it elsewhere.\ncontract Ticket(bytes32 category) {\n    function spend() {\n        bytes own = tx.inputs[this.activeInputIndex].nftCommitment;\n        bytes first = tx.inputs[0].nftCommitment;\n        require(first.slice(1, 5) == own.slice(1, 5), \"input 0 belongs to another round\");\n\n        bool byMaster = tx.inputs[0].tokenCategory == category + 0x01\n            && first.slice(0, 1) == TAG_MASTER\n            && bigint(first.slice(5, 6)) >= STATE_SETTLED;\n        bool byGate = tx.inputs[0].tokenCategory == category + 0x02\n            && first.slice(0, 1) == TAG_GATE\n            && first.slice(5, 6) == own.slice(5, 6);\n        require(byMaster || byGate, \"a ticket moves only with its settled master or its own gate\");\n    }\n}\n",
  "debug": {
    "bytecode": "c0cf00cf76557f75517f775279557f75517f778800ce5379517e876376517f7551876700686376567f75557f778152a267006800ce547a527e876378517f7552876700686378567f75557f775379567f75557f77876700687c6351677668777777",
    "sourceMap": "109:30:109:51;:20::66:1;110:32:110:33:0;:22::48:1;111:16:111:21:0;:31::32;:16::33:1;;:28::29:0;:16::33:1;;:37::40:0;;:50::51;:37::52:1;;:47::48:0;:37::52:1;;:8::90;113:34:113:35:0;:24::50:1;:54::62:0;;:65::69;:54:::1;:24;::114:46:0;114:15::20;:30::31;:15::32:1;;9:29:9:33:0;114:15:114:46:1;113:24;;;::115:57:0;115:22::27;:37::38;:22::39:1;;:34::35:0;:22::39:1;;:15::40;16:32:16:33:0;115:15:115:57:1;113:24;;;116:32:116:33:0;:22::48:1;:52::60:0;;:63::67;:52:::1;:22;::117:44:0;117:15::20;:30::31;:15::32:1;;10:27:10:31:0;117:15:117:44:1;116:22;;;::118:51:0;118:15::20;:30::31;:15::32:1;;:27::28:0;:15::32:1;;:36::39:0;;:49::50;:36::51:1;;:46::47:0;:36::51:1;;:15;116:22;;;119:16:119:24:0;:::34;;::::1;:28:::0;:8::99:1;108:4:120:5;;",
    "logs": [],
    "requires": [
      {
        "ip": 20,
        "line": 111,
        "message": "input 0 belongs to another round"
      },
      {
        "ip": 95,
        "line": 119,
        "message": "a ticket moves only with its settled master or its own gate"
      }
    ]
  },
  "fingerprint": "e33b39c585f0ca70bf3613bdae076cf7ba1fd5227249308ae267d90d8bdbcb23",
  "compiler": {
    "name": "solidc",
    "version": "0.51.0",
    "options": {
      "enforceFunctionParameterTypes": true,
      "enforceLocktimeGuard": false,
      "enforceFinalRequire": true,
      "allowUnsafeOperations": false,
      "commitmentLimit": 128,
      "messageBus": false
    }
  },
  "updatedAt": "2026-11-19T09:12:38.183Z",
  "invocationAnalysis": {
    "version": 1,
    "protocolVersions": [
      1
    ],
    "functions": [
      {
        "id": 3,
        "name": "spend",
        "arity": 0,
        "entryPoint": true,
        "selector": "f598582f",
        "calls": [],
        "closure": [
          3
        ],
        "component": 0,
        "recursive": false,
        "reads": [],
        "writes": [],
        "effects": [],
        "unknown": false,
        "bounded": true,
        "maximumDirectInvocations": 0
      }
    ],
    "components": [
      {
        "id": 0,
        "functions": [
          3
        ],
        "recursive": false
      }
    ]
  }
} as const;
