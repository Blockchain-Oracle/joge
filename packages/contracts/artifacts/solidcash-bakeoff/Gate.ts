export default {
  "contractName": "Gate",
  "constructorInputs": [
    {
      "name": "category",
      "type": "bytes32"
    },
    {
      "name": "ticketLockingBytecode",
      "type": "bytes"
    }
  ],
  "abi": [
    {
      "name": "enter",
      "selector": "9de49748",
      "inputs": [
        {
          "name": "outcome",
          "type": "bigint"
        },
        {
          "name": "stake",
          "type": "bigint"
        },
        {
          "name": "payoutPkh",
          "type": "bytes20"
        }
      ],
      "sourceEffectOrder": "unsupported-flow"
    },
    {
      "name": "merge",
      "selector": "dbdb9c3e",
      "inputs": [],
      "sourceEffectOrder": "linear"
    }
  ],
  "bytecode": "007900a263007952a1670068690320a1075179519c6303404b4c517a75675179529c630440787d01517a756868007a538a77 OP_0 OP_DEFINE 04809698005179519c630400e1f505517a75675179529c63040065cd1d517a756868007a538a77 OP_1 OP_DEFINE 54798201148875c0009d00ce78527e8800cf76517f75528876577f75567f77817660967c60975579007ba56955790288135279008a8b538aa5695a557955959352797855937f75787f778153795a7f75577f77815479577f757c8b53807e547953797f755a7f777e7c58799355807e5379547982777f757b55937f777e00cd00c78800d15479527e8800d3009d00d28800cc00c65779939d00cc7c518aa169537c567f75517f777e537a51807e537a55807e537a7e51cd537a8851d17b8851d3009d51d28851cc02b0049dc453a16951c4539c6352d100877768516576c39f6376ce00888b006751686675 9de49748 OP_DEFINE c0cf00cf00ce537a517e8876517f75518876567f75557f77010088557f75517f777c557f75517f778777 dbdb9c3e OP_DEFINE 765102ff008d9301218001207f77010088 OP_3 OP_DEFINE OP_DEPTH OP_1SUB OP_ROLL OP_SIZE OP_4 OP_NUMEQUALVERIFY OP_INVOKE",
  "source": "pragma solidcash ^0.51.0;\n\n// SolidCash port of cashscript/Gate.cash (S00 bake-off; kept in step for BAKEOFF=1 runs).\n\n// Jōge's shared rules: NFT tags, round states, stake classes and fixed lifecycle fees.\n// Generated from cashscript/rules.cash (same values); mirrored in packages/sdk/src/round/constants.ts.\n\n// First byte of every commitment of category K.\nbytes1 constant TAG_MASTER = 0x01;\nbytes1 constant TAG_GATE = 0x02;\nbytes1 constant TAG_TICKET = 0x03;\n\n// Master state byte (offset 5).\nbytes1 constant STATE_OPEN = 0x00;\nbytes1 constant STATE_LOCKED = 0x01;\nbigint constant STATE_SETTLED = 2;\nbigint constant STATE_VOID = 3;\n\n// Assets: index into the oracle table. Gold needs two feeds (USD/BCH and XAU/BCH).\nbigint constant ASSET_BTC = 0;\nbigint constant ASSET_ETH = 1;\nbigint constant ASSET_BCH = 2;\nbigint constant ASSET_GOLD = 3;\n// USD/BCH is in cents, XAU/BCH in ounces × 100000, so usd × 10^7 ÷ xau is dollars per ounce × 10^4.\nbigint constant GOLD_FACTOR = 10000000;\n\n// Modes (high nibble of the mode byte); outcomes are the low nibble.\nbigint constant MODE_UPDOWN = 0;\nbigint constant MODE_RANGES = 1;\nbigint constant NIBBLE = 16;\nbigint constant MAX_OUTCOMES = 6;\n\n// Stake classes (high nibble of the gate's class byte): satoshi bounds per entry and per gate.\nbigint constant CLASS_SHORT = 0;\nbigint constant CLASS_HOURLY = 1;\nbigint constant CLASS_EVENT = 2;\nbigint constant MIN_STAKE = 5000;\nbigint constant SHORT_MAX_STAKE = 500000;\nbigint constant HOURLY_MAX_STAKE = 5000000;\nbigint constant EVENT_MAX_STAKE = 25000000;\nbigint constant SHORT_GATE_CAP = 10000000;\nbigint constant HOURLY_GATE_CAP = 100000000;\nbigint constant EVENT_GATE_CAP = 500000000;\n\n// Fees and dust (satoshis). Lifecycle fees are fixed so every client builds the same bytes; calibrated in S00 from\n// measured sizes (gold settle ~1,840 B, gold lock with one gate ~1,940 B, ~190 B per swept P2SH32 ticket) with headroom.\n// P2S tickets carry their ~112-byte script in the output: dust is 444 + 3 × ~188 B ≈ 1,008 sats, so 1,200.\nbigint constant TICKET_DUST = 1200;\n// Every gate is created holding exactly this; the lock counts anything beyond it as pot.\nbigint constant GATE_DUST = 1000;\n// An event entrant may leave before the lock; this share of the stake stays in the gate and joins the winners' pot.\nbigint constant EVENT_EXIT_FEE_BPS = 300;\n// P2PKH unlocking bytecode: 0x41 push, 64-byte Schnorr signature, then the sighash byte.\nbytes1 constant SIGNATURE_PUSH = 0x41;\nbigint constant SIGHASH_BYTE = 65;\nbigint constant MIN_FEE_OUTPUT = 1000;\nbigint constant LOCK_FEE_BASE = 1600;\nbigint constant LOCK_FEE_PER_GATE = 700;\nbigint constant SETTLE_FEE = 2200;\nbigint constant SWEEP_FEE_BASE = 1000;\nbigint constant SWEEP_FEE_PER_TICKET = 250;\n// Each swept ticket costs ~20,000 operation-cost units; 32 padding bytes buy 25,600 (measured in S00).\nbigint constant SWEEP_PAD_PER_TICKET = 32;\nbigint constant PROTOCOL_FEE_BPS = 200;\nbigint constant MAX_CREATOR_FEE_BPS = 300;\nbigint constant BPS = 10000;\n\n// Lifecycle transactions take every input at this sequence; the SDK default (0xfffffffe) would allow a second variant.\nbigint constant FINAL_SEQUENCE = 4294967295;\n// Timeout paths need a non-final sequence so the node enforces their locktime.\nbigint constant TIMEOUT_SEQUENCE = 4294967294;\nbigint constant TX_VERSION = 2;\n// After T_close, how long settlement has before anyone may void the round (MTP lags about an hour on mainnet).\nbigint constant SETTLE_TIMEOUT = 21600;\n\nfunction maxStake(bigint stakeClass) returns (int) {\n    require(stakeClass >= CLASS_SHORT && stakeClass <= CLASS_EVENT, \"unknown stake class\");\n    bigint limit = SHORT_MAX_STAKE;\n    if (stakeClass == CLASS_HOURLY) {\n        limit = HOURLY_MAX_STAKE;\n    } else if (stakeClass == CLASS_EVENT) {\n        limit = EVENT_MAX_STAKE;\n    }\n    return limit;\n}\n\nfunction gateCap(bigint stakeClass) returns (int) {\n    bigint cap = SHORT_GATE_CAP;\n    if (stakeClass == CLASS_HOURLY) {\n        cap = HOURLY_GATE_CAP;\n    } else if (stakeClass == CLASS_EVENT) {\n        cap = EVENT_GATE_CAP;\n    }\n    return cap;\n}\n\n// Gold in ten-thousandths of a US dollar per ounce, from the USD/BCH and XAU/BCH prices of the same minute.\nfunction goldPrice(bigint usdPerBch, bigint xauPerBch) returns (int) {\n    return usdPerBch * GOLD_FACTOR / xauPerBch;\n}\n\n\n// One of a round's G entry gates (a minting NFT of category K). Entries spread over gates so two players rarely race\n// for the same coin. Commitment, at most 40 bytes because Selene refuses to sign inputs with longer commitments:\n//   [0] tag 0x02 · [1,5) round id · [5] gate index · [6] stake class << 4 | outcomes\n//   [7,10) live entrant count · [10, 10 + 5·N) stake total per outcome\ncontract Gate(bytes32 category, bytes ticketLockingBytecode) {\n    // A player stakes on `outcome`. The player's authority is their own coin at input 1 (signed by their wallet);\n    // the ticket records the payout address the winnings go to.\n    function enter(bigint outcome, bigint stake, bytes20 payoutPkh) {\n        require(this.activeInputIndex == 0, \"the gate must be input 0\");\n        require(tx.inputs[0].tokenCategory == category + 0x02, \"input 0 must be a gate\");\n        bytes state = tx.inputs[0].nftCommitment;\n        require(state.slice(0, 1) == TAG_GATE, \"not a gate commitment\");\n\n        bigint classAndOutcomes = bigint(state.slice(6, 7));\n        bigint stakeClass = classAndOutcomes / NIBBLE;\n        bigint outcomes = classAndOutcomes % NIBBLE;\n        require(within(outcome, 0, outcomes), \"no such outcome\");\n        require(within(stake, MIN_STAKE, maxStake(stakeClass) + 1), \"stake outside this round's bounds\");\n\n        // New totals: one more entrant, the stake added to its outcome.\n        bigint start = 10 + outcome * 5;\n        bigint total = bigint(state.slice(start, start + 5));\n        bigint entrants = bigint(state.slice(7, 10));\n        bytes next = state.slice(0, 7) + toPaddedBytes(entrants + 1, 3) + state.slice(10, start)\n            + toPaddedBytes(total + stake, 5) + state.slice(start + 5, state.length);\n\n        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, \"gate must come back to itself\");\n        require(tx.outputs[0].tokenCategory == category + 0x02, \"gate keeps its minting NFT\");\n        require(tx.outputs[0].tokenAmount == 0, \"no fungible tokens\");\n        require(tx.outputs[0].nftCommitment == next, \"gate totals must add this stake\");\n        require(tx.outputs[0].value == tx.inputs[0].value + stake, \"gate must hold the stake\");\n        require(tx.outputs[0].value <= gateCap(stakeClass), \"gate is full\");\n\n        bytes ticket = TAG_TICKET + state.slice(1, 6) + toPaddedBytes(outcome, 1) + toPaddedBytes(stake, 5) + payoutPkh;\n        require(tx.outputs[1].lockingBytecode == ticketLockingBytecode, \"output 1 must be the ticket\");\n        require(tx.outputs[1].tokenCategory == category, \"ticket is an immutable NFT of the round's category\");\n        require(tx.outputs[1].tokenAmount == 0, \"no fungible tokens\");\n        require(tx.outputs[1].nftCommitment == ticket, \"ticket must record round, gate, outcome, stake and payee\");\n        require(tx.outputs[1].value == TICKET_DUST, \"ticket carries the fixed dust\");\n\n        // Nothing else may carry tokens in or out (stops smuggling another ticket or leaking minting K).\n        require(tx.outputs.length <= 3, \"at most gate, ticket and change\");\n        bool changeIsPlain = true;\n        if (tx.outputs.length == 3) {\n            changeIsPlain = tx.outputs[2].tokenCategory == 0x;\n        }\n        for (bigint i = 1; i < tx.inputs.length; i++) {\n            require(tx.inputs[i].tokenCategory == 0x, \"funding inputs carry no tokens\");\n        }\n        require(changeIsPlain, \"change carries no tokens\");\n    }\n\n    // The round's lock spends every gate together with its master; the master's lock function checks everything.\n    function merge() {\n        bytes own = tx.inputs[this.activeInputIndex].nftCommitment;\n        bytes master = tx.inputs[0].nftCommitment;\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be the round master\");\n        require(master.slice(0, 1) == TAG_MASTER, \"not a master commitment\");\n        require(master.slice(5, 6) == STATE_OPEN, \"the round is not open\");\n        require(master.slice(1, 5) == own.slice(1, 5), \"the master belongs to another round\");\n    }\n}\n",
  "debug": {
    "bytecode": "32007900a263007952a1670068690320a1075179519c6303404b4c517a75675179529c630440787d01517a756868007a538a7700892704809698005179519c630400e1f505517a75675179529c63040065cd1d517a756868007a538a7751894ceb54798201148875c0009d00ce78527e8800cf76517f75528876577f75567f77817660967c60975579007ba56955790288135279008a8b538aa5695a557955959352797855937f75787f778153795a7f75577f77815479577f757c8b53807e547953797f755a7f777e7c58799355807e5379547982777f757b55937f777e00cd00c78800d15479527e8800d3009d00d28800cc00c65779939d00cc7c518aa169537c567f75517f777e537a51807e537a55807e537a7e51cd537a8851d17b8851d3009d51d28851cc02b0049dc453a16951c4539c6352d100877768516576c39f6376ce00888b006751686675049de49748892ac0cf00cf00ce537a517e8876517f75518876567f75557f77010088557f75517f777c557f75517f77877704dbdb9c3e8911765102ff008d9301218001207f770100885389748c7a82549d8a",
    "sourceMap": "76::85:1;;;87::95;;;110:4:153:5;;;156::163;;;107:0:164:1;;;;;;;;;",
    "logs": [],
    "requires": [],
    "functionDebug": {
      "9de49748": {
        "requires": [
          {
            "ip": 8,
            "line": 111,
            "message": "the gate must be input 0"
          },
          {
            "ip": 14,
            "line": 112,
            "message": "input 0 must be a gate"
          },
          {
            "ip": 22,
            "line": 114,
            "message": "not a gate commitment"
          },
          {
            "ip": 42,
            "line": 119,
            "message": "no such outcome"
          },
          {
            "ip": 54,
            "line": 120,
            "message": "stake outside this round's bounds"
          },
          {
            "ip": 126,
            "line": 129,
            "message": "gate must come back to itself"
          },
          {
            "ip": 133,
            "line": 130,
            "message": "gate keeps its minting NFT"
          },
          {
            "ip": 137,
            "line": 131,
            "message": "no fungible tokens"
          },
          {
            "ip": 140,
            "line": 132,
            "message": "gate totals must add this stake"
          },
          {
            "ip": 148,
            "line": 133,
            "message": "gate must hold the stake"
          },
          {
            "ip": 155,
            "line": 134,
            "message": "gate is full"
          },
          {
            "ip": 182,
            "line": 137,
            "message": "output 1 must be the ticket"
          },
          {
            "ip": 186,
            "line": 138,
            "message": "ticket is an immutable NFT of the round's category"
          },
          {
            "ip": 190,
            "line": 139,
            "message": "no fungible tokens"
          },
          {
            "ip": 193,
            "line": 140,
            "message": "ticket must record round, gate, outcome, stake and payee"
          },
          {
            "ip": 197,
            "line": 141,
            "message": "ticket carries the fixed dust"
          },
          {
            "ip": 201,
            "line": 144,
            "message": "at most gate, ticket and change"
          },
          {
            "ip": 222,
            "line": 150,
            "message": "funding inputs carry no tokens"
          },
          {
            "ip": 229,
            "line": 152,
            "message": "change carries no tokens"
          }
        ],
        "logs": [],
        "sourceMap": "110:49:110:66;;;;;;111:16:111:37;:41::42;:8::72:1;112:26:112:27:0;:16::42:1;:46::54:0;:57::61;:46:::1;:8::89;113:32:113:33:0;:22::48:1;114:16:114:21:0;:31::32;:16::33:1;;10:27:10:31:0;114:8:114:72:1;116:41:116:46:0;:56::57;:41::58:1;;:53::54:0;:41::58:1;;:34::59;117:28:117:44:0;30:25:30:27;117:28:117:53:1;118:26:118:42:0;30:25:30:27;118:26:118:51:1;119:23:119:30:0;;:32::33;:35::43;:16::44:1;:8::65;120:23:120:28:0;;37:28:37:32;120:50:120:60;;:41::61:1;;:::65;;;:16::66;:8::105;123:23:123:25:0;:28::35;;:38::39;:28:::1;:23;124:30:124:35:0;;:49::54;:57::58;:49:::1;:30::59;;:42::47:0;:30::59:1;;:23::60;125:33:125:38:0;;:48::50;:33::51:1;;:45::46:0;:33::51:1;;:26::52;126:21:126:26:0;;:36::37;:21::38:1;;:55::63:0;:::67:1;:69::70:0;:41::71:1;:21;:74::79:0;;:90::95;;:74::96:1;;:86::88:0;:74::96:1;;:21;127:28:127:33:0;:36::41;;:28:::1;:43::44:0;:14::45:1;126:21;127:48::53:0;;:71::76;;:::83:1;;:48::84;;:60::65:0;:68::69;:60:::1;:48::84;;126:21;129:27:129:28:0;:16::45:1;:59::60:0;:49::77:1;:8::112;130:27:130:28:0;:16::43:1;:47::55:0;;:58::62;:47:::1;:8::94;131:27:131:28:0;:16::41:1;:45::46:0;:8::70:1;132:27:132:28:0;:16::43:1;:8::88;133:27:133:28:0;:16::35:1;:49::50:0;:39::57:1;:60::65:0;;:39:::1;:8::95;134:27:134:28:0;:16::35:1;:47::57:0;:39::58:1;;:16;:8::76;11:29:11:33:0;136:36:136:41;:51::52;:36::53:1;;:48::49:0;:36::53:1;;:23;:70::77:0;;:79::80;:56::81:1;:23;:98::103:0;;:105::106;:84::107:1;:23;:110::119:0;;:23:::1;137:27:137:28:0;:16::45:1;:49::70:0;;:8::103:1;138:27:138:28:0;:16::43:1;:47::55:0;:8::111:1;139:27:139:28:0;:16::41:1;:45::46:0;:8::70:1;140:27:140:28:0;:16::43:1;:8::115;141:27:141:28:0;:16::35:1;48:30:48:34:0;141:8:141:85:1;144:16:144:33:0;:37::38;:16:::1;:8::75;145:29:145:33:0;146:12:146:29;:33::34;:12:::1;:36:148:9:0;147:39:147:40;:28::55:1;:59::61:0;:28:::1;:12::62;146:36:148:9;149:24:149:25:0;:8:151:9;:27:149:28;:31::47;:27:::1;:8:151:9:0;150:30:150:31;:20::46:1;:50::52:0;:12::88:1;149:49:149:52;:8:151:9;;;;;110:4:153:5"
      },
      "dbdb9c3e": {
        "requires": [
          {
            "ip": 10,
            "line": 159,
            "message": "input 0 must be the round master"
          },
          {
            "ip": 16,
            "line": 160,
            "message": "not a master commitment"
          },
          {
            "ip": 25,
            "line": 161,
            "message": "the round is not open"
          },
          {
            "ip": 40,
            "line": 162,
            "message": "the master belongs to another round"
          }
        ],
        "logs": [],
        "sourceMap": "157:30:157:51;:20::66:1;158:33:158:34:0;:23::49:1;159:26:159:27:0;:16::42:1;:46::54:0;;:57::61;:46:::1;:8::99;160:16:160:22:0;:32::33;:16::34:1;;9:29:9:33:0;160:8:160:77:1;161:16:161:22:0;:32::33;:16::34:1;;:29::30:0;:16::34:1;;14:29:14:33:0;161:8:161:75:1;162:32:162:33:0;:16::34:1;;:29::30:0;:16::34:1;;:38::41:0;:51::52;:38::53:1;;:48::49:0;:38::53:1;;:8::94;156:4:163:5"
      }
    },
    "invokeDebug": {
      "0": {
        "bytecode": "007900a263007952a1670068690320a1075179519c6303404b4c517a75675179529c630440787d01517a756868007a538a77",
        "name": "maxStake",
        "requires": [
          {
            "ip": 12,
            "line": 77,
            "message": "unknown stake class"
          }
        ],
        "logs": [],
        "sourceMap": "77:12:77:22;;34:30:34:31;77:12:77:37:1;:::66:0;:41::51;;36:30:36:31;77:41:77:66:1;:12;;;:4::91;38:34:38:40:0;79:8:79:18;;35:31:35:32;79:8:79:34:1;:36:81:5:0;39:35:39:42;80:8:80:33:1;;;81:11:83:5:0;:15:81:25;;36:30:36:31;81:15:81:40:1;:42:83:5:0;40:34:40:42;82:8:82:32:1;;;81:42:83:5;:11;84::84:16:0;;:4::17:1;;"
      },
      "1": {
        "bytecode": "04809698005179519c630400e1f505517a75675179529c63040065cd1d517a756868007a538a77",
        "name": "gateCap",
        "requires": [],
        "logs": [],
        "sourceMap": "41:33:41:41;89:8:89:18;;35:31:35:32;89:8:89:34:1;:36:91:5:0;42:34:42:43;90:8:90:30:1;;;91:11:93:5:0;:15:91:25;;36:30:36:31;91:15:91:40:1;:42:93:5:0;43:33:43:42;92:8:92:29:1;;;91:42:93:5;:11;94::94:14:0;;:4::15:1;;"
      },
      "3": {
        "bytecode": "765102ff008d9301218001207f77010088",
        "name": "outlined source span 3",
        "requires": [],
        "logs": [],
        "sourceMap": "84:4:84:17:1;;;;;;;;;;;"
      }
    }
  },
  "functionBodies": {
    "9de49748": "54798201148875c0009d00ce78527e8800cf76517f75528876577f75567f77817660967c60975579007ba56955790288135279008a8b538aa5695a557955959352797855937f75787f778153795a7f75577f77815479577f757c8b53807e547953797f755a7f777e7c58799355807e5379547982777f757b55937f777e00cd00c78800d15479527e8800d3009d00d28800cc00c65779939d00cc7c518aa169537c567f75517f777e537a51807e537a55807e537a7e51cd537a8851d17b8851d3009d51d28851cc02b0049dc453a16951c4539c6352d100877768516576c39f6376ce00888b006751686675",
    "dbdb9c3e": "c0cf00cf00ce537a517e8876517f75518876567f75557f77010088557f75517f777c557f75517f778777"
  },
  "fingerprint": "01ad7863e402855a5ae3e9862c79d48da6d2ec0389510a50fd6a946b94354754",
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
  "updatedAt": "2026-11-18T19:51:46.295Z",
  "invocationAnalysis": {
    "version": 1,
    "protocolVersions": [
      1
    ],
    "functions": [
      {
        "id": 3,
        "name": "enter",
        "arity": 3,
        "entryPoint": true,
        "selector": "9de49748",
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
      },
      {
        "id": 4,
        "name": "merge",
        "arity": 0,
        "entryPoint": true,
        "selector": "dbdb9c3e",
        "calls": [],
        "closure": [
          4
        ],
        "component": 1,
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
      },
      {
        "id": 1,
        "functions": [
          4
        ],
        "recursive": false
      }
    ]
  }
} as const;
