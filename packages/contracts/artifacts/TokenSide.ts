export default {
  "contractName": "TokenSide",
  "constructorInputs": [
    {
      "name": "category",
      "type": "bytes32"
    }
  ],
  "abi": [
    {
      "name": "move",
      "inputs": []
    }
  ],
  "bytecode": "OP_INPUTINDEX OP_OUTPOINTTXHASH OP_0 OP_0 OP_BEGIN OP_DUP OP_TXINPUTCOUNT OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_DUP OP_OUTPOINTTXHASH OP_3 OP_PICK OP_EQUAL OP_IF OP_DUP OP_UTXOTOKENCATEGORY OP_DUP OP_5 OP_PICK OP_2 OP_CAT OP_EQUAL OP_IF OP_OVER OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP OP_2 OP_EQUAL OP_IF OP_1 OP_2SWAP OP_NIP OP_ROT OP_ENDIF OP_ELSE OP_DUP OP_5 OP_PICK OP_1 OP_CAT OP_EQUAL OP_IF OP_OVER OP_UTXOTOKENCOMMITMENT OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUAL OP_IF OP_1 OP_2SWAP OP_NIP OP_ROT OP_ENDIF OP_ENDIF OP_ENDIF OP_DROP OP_ENDIF OP_1ADD OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_NIP OP_NIP",
  "source": "pragma cashscript ^0.14.0;\n\nimport \"./rules.cash\";\n\n// A dollar round's dollars (fungible tokens of the dollar category), held beside one of its gates, or beside its\n// master from the lock on. It has no rules of its own about amounts: it only insists on moving together with the gate\n// or master it was made with, whose exact-shape rules (DollarGate, DollarMasterOpen/Locked/Sweep) then decide every\n// unit. \"Made with\" means created by the same transaction: every function that moves a gate or master re-creates its\n// sidecar in that same transaction, so the pair always shares an outpoint transaction hash, and no other round's gate\n// or master ever does (one transaction never makes two rounds' gates or masters).\ncontract TokenSide(bytes32 category) {\n    function move() {\n        bytes parent = tx.inputs[this.activeInputIndex].outpointTransactionHash;\n        bool paired = false;\n        for (int i = 0; i < tx.inputs.length; i++) {\n            if (tx.inputs[i].outpointTransactionHash == parent) {\n                bytes held = tx.inputs[i].tokenCategory;\n                if (held == category + 0x02) {\n                    if (tx.inputs[i].nftCommitment.slice(0, 1) == TAG_GATE) {\n                        paired = true;\n                    }\n                } else if (held == category + 0x01) {\n                    if (tx.inputs[i].nftCommitment.slice(0, 1) == TAG_MASTER) {\n                        paired = true;\n                    }\n                }\n            }\n        }\n        require(paired, \"a sidecar moves only with the gate or master it was made with\");\n    }\n}\n",
  "fingerprint": "1ed0ca4b4e44270c461cd5a44b71addc103c5e4a0531e8c490f2a702d8adf07f",
  "debug": {
    "bytecode": "c0c800006576c39f766b6376c85379876376ce765579527e876378cf517f755287635172777b6867765579517e876378cf517f755187635172777b68686875688b686c9166757777",
    "sourceMap": "13:33:13:54;:23::79:1;14:22:14:27:0;15:21:15:22;:8:28:9;:24:15:25;:28::44;:24:::1;;;:51:28:9:0;16:26:16:27;:16::52:1;:56::62:0;;:16:::1;:64:27:13:0;17:39:17:40;:29::55:1;18:20:18:24:0;:28::36;;:39::43;:28:::1;:20;:45:22:17:0;19:34:19:35;:24::50:1;:60::61:0;:24::62:1;;:66::74;:24;:76:21:21:0;20:33:20:37;:24::38:1;;;19:76:21:21;22:23:26:17:0;:27:22:31;:35::43;;:46::50;:35:::1;:27;:52:26:17:0;23:34:23:35;:24::50:1;:60::61:0;:24::62:1;;:66::76;:24;:78:25:21:0;24:33:24:37;:24::38:1;;;23:78:25:21;22:52:26:17;:23;16:64:27:13;;15:46:15:49;:51:28:9;;:8;;;12:20:30:5;",
    "logs": [],
    "requires": [
      {
        "ip": 71,
        "line": 29,
        "message": "a sidecar moves only with the gate or master it was made with"
      }
    ],
    "sourceTags": "62:62:sc;64:64:fu;65:68:lc;69:69:sc;70:71:sc",
    "functions": [
      {
        "name": "TAG_GATE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "52",
        "sourceMap": "8:26:8:30",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "TAG_MASTER",
        "kind": "constant",
        "inputs": [],
        "bytecode": "51",
        "sourceMap": "7:28:7:32",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      }
    ],
    "sources": {
      "rules.cash": "pragma cashscript ^0.14.0;\n\n// Jōge's shared rules: NFT tags, round states, stake classes and fixed lifecycle fees.\n// Every number here is mirrored in packages/sdk/src/round/constants.ts; change both together.\n\n// First byte of every commitment of category K.\nbytes constant TAG_MASTER = 0x01;\nbytes constant TAG_GATE = 0x02;\nbytes constant TAG_TICKET = 0x03;\n\n// Master state byte (offset 5).\nbytes constant STATE_OPEN = 0x00;\nbytes constant STATE_LOCKED = 0x01;\nint constant STATE_SETTLED = 2;\nint constant STATE_VOID = 3;\n\n// Assets: index into the oracle table. Gold needs two feeds (USD/BCH and XAU/BCH).\nint constant ASSET_BTC = 0;\nint constant ASSET_ETH = 1;\nint constant ASSET_BCH = 2;\nint constant ASSET_GOLD = 3;\n// USD/BCH is in cents, XAU/BCH in ounces × 100000, so usd × 10^7 ÷ xau is dollars per ounce × 10^4.\nint constant GOLD_FACTOR = 10000000;\n\n// Modes (high nibble of the mode byte); outcomes are the low nibble.\nint constant MODE_UPDOWN = 0;\nint constant MODE_RANGES = 1;\nint constant NIBBLE = 16;\nint constant MAX_OUTCOMES = 6;\n\n// Stake classes (high nibble of the gate's class byte): satoshi bounds per entry and per gate.\nint constant CLASS_SHORT = 0;\nint constant CLASS_HOURLY = 1;\nint constant CLASS_EVENT = 2;\nint constant MIN_STAKE = 5000;\nint constant SHORT_MAX_STAKE = 500000;\nint constant HOURLY_MAX_STAKE = 5000000;\nint constant EVENT_MAX_STAKE = 25000000;\nint constant SHORT_GATE_CAP = 10000000;\nint constant HOURLY_GATE_CAP = 100000000;\nint constant EVENT_GATE_CAP = 500000000;\n\n// Fees and dust (satoshis). Lifecycle fees are fixed so every client builds the same bytes; calibrated on chipnet from\n// measured sizes (gold settle ~1,840 B, gold lock with one gate ~1,940 B, ~190 B per swept P2SH32 ticket) with headroom.\n// P2S tickets carry their ~112-byte script in the output: dust is 444 + 3 × ~188 B ≈ 1,008 sats, so 1,200.\nint constant TICKET_DUST = 1200;\n// Every gate is created holding exactly this; the lock counts anything beyond it as pot.\nint constant GATE_DUST = 1000;\n// An event entrant may leave before the lock; this share of the stake stays in the gate and joins the winners' pot.\nint constant EVENT_EXIT_FEE_BPS = 300;\n// P2PKH unlocking bytecode: 0x41 push, 64-byte Schnorr signature, then the sighash byte.\nbytes constant SIGNATURE_PUSH = 0x41;\nint constant SIGHASH_BYTE = 65;\nint constant MIN_FEE_OUTPUT = 1000;\nint constant LOCK_FEE_BASE = 1600;\nint constant LOCK_FEE_PER_GATE = 700;\n// An event gate's script is nearly twice a lane gate's (~690 bytes per merged gate, measured 2026-11-17: a 2-gate event\n// lock is ~3,090 bytes, which 1,600 + 2 × 700 could not pay), so events pay more per gate.\nint constant EVENT_LOCK_FEE_PER_GATE = 1100;\nint constant SETTLE_FEE = 2200;\nint constant SWEEP_FEE_BASE = 1000;\nint constant SWEEP_FEE_PER_TICKET = 250;\n// Each swept ticket costs ~20,000 operation-cost units; 32 padding bytes buy 25,600 (measured).\nint constant SWEEP_PAD_PER_TICKET = 32;\nint constant PROTOCOL_FEE_BPS = 200;\nint constant MAX_CREATOR_FEE_BPS = 300;\nint constant BPS = 10000;\n\n// Lifecycle transactions take every input at this sequence; the SDK default (0xfffffffe) would allow a second variant.\nint constant FINAL_SEQUENCE = 4294967295;\n// Timeout paths need a non-final sequence so the node enforces their locktime.\nint constant TIMEOUT_SEQUENCE = 4294967294;\nint constant TX_VERSION = 2;\n// After T_close, how long settlement has before anyone may void the round (MTP lags about an hour on mainnet).\nint constant SETTLE_TIMEOUT = 21600;\n\nfunction maxStake(int stakeClass) returns (int) {\n    require(stakeClass >= CLASS_SHORT && stakeClass <= CLASS_EVENT, \"unknown stake class\");\n    int limit = SHORT_MAX_STAKE;\n    if (stakeClass == CLASS_HOURLY) {\n        limit = HOURLY_MAX_STAKE;\n    } else if (stakeClass == CLASS_EVENT) {\n        limit = EVENT_MAX_STAKE;\n    }\n    return limit;\n}\n\nfunction gateCap(int stakeClass) returns (int) {\n    int cap = SHORT_GATE_CAP;\n    if (stakeClass == CLASS_HOURLY) {\n        cap = HOURLY_GATE_CAP;\n    } else if (stakeClass == CLASS_EVENT) {\n        cap = EVENT_GATE_CAP;\n    }\n    return cap;\n}\n\n// Gold in ten-thousandths of a US dollar per ounce, from the USD/BCH and XAU/BCH prices of the same minute.\nfunction goldPrice(int usdPerBch, int xauPerBch) returns (int) {\n    return usdPerBch * GOLD_FACTOR / xauPerBch;\n}\n"
    },
    "inlineRanges": "32:32:TAG_GATE;53:53:TAG_MASTER"
  },
  "compiler": {
    "name": "cashc",
    "version": "0.14.0",
    "options": {
      "enforceFunctionParameterTypes": true,
      "enforceLocktimeGuard": false
    }
  },
  "updatedAt": "2026-11-19T09:12:36.976Z"
} as const;
