export default {
  "contractName": "AgentVault",
  "constructorInputs": [
    {
      "name": "ownerPkh",
      "type": "bytes20"
    },
    {
      "name": "agentKey",
      "type": "pubkey"
    },
    {
      "name": "perBetCap",
      "type": "bigint"
    },
    {
      "name": "laneGateLockingBytecode",
      "type": "bytes"
    }
  ],
  "abi": [
    {
      "name": "bet",
      "selector": "109fbf1c",
      "inputs": [
        {
          "name": "agentSignature",
          "type": "sig"
        }
      ],
      "sourceEffectOrder": "linear",
      "signatureGuard": {
        "key": {
          "kind": "constructorArg",
          "name": "agentKey"
        }
      }
    },
    {
      "name": "withdraw",
      "selector": "dfea82f3",
      "inputs": [],
      "sourceEffectOrder": "unsupported-flow"
    }
  ],
  "bytecode": "547a7badc0519dc3529d00c7537a8851d27601207f755c7f777b885c7f75577f7781767ba169c4539d52cd51c78852d1008852cc51c67b9402b0049402dc05949c 109fbf1c OP_DEFINE 0376a9147c7e0288ac7e51ca51c77b8876517f7501418801418b7f7501417f77760141876351677601618768696d6d51 dfea82f3 OP_DEFINE OP_DEPTH OP_1SUB OP_ROLL OP_SIZE OP_4 OP_NUMEQUALVERIFY OP_INVOKE",
  "source": "pragma solidcash ^0.51.0;\n\n\n// Jōge's shared rules: NFT tags, round states, stake classes and fixed lifecycle fees.\n// Generated from cashscript/rules.cash (same values); mirrored in packages/sdk/src/round/constants.ts.\n\n// First byte of every commitment of category K.\nbytes1 constant TAG_MASTER = 0x01;\nbytes1 constant TAG_GATE = 0x02;\nbytes1 constant TAG_TICKET = 0x03;\n\n// Master state byte (offset 5).\nbytes1 constant STATE_OPEN = 0x00;\nbytes1 constant STATE_LOCKED = 0x01;\nbigint constant STATE_SETTLED = 2;\nbigint constant STATE_VOID = 3;\n\n// Assets: index into the oracle table. Gold needs two feeds (USD/BCH and XAU/BCH).\nbigint constant ASSET_BTC = 0;\nbigint constant ASSET_ETH = 1;\nbigint constant ASSET_BCH = 2;\nbigint constant ASSET_GOLD = 3;\n// USD/BCH is in cents, XAU/BCH in ounces × 100000, so usd × 10^7 ÷ xau is dollars per ounce × 10^4.\nbigint constant GOLD_FACTOR = 10000000;\n\n// Modes (high nibble of the mode byte); outcomes are the low nibble.\nbigint constant MODE_UPDOWN = 0;\nbigint constant MODE_RANGES = 1;\nbigint constant NIBBLE = 16;\nbigint constant MAX_OUTCOMES = 6;\n\n// Stake classes (high nibble of the gate's class byte): satoshi bounds per entry and per gate.\nbigint constant CLASS_SHORT = 0;\nbigint constant CLASS_HOURLY = 1;\nbigint constant CLASS_EVENT = 2;\nbigint constant MIN_STAKE = 5000;\nbigint constant SHORT_MAX_STAKE = 500000;\nbigint constant HOURLY_MAX_STAKE = 5000000;\nbigint constant EVENT_MAX_STAKE = 25000000;\nbigint constant SHORT_GATE_CAP = 10000000;\nbigint constant HOURLY_GATE_CAP = 100000000;\nbigint constant EVENT_GATE_CAP = 500000000;\n\n// Fees and dust (satoshis). Lifecycle fees are fixed so every client builds the same bytes; calibrated on chipnet from\n// measured sizes (gold settle ~1,840 B, gold lock with one gate ~1,940 B, ~190 B per swept P2SH32 ticket) with headroom.\n// P2S tickets carry their ~112-byte script in the output: dust is 444 + 3 × ~188 B ≈ 1,008 sats, so 1,200.\nbigint constant TICKET_DUST = 1200;\n// Every gate is created holding exactly this; the lock counts anything beyond it as pot.\nbigint constant GATE_DUST = 1000;\n// An event entrant may leave before the lock; this share of the stake stays in the gate and joins the winners' pot.\nbigint constant EVENT_EXIT_FEE_BPS = 300;\n// P2PKH unlocking bytecode: 0x41 push, 64-byte Schnorr signature, then the sighash byte.\nbytes1 constant SIGNATURE_PUSH = 0x41;\nbigint constant SIGHASH_BYTE = 65;\nbigint constant MIN_FEE_OUTPUT = 1000;\nbigint constant LOCK_FEE_BASE = 1600;\nbigint constant LOCK_FEE_PER_GATE = 700;\nbigint constant SETTLE_FEE = 2200;\nbigint constant SWEEP_FEE_BASE = 1000;\nbigint constant SWEEP_FEE_PER_TICKET = 250;\n// Each swept ticket costs ~20,000 operation-cost units; 32 padding bytes buy 25,600 (measured).\nbigint constant SWEEP_PAD_PER_TICKET = 32;\nbigint constant PROTOCOL_FEE_BPS = 200;\nbigint constant MAX_CREATOR_FEE_BPS = 300;\nbigint constant BPS = 10000;\n\n// Lifecycle transactions take every input at this sequence; the SDK default (0xfffffffe) would allow a second variant.\nbigint constant FINAL_SEQUENCE = 4294967295;\n// Timeout paths need a non-final sequence so the node enforces their locktime.\nbigint constant TIMEOUT_SEQUENCE = 4294967294;\nbigint constant TX_VERSION = 2;\n// After T_close, how long settlement has before anyone may void the round (MTP lags about an hour on mainnet).\nbigint constant SETTLE_TIMEOUT = 21600;\n\nfunction maxStake(bigint stakeClass) returns (int) {\n    require(stakeClass >= CLASS_SHORT && stakeClass <= CLASS_EVENT, \"unknown stake class\");\n    bigint limit = SHORT_MAX_STAKE;\n    if (stakeClass == CLASS_HOURLY) {\n        limit = HOURLY_MAX_STAKE;\n    } else if (stakeClass == CLASS_EVENT) {\n        limit = EVENT_MAX_STAKE;\n    }\n    return limit;\n}\n\nfunction gateCap(bigint stakeClass) returns (int) {\n    bigint cap = SHORT_GATE_CAP;\n    if (stakeClass == CLASS_HOURLY) {\n        cap = HOURLY_GATE_CAP;\n    } else if (stakeClass == CLASS_EVENT) {\n        cap = EVENT_GATE_CAP;\n    }\n    return cap;\n}\n\n// Gold in ten-thousandths of a US dollar per ounce, from the USD/BCH and XAU/BCH prices of the same minute.\nfunction goldPrice(bigint usdPerBch, bigint xauPerBch) returns (int) {\n    return usdPerBch * GOLD_FACTOR / xauPerBch;\n}\n\n\n// An AI agent's budget, owned by a player. The agent's key (held by Jōge's server, signed by the server's SDK, never\n// routed to a wallet) can only enter standard lane rounds for the owner, within a per-bet cap; the owner takes\n// everything back at any time. Daily limits and timing are the runner's rules on top (it never enters after\n// T_lock − margin); the covenant is what keeps a leaked agent key from doing anything else with the money.\nbigint constant AGENT_BET_FEE = 1500;\n\ncontract AgentVault(bytes20 ownerPkh, pubkey agentKey, bigint perBetCap, bytes laneGateLockingBytecode) {\n    // Input 0 is a lane gate running `enter` (which checks the stake bounds, the gate and the ticket); this vault is\n    // input 1 and pays the stake. The ticket must pay the owner; the rest of the budget comes back to the vault.\n    function bet(sig agentSignature) {\n        require(checkSig(agentSignature, agentKey), \"only the agent's key bets\");\n        require(this.activeInputIndex == 1, \"the vault pays as input 1\");\n        require(tx.inputs.length == 2, \"a lane gate and this vault only\");\n        require(tx.inputs[0].lockingBytecode == laneGateLockingBytecode, \"agents enter standard lane rounds only\");\n        bytes ticket = tx.outputs[1].nftCommitment;\n        require(ticket.slice(12, 32) == bytes(ownerPkh), \"the ticket pays the vault's owner\");\n        bigint stake = bigint(ticket.slice(7, 12));\n        require(stake <= perBetCap, \"stake above the agent's per-bet cap\");\n        require(tx.outputs.length == 3, \"gate, ticket and the vault's change\");\n        require(tx.outputs[2].lockingBytecode == tx.inputs[1].lockingBytecode, \"the rest comes back to the vault\");\n        require(tx.outputs[2].tokenCategory == 0x, \"the vault holds no tokens\");\n        require(\n            tx.outputs[2].value == tx.inputs[1].value - stake - TICKET_DUST - AGENT_BET_FEE,\n            \"the vault pays only the stake, the ticket dust and a fixed fee\"\n        );\n    }\n\n    // The owner takes the budget back: input 1 is a coin from the owner's own address, signed over every output.\n    function withdraw() {\n        bytes owner = new LockingBytecodeP2PKH(ownerPkh);\n        bytes unlock = tx.inputs[1].unlockingBytecode;\n        require(tx.inputs[1].lockingBytecode == owner, \"the owner must co-sign\");\n        require(unlock.slice(0, 1) == SIGNATURE_PUSH, \"the owner signs with Schnorr\");\n        bytes sighash = unlock.slice(SIGHASH_BYTE, SIGHASH_BYTE + 1);\n        require(sighash == 0x41 || sighash == 0x61, \"the owner's signature must cover every output\");\n    }\n}\n",
  "debug": {
    "bytecode": "41547a7badc0519dc3529d00c7537a8851d27601207f755c7f777b885c7f75577f7781767ba169c4539d52cd51c78852d1008852cc51c67b9402b0049402dc05949c04109fbf1c89300376a9147c7e0288ac7e51ca51c77b8876517f7501418801418b7f7501417f77760141876351677601618768696d6d5104dfea82f389748c7a82549d8a",
    "sourceMap": "111:4:127:5;;;130::137;;;108:0:138:1;;;;;;",
    "logs": [],
    "requires": [],
    "functionDebug": {
      "109fbf1c": {
        "requires": [
          {
            "ip": 3,
            "line": 112,
            "message": "only the agent's key bets"
          },
          {
            "ip": 6,
            "line": 113,
            "message": "the vault pays as input 1"
          },
          {
            "ip": 9,
            "line": 114,
            "message": "a lane gate and this vault only"
          },
          {
            "ip": 14,
            "line": 115,
            "message": "agents enter standard lane rounds only"
          },
          {
            "ip": 25,
            "line": 117,
            "message": "the ticket pays the vault's owner"
          },
          {
            "ip": 36,
            "line": 119,
            "message": "stake above the agent's per-bet cap"
          },
          {
            "ip": 39,
            "line": 120,
            "message": "gate, ticket and the vault's change"
          },
          {
            "ip": 44,
            "line": 121,
            "message": "the rest comes back to the vault"
          },
          {
            "ip": 48,
            "line": 122,
            "message": "the vault holds no tokens"
          },
          {
            "ip": 60,
            "line": 123,
            "message": "the vault pays only the stake, the ticket dust and a fixed fee"
          }
        ],
        "sourceMap": "112:25:112:39;;:41::49;:8::81:1;113:16:113:37:0;:41::42;:8::73:1;114:16:114:32:0;:36::37;:8::74:1;115:26:115:27:0;:16::44:1;:48::71:0;;:8::115:1;116:34:116:35:0;:23::50:1;117:16:117:22:0;:33::35;:16::36:1;;:29::31:0;:16::36:1;;:46::54:0;:8::94:1;118:46:118:48:0;:30::49:1;;:43::44:0;:30::49:1;;:23::50;119:16:119:21:0;:25::34;:16:::1;:8::75;120:16:120:33:0;:37::38;:8::79:1;121:27:121:28:0;:16::45:1;:59::60:0;:49::77:1;:8::115;122:27:122:28:0;:16::43:1;:47::49:0;:8::80:1;124:23:124:24:0;:12::31:1;:45::46:0;:35::53:1;:56::61:0;:35:::1;47:30:47:34:0;124:35:124:75:1;106:32:106:36:0;124:35:124:91:1;123:8:126:10",
        "logs": []
      },
      "dfea82f3": {
        "requires": [
          {
            "ip": 10,
            "line": 133,
            "message": "the owner must co-sign"
          },
          {
            "ip": 16,
            "line": 134,
            "message": "the owner signs with Schnorr"
          },
          {
            "ip": 34,
            "line": 136,
            "message": "the owner's signature must cover every output"
          }
        ],
        "sourceMap": "131:22:131:56;:47::55;:22::56:1;;;132:33:132:34:0;:23::53:1;133:26:133:27:0;:16::44:1;:48::53:0;:8::81:1;134:16:134:22:0;:32::33;:16::34:1;;53:33:53:37:0;134:8:134:86:1;54:31:54:33:0;135:51:135:67:1;:24::68;;54:31:54:33:0;135:24:135:68:1;;136:16:136:23:0;:27::31;:16:::1;:::50:0;;::::1;:35::42:0;:46::50;:35:::1;:16;:8::101;130:4:137:5;;",
        "logs": []
      }
    }
  },
  "functionBodies": {
    "109fbf1c": "547a7badc0519dc3529d00c7537a8851d27601207f755c7f777b885c7f75577f7781767ba169c4539d52cd51c78852d1008852cc51c67b9402b0049402dc05949c",
    "dfea82f3": "0376a9147c7e0288ac7e51ca51c77b8876517f7501418801418b7f7501417f77760141876351677601618768696d6d51"
  },
  "fingerprint": "8a3812f7cbe9e19e1d3c420caf89538317e58278d7e0721e34df7a00ce3e858e",
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
  "updatedAt": "2026-11-19T09:12:37.302Z",
  "invocationAnalysis": {
    "version": 1,
    "protocolVersions": [
      1
    ],
    "functions": [
      {
        "id": 3,
        "name": "bet",
        "arity": 1,
        "entryPoint": true,
        "selector": "109fbf1c",
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
        "name": "withdraw",
        "arity": 0,
        "entryPoint": true,
        "selector": "dfea82f3",
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
