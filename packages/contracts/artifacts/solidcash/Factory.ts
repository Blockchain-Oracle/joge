export default {
  "contractName": "Factory",
  "constructorInputs": [
    {
      "name": "category",
      "type": "bytes"
    },
    {
      "name": "masterLockingBytecode",
      "type": "bytes"
    },
    {
      "name": "gateLockingBytecode",
      "type": "bytes"
    },
    {
      "name": "eventGateLockingBytecode",
      "type": "bytes"
    },
    {
      "name": "protocolLockingBytecode",
      "type": "bytes"
    },
    {
      "name": "clockOracle",
      "type": "pubkey"
    },
    {
      "name": "dollarMasterLockingBytecode",
      "type": "bytes"
    },
    {
      "name": "dollarGateLockingBytecode",
      "type": "bytes"
    },
    {
      "name": "sideLockingBytecode",
      "type": "bytes"
    },
    {
      "name": "dollarCategory",
      "type": "bytes"
    }
  ],
  "abi": [
    {
      "name": "create",
      "selector": "ca46d84a",
      "inputs": [
        {
          "name": "asset",
          "type": "bigint"
        },
        {
          "name": "mode",
          "type": "bigint"
        },
        {
          "name": "outcomes",
          "type": "bigint"
        },
        {
          "name": "gates",
          "type": "bigint"
        },
        {
          "name": "stakeClass",
          "type": "bigint"
        },
        {
          "name": "lockTime",
          "type": "bigint"
        },
        {
          "name": "closeTime",
          "type": "bigint"
        },
        {
          "name": "feeBps",
          "type": "bigint"
        },
        {
          "name": "creatorPkh",
          "type": "bytes20"
        },
        {
          "name": "minPot",
          "type": "bigint"
        },
        {
          "name": "minEntrants",
          "type": "bigint"
        },
        {
          "name": "boundaries",
          "type": "bytes"
        },
        {
          "name": "budget",
          "type": "bigint"
        },
        {
          "name": "clockMessage",
          "type": "bytes"
        },
        {
          "name": "clockSignature",
          "type": "datasig"
        }
      ],
      "sourceEffectOrder": "unsupported-flow"
    }
  ],
  "bytecode": "007a547f75005e8a OP_3 OP_DEFINE 007a5c7f75585e8a OP_4 OP_DEFINE 007a607f755c5e8a OP_5 OP_DEFINE 00798277609c695179827701409c69517a5179537aba690079548a00a069007a558a00a069 OP_6 OP_DEFINE 51517a7e0100608a5180608a54807e517a54807e517a52807e517a7e517a55807e517a52807e517a7e OP_9 OP_DEFINE 52517a608a609552799351807e0053807e0055537a95807e OP_10 OP_DEFINE 51cd527a876951d15179517e876951d3009c6951d2537a876951cc537a9c690065007955799f63525179930079cd547987690079d15379527e87690079d3009c690079d258795879547958795a8a87690079cc02e8039c695f8a6751686652557a93650079c49f630079d100876900795193517a75006751686651650079c39f630079ce00876900795193517a750067516866517777777777777777 OP_11 OP_DEFINE 527a527a5279568a007a538a517aa26951 OP_12 OP_DEFINE 51cd527a876951d15179517e876951d3009c6951d2557a876951cc557a9c690065007957799f63525179930079cd547987690079d15379527e87690079d3009c690079d259795354795a795a8a87690079cc02e8039c69525879935279930079cd567987690079d1577987690079d3519c690079cc02e8039c6952795193537a757c6b7c6c757500675168665352587a9593650079c49f630079d100790087635167007957798768695179cd56798791695f8a6751686651650079c39f630079ce00790087635167007958798768695179c757798791695f8a6751686651777777777777777777 OP_13 OP_DEFINE 7f7781765102ff008d9301218001207f77010088 OP_14 OP_DEFINE 51795193527a757c7500 OP_15 OP_DEFINE 7e517a51807e517a OP_16 OP_DEFINE 12 OP_PICK OP_SIZE 14 OP_EQUALVERIFY OP_DROP OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_2 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_1 OP_SPLIT OP_DROP OP_4 OP_EQUALVERIFY OP_11 OP_PICK OP_0 OP_3 OP_1ADD OP_WITHIN OP_VERIFY OP_12 OP_PICK OP_0 OP_1 OP_1ADD OP_WITHIN OP_VERIFY OP_13 OP_PICK OP_2 OP_6 OP_1ADD OP_WITHIN OP_VERIFY OP_12 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_1 OP_ELSE OP_13 OP_PICK OP_2 OP_NUMEQUAL OP_ENDIF OP_VERIFY OP_14 OP_PICK OP_1 OP_4 OP_1ADD OP_WITHIN OP_VERIFY OP_15 OP_PICK OP_0 OP_3 OP_1ADD OP_WITHIN OP_VERIFY 12 OP_PICK 2c01 OP_LESSTHANOREQUAL OP_VERIFY 17 OP_PICK 1027 OP_GREATERTHANOREQUAL OP_VERIFY 14 OP_PICK OP_0 OP_GREATERTHANOREQUAL OP_IF 15 OP_PICK OP_0 OP_GREATERTHANOREQUAL OP_ELSE OP_0 OP_ENDIF OP_VERIFY 11 OP_PICK 11 OP_PICK OP_SUB OP_DUP b400 008d27 OP_1ADD OP_WITHIN OP_VERIFY OP_DUP 100e OP_GREATERTHANOREQUAL OP_IF OP_1 OP_ELSE OP_16 OP_PICK OP_0 OP_NUMEQUAL OP_ENDIF OP_VERIFY OP_12 OP_PICK OP_3 OP_NUMNOTEQUAL OP_IF OP_1 OP_ELSE OP_DUP 100e OP_GREATERTHANOREQUAL OP_ENDIF OP_VERIFY 400a4a6b OP_13 OP_PICK OP_2 OP_NUMEQUAL OP_IF 4036a36d OP_NIP OP_ENDIF 13 OP_PICK OP_GREATERTHANOREQUAL OP_VERIFY 11 OP_PICK 008d27 OP_SUB OP_8 OP_ROLL 1b OP_ROLL 1b OP_ROLL OP_12 OP_INVOKE OP_VERIFY OP_0 OP_13 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_14 OP_PICK OP_1SUB OP_NIP OP_ENDIF 17 OP_PICK OP_SIZE OP_NIP OP_4 OP_2 OP_PICK OP_MUL OP_NUMEQUALVERIFY OP_0 OP_0 OP_BEGIN OP_DUP OP_3 OP_PICK OP_LESSTHAN OP_IF 19 OP_PICK OP_4 OP_2 OP_PICK OP_MUL OP_4 OP_ADD OP_SPLIT OP_DROP OP_4 OP_2 OP_PICK OP_MUL OP_SPLIT OP_NIP OP_BIN2NUM OP_DUP OP_3 OP_PICK OP_GREATERTHAN OP_VERIFY OP_DUP OP_3 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_OVER OP_1ADD OP_ROT OP_DROP OP_NIP OP_0 OP_ELSE OP_1 OP_ENDIF OP_UNTIL OP_4 OP_PICK OP_5 OP_SPLIT OP_DROP OP_2 OP_SPLIT OP_NIP OP_BIN2NUM OP_5 OP_PICK OP_2 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_OVER OP_3 OP_NUM2BIN OP_CAT 1b OP_ROLL 1b OP_PICK 1b OP_ROLL 1b OP_ROLL 1b OP_ROLL 1b OP_ROLL 1b OP_ROLL 1a OP_PICK 19 OP_ROLL OP_16 OP_MUL 1a OP_PICK OP_ADD 19 OP_ROLL OP_10 OP_PICK OP_9 OP_INVOKE OP_10 OP_ROLL 13 OP_PICK OP_2 OP_NUMEQUAL OP_IF OP_11 OP_PICK OP_NIP OP_ENDIF OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_10 OP_PICK OP_2 OP_CAT OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTTOKENCOMMITMENT OP_9 OP_ROLL OP_2 OP_SPLIT OP_DROP OP_5 OP_ROLL OP_1ADD OP_3 OP_NUM2BIN OP_CAT OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY 11 OP_PICK OP_3 OP_NUMEQUAL OP_IF OP_2 OP_2 12 OP_PICK OP_MUL OP_ADD OP_DUP OP_OUTPUTBYTECODE OP_12 OP_PICK OP_EQUALVERIFY OP_DUP OP_OUTPUTVALUE d007 OP_NUMEQUALVERIFY OP_16 OP_PICK 12 OP_PICK OP_5 OP_PICK 17 OP_PICK OP_6 OP_PICK 14 OP_PICK 14 OP_PICK 14 OP_PICK 14 OP_PICK 11 OP_PICK OP_13 OP_INVOKE OP_VERIFY OP_DROP OP_ELSE OP_2 11 OP_PICK OP_ADD OP_DUP OP_OUTPUTBYTECODE OP_12 OP_PICK OP_EQUALVERIFY OP_DUP OP_OUTPUTVALUE d007 OP_NUMEQUALVERIFY OP_16 OP_PICK 13 OP_PICK 13 OP_PICK OP_6 OP_PICK 18 OP_PICK OP_7 OP_PICK OP_7 OP_PICK OP_16 OP_PICK OP_16 OP_PICK OP_11 OP_INVOKE OP_VERIFY OP_DROP OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_1",
  "source": "pragma solidcash ^0.51.0;\n\n\n\n// Jōge's shared rules: NFT tags, round states, stake classes and fixed lifecycle fees.\n// Generated from cashscript/rules.cash (same values); mirrored in packages/sdk/src/round/constants.ts.\n\n// First byte of every commitment of category K.\nbytes1 constant TAG_MASTER = 0x01;\nbytes1 constant TAG_GATE = 0x02;\nbytes1 constant TAG_TICKET = 0x03;\n\n// Master state byte (offset 5).\nbytes1 constant STATE_OPEN = 0x00;\nbytes1 constant STATE_LOCKED = 0x01;\nbigint constant STATE_SETTLED = 2;\nbigint constant STATE_VOID = 3;\n\n// Assets: index into the oracle table. Gold needs two feeds (USD/BCH and XAU/BCH).\nbigint constant ASSET_BTC = 0;\nbigint constant ASSET_ETH = 1;\nbigint constant ASSET_BCH = 2;\nbigint constant ASSET_GOLD = 3;\n// USD/BCH is in cents, XAU/BCH in ounces × 100000, so usd × 10^7 ÷ xau is dollars per ounce × 10^4.\nbigint constant GOLD_FACTOR = 10000000;\n\n// Modes (high nibble of the mode byte); outcomes are the low nibble.\nbigint constant MODE_UPDOWN = 0;\nbigint constant MODE_RANGES = 1;\nbigint constant NIBBLE = 16;\nbigint constant MAX_OUTCOMES = 6;\n\n// Stake classes (high nibble of the gate's class byte): satoshi bounds per entry and per gate.\nbigint constant CLASS_SHORT = 0;\nbigint constant CLASS_HOURLY = 1;\nbigint constant CLASS_EVENT = 2;\nbigint constant MIN_STAKE = 5000;\nbigint constant SHORT_MAX_STAKE = 500000;\nbigint constant HOURLY_MAX_STAKE = 5000000;\nbigint constant EVENT_MAX_STAKE = 25000000;\nbigint constant SHORT_GATE_CAP = 10000000;\nbigint constant HOURLY_GATE_CAP = 100000000;\nbigint constant EVENT_GATE_CAP = 500000000;\n\n// Fees and dust (satoshis). Lifecycle fees are fixed so every client builds the same bytes; calibrated in S00 from\n// measured sizes (gold settle ~1,840 B, gold lock with one gate ~1,940 B, ~190 B per swept P2SH32 ticket) with headroom.\n// P2S tickets carry their ~112-byte script in the output: dust is 444 + 3 × ~188 B ≈ 1,008 sats, so 1,200.\nbigint constant TICKET_DUST = 1200;\n// Every gate is created holding exactly this; the lock counts anything beyond it as pot.\nbigint constant GATE_DUST = 1000;\n// An event entrant may leave before the lock; this share of the stake stays in the gate and joins the winners' pot.\nbigint constant EVENT_EXIT_FEE_BPS = 300;\n// P2PKH unlocking bytecode: 0x41 push, 64-byte Schnorr signature, then the sighash byte.\nbytes1 constant SIGNATURE_PUSH = 0x41;\nbigint constant SIGHASH_BYTE = 65;\nbigint constant MIN_FEE_OUTPUT = 1000;\nbigint constant LOCK_FEE_BASE = 1600;\nbigint constant LOCK_FEE_PER_GATE = 700;\nbigint constant SETTLE_FEE = 2200;\nbigint constant SWEEP_FEE_BASE = 1000;\nbigint constant SWEEP_FEE_PER_TICKET = 250;\n// Each swept ticket costs ~20,000 operation-cost units; 32 padding bytes buy 25,600 (measured in S00).\nbigint constant SWEEP_PAD_PER_TICKET = 32;\nbigint constant PROTOCOL_FEE_BPS = 200;\nbigint constant MAX_CREATOR_FEE_BPS = 300;\nbigint constant BPS = 10000;\n\n// Lifecycle transactions take every input at this sequence; the SDK default (0xfffffffe) would allow a second variant.\nbigint constant FINAL_SEQUENCE = 4294967295;\n// Timeout paths need a non-final sequence so the node enforces their locktime.\nbigint constant TIMEOUT_SEQUENCE = 4294967294;\nbigint constant TX_VERSION = 2;\n// After T_close, how long settlement has before anyone may void the round (MTP lags about an hour on mainnet).\nbigint constant SETTLE_TIMEOUT = 21600;\n\nfunction maxStake(bigint stakeClass) returns (int) {\n    require(stakeClass >= CLASS_SHORT && stakeClass <= CLASS_EVENT, \"unknown stake class\");\n    bigint limit = SHORT_MAX_STAKE;\n    if (stakeClass == CLASS_HOURLY) {\n        limit = HOURLY_MAX_STAKE;\n    } else if (stakeClass == CLASS_EVENT) {\n        limit = EVENT_MAX_STAKE;\n    }\n    return limit;\n}\n\nfunction gateCap(bigint stakeClass) returns (int) {\n    bigint cap = SHORT_GATE_CAP;\n    if (stakeClass == CLASS_HOURLY) {\n        cap = HOURLY_GATE_CAP;\n    } else if (stakeClass == CLASS_EVENT) {\n        cap = EVENT_GATE_CAP;\n    }\n    return cap;\n}\n\n// Gold in ten-thousandths of a US dollar per ounce, from the USD/BCH and XAU/BCH prices of the same minute.\nfunction goldPrice(bigint usdPerBch, bigint xauPerBch) returns (int) {\n    return usdPerBch * GOLD_FACTOR / xauPerBch;\n}\n\n\n// General Protocols price messages, as verified by AnyHedge v0.12 (contract.cash l.73-94).\n// A message is 16 bytes of little-endian script numbers:\n//   [0,4) message timestamp · [4,8) message sequence · [8,12) data sequence · [12,16) price.\n// Native mode reads them with little-endian VM numbers; evmCompat would read bytesN big-endian (the S00 trap).\n\nbigint constant MESSAGE_BYTES = 16;\nbigint constant DATASIG_BYTES = 64;\n\nfunction messageTimestamp(bytes message) pure returns (int) {\n    return int(message.slice(0, 4));\n}\n\nfunction dataSequence(bytes message) pure returns (int) {\n    return int(message.slice(8, 12));\n}\n\nfunction messagePrice(bytes message) pure returns (int) {\n    return int(message.slice(12, 16));\n}\n\nfunction requireSignedPrice(bytes message, datasig signature, pubkey oracle) pure {\n    require(message.length == MESSAGE_BYTES, \"oracle message must be 16 bytes\");\n    require(bytes(signature).length == DATASIG_BYTES, \"oracle signature must be 64 bytes\");\n    require(checkDataSig(signature, message, oracle), \"oracle signature does not verify\");\n    require(dataSequence(message) > 0, \"metadata message is not a price\");\n    require(messagePrice(message) > 0, \"oracle price must be positive\");\n}\n\nfunction firstAtOrAfter(\n    bytes previous,\n    datasig previousSignature,\n    bytes first,\n    datasig firstSignature,\n    pubkey oracle,\n    int boundary\n) pure returns (int) {\n    requireSignedPrice(previous, previousSignature, oracle);\n    requireSignedPrice(first, firstSignature, oracle);\n    require(dataSequence(first) == dataSequence(previous) + 1, \"oracle messages must be consecutive\");\n    require(messageTimestamp(previous) < boundary, \"previous message must be before the boundary\");\n    require(messageTimestamp(first) >= boundary, \"first message must be at or after the boundary\");\n    return dataSequence(first);\n}\n\nfunction priceAtSequence(bytes message, datasig signature, pubkey oracle, int sequence) pure returns (int) {\n    requireSignedPrice(message, signature, oracle);\n    require(dataSequence(message) == sequence, \"strike must be the message after the lock message\");\n    return messagePrice(message);\n}\n\n\n// Shared by the lane threads and the factory (both mint category K): constants and the checks that every newly\n// opened round is exactly what the player contracts expect. Mirrors packages/sdk/src/round/constants.ts.\n\nbytes1 constant TAG_FACTORY = 0x04;\nbytes1 constant TAG_LANE = 0x05;\nbigint constant LANE_GATES = 2;\nbigint constant LANE_BUDGET = 20000;\nbigint constant LANE_OPENER_FEE_BPS = 50;\nbigint constant HOUR = 3600;\nbigint constant MIN_ROUND_SECONDS = 180;\nbigint constant MAX_ROUND_SECONDS = 2592000;\nbigint constant MAX_EVENT_ADVANCE = 2592000;\nbigint constant MIN_BUDGET = 10000;\nbigint constant CREATION_FEE = 2000;\nbigint constant MAX_GATES = 4;\n\n// The open-round record MasterOpen reads (see cashscript/MasterOpen.cash).\nfunction openRecord(\n    bytes roundId,\n    bigint asset,\n    bigint modeAndOutcomes,\n    bigint gates,\n    bigint lockTime,\n    bigint closeTime,\n    bigint feeBps,\n    bytes creatorPkh,\n    bigint minPot,\n    bigint minEntrants,\n    bytes boundaries\n) pure returns (bytes) {\n    return TAG_MASTER + roundId + STATE_OPEN + toPaddedBytes(asset, 1) + toPaddedBytes(modeAndOutcomes, 1)\n        + toPaddedBytes(gates, 1) + toPaddedBytes(lockTime, 4) + toPaddedBytes(closeTime, 4) + toPaddedBytes(feeBps, 2)\n        + creatorPkh + toPaddedBytes(minPot, 5) + toPaddedBytes(minEntrants, 2) + boundaries;\n}\n\n// An empty gate record (see cashscript/Gate.cash): no entrants, zero totals.\nfunction gateRecord(bytes roundId, bigint gateIndex, bigint stakeClass, bigint outcomes) pure returns (bytes) {\n    return TAG_GATE + roundId + toPaddedBytes(gateIndex, 1) + toPaddedBytes(stakeClass * NIBBLE + outcomes, 1)\n        + toPaddedBytes(0, 3) + toPaddedBytes(0, 5 * outcomes);\n}\n\n// Outputs 1 .. 1 + gates of an opening transaction: the master, then every gate, each exact.\nfunction requireRoundOutputs(\n    bytes category,\n    bytes masterLockingBytecode,\n    bytes gateLockingBytecode,\n    bytes record,\n    bigint budget,\n    bytes roundId,\n    bigint gates,\n    bigint stakeClass,\n    bigint outcomes\n) view returns (bool) {\n    require(tx.outputs[1].lockingBytecode == masterLockingBytecode, \"output 1 opens the round's master\");\n    require(tx.outputs[1].tokenCategory == category + 0x01, \"the master is a mutable NFT of the category\");\n    require(tx.outputs[1].tokenAmount == 0, \"no fungible tokens\");\n    require(tx.outputs[1].nftCommitment == record, \"the open record must be exact\");\n    require(tx.outputs[1].value == budget, \"the master holds the round's budget\");\n    for (bigint i = 0; i < gates; i++) {\n        bigint index = 2 + i;\n        require(tx.outputs[index].lockingBytecode == gateLockingBytecode, \"gates sit at the gate contract\");\n        require(tx.outputs[index].tokenCategory == category + 0x02, \"a gate is a minting NFT of the category\");\n        require(tx.outputs[index].tokenAmount == 0, \"no fungible tokens\");\n        require(tx.outputs[index].nftCommitment == gateRecord(roundId, i, stakeClass, outcomes), \"the gate record must be exact\");\n        require(tx.outputs[index].value == GATE_DUST, \"a gate starts with its dust\");\n    }\n    for (bigint i = 2 + gates; i < tx.outputs.length; i++) {\n        require(tx.outputs[i].tokenCategory == 0x, \"change carries no tokens\");\n    }\n    for (bigint i = 1; i < tx.inputs.length; i++) {\n        require(tx.inputs[i].tokenCategory == 0x, \"funding inputs carry no tokens\");\n    }\n    return true;\n}\n\n// A signed oracle price is a lower bound on the current time: `latest` must be at least `earliest`.\nfunction requireClockAtLeast(bytes message, datasig signature, pubkey oracle, bigint earliest) pure returns (bool) {\n    requireSignedPrice(message, signature, oracle);\n    require(messageTimestamp(message) >= earliest, \"too early to open this round\");\n    return true;\n}\n\n\n// Custom rounds and events (\"post your own countdown\"): a minting NFT of category K that opens any round whose\n// parameters pass every rule below. Commitment: [0] tag 0x04 · [1] thread byte · [2,5) counter.\n// Several factory threads exist so creators rarely race for one coin.\n\n// The oracle feeds' committed end dates (General Protocols metadata, 2026-11-16): BTC, ETH and gold to 2027-01-15,\n// USD/BCH to 2028-04-15. A round must close before its feed's commitment ends.\nbigint constant FEED_END_SHORT = 1800014400;\nbigint constant FEED_END_BCH = 1839412800;\n\n// Dollar events (mirrors cashscript/dollar.cash): the stake class, and the sidecar every dollar gate is made with.\nbigint constant CLASS_DOLLAR = 3;\nbigint constant SIDE_SEED = 1;\nbigint constant TOKEN_DUST = 1000;\n\ncontract Factory(\n    bytes category,\n    bytes masterLockingBytecode,\n    bytes gateLockingBytecode,\n    bytes eventGateLockingBytecode,\n    bytes protocolLockingBytecode,\n    pubkey clockOracle,\n    bytes dollarMasterLockingBytecode,\n    bytes dollarGateLockingBytecode,\n    bytes sideLockingBytecode,\n    bytes dollarCategory\n) {\n    function create(\n        bigint asset,\n        bigint mode,\n        bigint outcomes,\n        bigint gates,\n        bigint stakeClass,\n        bigint lockTime,\n        bigint closeTime,\n        bigint feeBps,\n        bytes20 creatorPkh,\n        bigint minPot,\n        bigint minEntrants,\n        bytes boundaries,\n        bigint budget,\n        bytes clockMessage,\n        datasig clockSignature\n    ) {\n        require(this.activeInputIndex == 0, \"the factory thread must be input 0\");\n        require(tx.inputs[0].tokenCategory == category + 0x02, \"input 0 must be a factory thread of this category\");\n        bytes thread = tx.inputs[0].nftCommitment;\n        require(thread.slice(0, 1) == TAG_FACTORY, \"not a factory thread\");\n\n        // What the round is.\n        require(within(asset, ASSET_BTC, ASSET_GOLD + 1), \"unknown asset\");\n        require(within(mode, MODE_UPDOWN, MODE_RANGES + 1), \"unknown mode\");\n        require(within(outcomes, 2, MAX_OUTCOMES + 1), \"two to six outcomes\");\n        require(mode == MODE_RANGES || outcomes == 2, \"up/down has two outcomes\");\n        require(within(gates, 1, MAX_GATES + 1), \"one to four gates\");\n        require(within(stakeClass, CLASS_SHORT, CLASS_DOLLAR + 1), \"unknown stake class\");\n        require(feeBps <= MAX_CREATOR_FEE_BPS, \"creator fee above 3 %\");\n        require(budget >= MIN_BUDGET, \"the budget must cover the round's lifecycle fees\");\n        require(minPot >= 0 && minEntrants >= 0, \"minimums are not negative\");\n\n        // When it runs: long enough to mean something, short rounds keep short-lane caps, gold needs an hour.\n        bigint length = closeTime - lockTime;\n        require(within(length, MIN_ROUND_SECONDS, MAX_ROUND_SECONDS + 1), \"a round lasts 3 minutes to 30 days\");\n        require(length >= HOUR || stakeClass == CLASS_SHORT, \"rounds under an hour keep the short-lane caps\");\n        require(asset != ASSET_GOLD || length >= HOUR, \"gold rounds last at least an hour\");\n        bigint feedEnd = FEED_END_SHORT;\n        if (asset == ASSET_BCH) {\n            feedEnd = FEED_END_BCH;\n        }\n        require(closeTime <= feedEnd, \"the price feed is not committed that far\");\n        require(requireClockAtLeast(clockMessage, clockSignature, clockOracle, lockTime - MAX_EVENT_ADVANCE), \"clock\");\n\n        // Price ranges: one boundary fewer than outcomes, strictly increasing.\n        bigint boundaryCount = 0;\n        if (mode == MODE_RANGES) {\n            boundaryCount = outcomes - 1;\n        }\n        require(boundaries.length == 4 * boundaryCount, \"one boundary between each pair of ranges\");\n        bigint previous = 0;\n        for (bigint j = 0; j < boundaryCount; j++) {\n            bigint boundary = bigint(boundaries.slice(4 * j, 4 * j + 4));\n            require(boundary > previous, \"boundaries rise strictly\");\n            previous = boundary;\n        }\n\n        bigint counter = bigint(thread.slice(2, 5));\n        bytes roundId = thread.slice(1, 2) + toPaddedBytes(counter, 3);\n        bytes record = openRecord(\n            roundId,\n            asset,\n            mode * NIBBLE + outcomes,\n            gates,\n            lockTime,\n            closeTime,\n            feeBps,\n            bytes(creatorPkh),\n            minPot,\n            minEntrants,\n            boundaries\n        );\n        bytes gateBytecode = gateLockingBytecode;\n        if (stakeClass == CLASS_EVENT) {\n            gateBytecode = eventGateLockingBytecode;\n        }\n\n        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, \"the factory thread comes back to itself\");\n        require(tx.outputs[0].tokenCategory == category + 0x02, \"the factory keeps its minting NFT\");\n        require(tx.outputs[0].tokenAmount == 0, \"no fungible tokens\");\n        require(tx.outputs[0].nftCommitment == thread.slice(0, 2) + toPaddedBytes(counter + 1, 3), \"the counter moves on\");\n        require(tx.outputs[0].value == tx.inputs[0].value, \"the factory keeps its value\");\n        if (stakeClass == CLASS_DOLLAR) {\n            // A dollar event: its master and gates sit at the dollar contracts, each gate with a seeded sidecar.\n            bigint dollarFeeIndex = 2 + 2 * gates;\n            require(tx.outputs[dollarFeeIndex].lockingBytecode == protocolLockingBytecode, \"the creation fee goes to the protocol\");\n            require(tx.outputs[dollarFeeIndex].value == CREATION_FEE, \"fixed creation fee\");\n            require(\n                requireDollarRoundOutputs(\n                    category,\n                    dollarMasterLockingBytecode,\n                    dollarGateLockingBytecode,\n                    sideLockingBytecode,\n                    dollarCategory,\n                    record,\n                    budget,\n                    roundId,\n                    gates,\n                    outcomes\n                ),\n                \"the dollar event must open exactly\"\n            );\n        } else {\n            bigint feeIndex = 2 + gates;\n            require(tx.outputs[feeIndex].lockingBytecode == protocolLockingBytecode, \"the creation fee goes to the protocol\");\n            require(tx.outputs[feeIndex].value == CREATION_FEE, \"fixed creation fee\");\n            require(\n                requireRoundOutputs(category, masterLockingBytecode, gateBytecode, record, budget, roundId, gates, stakeClass, outcomes),\n                \"the round must open exactly\"\n            );\n        }\n    }\n}\n\n// Outputs of a dollar event's opening: 1 the master, 2 .. 1 + G the dollar gates, 2 + G .. 1 + 2G their sidecars\n// (each seeded with SIDE_SEED of the dollar token from the creator), 2 + 2G the creation fee (checked by the caller),\n// then change: satoshis, or the creator's leftover dollars, but never another sidecar and never K.\nfunction requireDollarRoundOutputs(\n    bytes category,\n    bytes masterLockingBytecode,\n    bytes gateLockingBytecode,\n    bytes sideLockingBytecode,\n    bytes dollarCategory,\n    bytes record,\n    bigint budget,\n    bytes roundId,\n    bigint gates,\n    bigint outcomes\n) view returns (bool) {\n    require(tx.outputs[1].lockingBytecode == masterLockingBytecode, \"output 1 opens the event's master\");\n    require(tx.outputs[1].tokenCategory == category + 0x01, \"the master is a mutable NFT of the category\");\n    require(tx.outputs[1].tokenAmount == 0, \"no fungible tokens\");\n    require(tx.outputs[1].nftCommitment == record, \"the open record must be exact\");\n    require(tx.outputs[1].value == budget, \"the master holds the round's budget\");\n    for (bigint i = 0; i < gates; i++) {\n        bigint index = 2 + i;\n        require(tx.outputs[index].lockingBytecode == gateLockingBytecode, \"gates sit at the dollar gate contract\");\n        require(tx.outputs[index].tokenCategory == category + 0x02, \"a gate is a minting NFT of the category\");\n        require(tx.outputs[index].tokenAmount == 0, \"no fungible tokens\");\n        require(tx.outputs[index].nftCommitment == gateRecord(roundId, i, CLASS_DOLLAR, outcomes), \"the gate record must be exact\");\n        require(tx.outputs[index].value == GATE_DUST, \"a gate starts with its dust\");\n        bigint side = 2 + gates + i;\n        require(tx.outputs[side].lockingBytecode == sideLockingBytecode, \"each gate gets a sidecar\");\n        require(tx.outputs[side].tokenCategory == dollarCategory, \"a sidecar holds only the dollar token\");\n        require(tx.outputs[side].tokenAmount == SIDE_SEED, \"a sidecar starts with its seed\");\n        require(tx.outputs[side].value == TOKEN_DUST, \"a sidecar carries the fixed dust\");\n    }\n    for (bigint i = 3 + 2 * gates; i < tx.outputs.length; i++) {\n        bytes change = tx.outputs[i].tokenCategory;\n        require(change == 0x || change == dollarCategory, \"change carries satoshis or dollars only\");\n        require(tx.outputs[i].lockingBytecode != sideLockingBytecode, \"no extra sidecar\");\n    }\n    for (bigint i = 1; i < tx.inputs.length; i++) {\n        bytes funding = tx.inputs[i].tokenCategory;\n        require(funding == 0x || funding == dollarCategory, \"funding carries satoshis or dollars only\");\n        require(tx.inputs[i].lockingBytecode != sideLockingBytecode, \"no sidecar may fund an opening\");\n    }\n    return true;\n}\n",
  "debug": {
    "bytecode": "08007a547f75005e8a538908007a5c7f75585e8a548908007a607f755c5e8a55892500798277609c695179827701409c69517a5179537aba690079548a00a069007a558a00a06956892951517a7e0100608a5180608a54807e517a54807e517a52807e517a7e517a55807e517a52807e517a7e59891852517a608a609552799351807e0053807e0055537a95807e5a894c9c51cd527a876951d15179517e876951d3009c6951d2537a876951cc537a9c690065007955799f63525179930079cd547987690079d15379527e87690079d3009c690079d258795879547958795a8a87690079cc02e8039c695f8a6751686652557a93650079c49f630079d100876900795193517a75006751686651650079c39f630079ce00876900795193517a7500675168665177777777777777775b8911527a527a5279568a007a538a517aa269515c894ce751cd527a876951d15179517e876951d3009c6951d2557a876951cc557a9c690065007957799f63525179930079cd547987690079d15379527e87690079d3009c690079d259795354795a795a8a87690079cc02e8039c69525879935279930079cd567987690079d1577987690079d3519c690079cc02e8039c6952795193537a757c6b7c6c757500675168665352587a9593650079c49f630079d100790087635167007957798768695179cd56798791695f8a6751686651650079c39f630079ce00790087635167007958798768695179c757798791695f8a67516866517777777777777777775d89147f7781765102ff008d9301218001207f770100885e890a51795193527a757c75005f89087e517a51807e517a60890112798201148875c0009d00ce78527e8800cf76517f7554885b7900538ba5695c7900518ba5695d7952568ba5695c79519c6351675d79529c68695e7951548ba5695f7900538ba569011279022c01a169011779021027a26901147900a26301157900a267006869011179011179947602b40003008d278ba5697602100ea26351676079009c68695c79539e6351677602100ea2686904400a4a6b5d79529c63044036a36d7768011379a26901117903008d2794587a011b7a011b7a5c8a69005d79519c635e798c77680117798277545279959d0000657653799f630119795452799554937f75545279957f7781765379a06976537a757c6b7c6c788b7b757700675168665479557f75527f77815579527f75517f777853807e011b7a011b79011b7a011b7a011b7a011b7a011b7a011a7901197a6095011a799301197a5a79598a5a7a011379529c635b79776800cd00c78800d15a79527e8800d3009d00d2597a527f75557a8b53807e8800cc00c69d011179539c635252011279959376cd5c798876cc02d0079d6079011279557901177956790114790114790114790114790111795d8a697567520111799376cd5c798876cc02d0079d6079011379011379567901187957795779607960795b8a6975686d6d6d6d6d6d6d6d6d6d51",
    "sourceMap": "111::113:1;;;115::117;;;119::121;;;123::129;;;171::187;;;190::193;;;196::227;;;230::234;;;381::422;;;251::376;;;;;;;;;272:8:272:26;;;;;;280:16:280:37;:41::42;:8::82:1;281:26:281:27:0;:16::42:1;:46::54:0;:57::61;:46:::1;:8::116;282:33:282:34:0;:23::49:1;283:16:283:22:0;:32::33;:16::34:1;;157:30:157::0;283:8:283:75:1;286:23:286:28:0;;20:28:20:29;23:29:23:30;286:41:286:55:1;:16::56;:8::75;287:23:287:27:0;;28:30:28:31;29::29;287:42:287:57:1;:16::58;:8::76;288:23:288:31:0;;:33::34;31:31:31:32;288:36:288:52:1;:16::53;:8::78;289:16:289:20:0;;29:30:29:31;289:16:289:35:1;:::52:0;;::::1;:39::47:0;;:51::52;:39:::1;:16;:8::82;290:23:290:28:0;;:30::31;168:28:168:29;290:33:290:46:1;:16::47;:8::70;291:23:291:33:0;;34:30:34:31;247:31:247:32;291:48:291:64:1;:16::65;:8::90;292:16:292:22:0;;65:38:65:41;292:16:292:45:1;:8::72;293:16:293:22:0;;166:29:166:34;293:16:293:36:1;:8::90;294:16:294:22:0;;:26::27;:16:::1;:::47:0;:31::42;;:46::47;:31:::1;:16;;;:8::78;297:24:297:33:0;;:36::44;;:24:::1;298:23:298:29:0;163:36:163:39;164::164:43;298:50:298:71:1;:16::72;:8::112;299:16:299:22:0;162:23:162:27;299:16:299:30:1;:::59:0;;::::1;:34::44:0;;34:30:34:31;299:34:299:59:1;:16;:8::110;300:16:300:21:0;;23:29:23:30;300:16:300:35:1;:::53:0;;::::1;:39::45:0;162:23:162:27;300:39:300:53:1;:16;:8::92;243:33:243:43:0;302:12:302:17;;22:28:22:29;302:12:302:30:1;:32:304:9:0;244:31:244:41;303:12:303:35:1;302:32:304:9;305:16:305:25:0;;:::36:1;:8::82;306:79:306:87:0;;165:36:165:43;306:79:306:107:1;:66::77:0;;:50::64;;:36::48;;:16::108:1;;:8::119;309:31:309:32:0;310:12:310:16;;29:30:29:31;310:12:310::1;:33:312:9:0;311:28:311:36;;:::40:1;:12::41;310:33:312:9;313:16:313:26:0;;:::33:1;;:37::38:0;:41::54;;:37:::1;:8::100;314:26:314:27:0;315:24:315:25;:8:319:9;:27:315:28;:31::44;;:27:::1;:8:319:9:0;316:37:316:47;;:61::62;:65::66;;:61:::1;:69::70:0;:61:::1;:37::71;;:54::55:0;:58::59;;:54:::1;:37::71;;:30::72;317:20:317:28:0;:31::39;;:20:::1;:12::69;318:23:318:31:0;:12::32:1;;;;;;;315:46:315:47:0;:::49:1;;;::319:9;:8;;;;;321:32:321:38:0;;:48::49;:32::50:1;;:45::46:0;:32::50:1;;:25::51;322:24:322:30:0;;:40::41;:24::42:1;;:37::38:0;:24::42:1;;:59::66:0;:68::69;:45::70:1;:24;334:12:334:22:0;;333::333:23;;332::332:18;;331:18:331:28;;330:12:330:18;;329::329:21;;328::328:20;;327::327:17;;326::326:16;;30:25:30:27;326:12:326:25:1;:28::36:0;;:12:::1;325::325:17:0;;324::324:19;;323:23:335:9:1;;336:29:336:48:0;;337:12:337:22;;36:30:36:31;337:12:337:37:1;:39:339:9:0;338:27:338:51;;:12::52:1;337:39:339:9;341:27:341:28:0;:16::45:1;:59::60:0;:49::77:1;:8::122;342:27:342:28:0;:16::43:1;:47::55:0;;:58::62;:47:::1;:8::101;343:27:343:28:0;:16::41:1;:45::46:0;:8::70:1;344:27:344:28:0;:16::43:1;:47::53:0;;:63::64;:47::65:1;;:82::89:0;;:::93:1;:95::96:0;:68::97:1;:47;:8::123;345:27:345:28:0;:16::35:1;:49::50:0;:39::57:1;:8::90;346:12:346:22:0;;247:31:247:32;346:12:346:38:1;:40:366:9:0;348:36:348:37;:40::41;:44::49;;:40:::1;:36;349:31:349:45:0;:20::62:1;:66::89:0;;:12::132:1;350:31:350:45:0;:20::52:1;167:31:167:35:0;350:12:350:92:1;362:20:362:28:0;;361::361:25;;360::360:27;;359::359:26;;358::358;;357::357:34;;356::356:39;;355::355:45;;354::354:47;;353::353:28;;352:16:363:17:1;;351:12:365:14;346:40:366:9;366:15:374::0;367:30:367:31;:34::39;;:30:::1;368:31:368::0;:20::56:1;:60::83:0;;:12::126:1;369:31:369:39:0;:20::46:1;167:31:167:35:0;369:12:369:86:1;371:127:371:135:0;;:115::125;;:108::113;;:99::106;;:91::97;;:83::89;;:69::81;;:46::67;;:36::44;;:16::136:1;;370:12:373:14;366:15:374:9;;263:4:375:5;;;;;;;;;;",
    "logs": [],
    "requires": [
      {
        "ip": 54,
        "line": 280,
        "message": "the factory thread must be input 0"
      },
      {
        "ip": 60,
        "line": 281,
        "message": "input 0 must be a factory thread of this category"
      },
      {
        "ip": 68,
        "line": 283,
        "message": "not a factory thread"
      },
      {
        "ip": 75,
        "line": 286,
        "message": "unknown asset"
      },
      {
        "ip": 82,
        "line": 287,
        "message": "unknown mode"
      },
      {
        "ip": 89,
        "line": 288,
        "message": "two to six outcomes"
      },
      {
        "ip": 102,
        "line": 289,
        "message": "up/down has two outcomes"
      },
      {
        "ip": 109,
        "line": 290,
        "message": "one to four gates"
      },
      {
        "ip": 116,
        "line": 291,
        "message": "unknown stake class"
      },
      {
        "ip": 121,
        "line": 292,
        "message": "creator fee above 3 %"
      },
      {
        "ip": 126,
        "line": 293,
        "message": "the budget must cover the round's lifecycle fees"
      },
      {
        "ip": 139,
        "line": 294,
        "message": "minimums are not negative"
      },
      {
        "ip": 150,
        "line": 298,
        "message": "a round lasts 3 minutes to 30 days"
      },
      {
        "ip": 162,
        "line": 299,
        "message": "rounds under an hour keep the short-lane caps"
      },
      {
        "ip": 174,
        "line": 300,
        "message": "gold rounds last at least an hour"
      },
      {
        "ip": 187,
        "line": 305,
        "message": "the price feed is not committed that far"
      },
      {
        "ip": 200,
        "line": 306,
        "message": "clock"
      },
      {
        "ip": 220,
        "line": 313,
        "message": "one boundary between each pair of ranges"
      },
      {
        "ip": 250,
        "line": 317,
        "message": "boundaries rise strictly"
      },
      {
        "ip": 334,
        "line": 341,
        "message": "the factory thread comes back to itself"
      },
      {
        "ip": 341,
        "line": 342,
        "message": "the factory keeps its minting NFT"
      },
      {
        "ip": 345,
        "line": 343,
        "message": "no fungible tokens"
      },
      {
        "ip": 359,
        "line": 344,
        "message": "the counter moves on"
      },
      {
        "ip": 364,
        "line": 345,
        "message": "the factory keeps its value"
      },
      {
        "ip": 380,
        "line": 349,
        "message": "the creation fee goes to the protocol"
      },
      {
        "ip": 384,
        "line": 350,
        "message": "fixed creation fee"
      },
      {
        "ip": 407,
        "line": 351,
        "message": "the dollar event must open exactly"
      },
      {
        "ip": 418,
        "line": 368,
        "message": "the creation fee goes to the protocol"
      },
      {
        "ip": 422,
        "line": 369,
        "message": "fixed creation fee"
      },
      {
        "ip": 443,
        "line": 370,
        "message": "the round must open exactly"
      }
    ],
    "invokeDebug": {
      "3": {
        "bytecode": "007a547f75005e8a",
        "name": "messageTimestamp",
        "requires": [],
        "logs": [],
        "sourceMap": "112:15:112:22;;:32::33;:15::34:1;;:29::30:0;:15::34:1;"
      },
      "4": {
        "bytecode": "007a5c7f75585e8a",
        "name": "dataSequence",
        "requires": [],
        "logs": [],
        "sourceMap": "116:15:116:22;;:32::34;:15::35:1;;:29::30:0;:15::35:1;"
      },
      "5": {
        "bytecode": "007a607f755c5e8a",
        "name": "messagePrice",
        "requires": [],
        "logs": [],
        "sourceMap": "120:15:120:22;;:33::35;:15::36:1;;:29::31:0;:15::36:1;"
      },
      "6": {
        "bytecode": "00798277609c695179827701409c69517a5179537aba690079548a00a069007a558a00a069",
        "name": "requireSignedPrice",
        "requires": [
          {
            "ip": 6,
            "line": 124,
            "message": "oracle message must be 16 bytes"
          },
          {
            "ip": 13,
            "line": 125,
            "message": "oracle signature must be 64 bytes"
          },
          {
            "ip": 21,
            "line": 126,
            "message": "oracle signature does not verify"
          },
          {
            "ip": 28,
            "line": 127,
            "message": "metadata message is not a price"
          },
          {
            "ip": 35,
            "line": 128,
            "message": "oracle price must be positive"
          }
        ],
        "logs": [],
        "sourceMap": "124:12:124:19;;:::26:1;;108:32:108:34:0;124:12:124:43:1;:4::80;125:18:125:27:0;;:12::35:1;;109:32:109:34:0;125:12:125:52:1;:4::91;126:25:126:34:0;;:36::43;;:45::51;;:12::52:1;:4::90;127:25:127:32:0;;:12::33:1;;:36::37:0;:12:::1;:4::74;128:25:128:32:0;;:12::33:1;;:36::37:0;:12:::1;:4::72"
      },
      "9": {
        "bytecode": "51517a7e0100608a5180608a54807e517a54807e517a52807e517a7e517a55807e517a52807e517a7e",
        "name": "openRecord",
        "requires": [],
        "logs": [],
        "sourceMap": "9:29:9:33;184:24:184:31;;:11:::1;14:29:14:33:0;184:11:184:44:1;;:104::105:0;:73::106:1;:11;;185:60:185:61:0;:36::62:1;184:11;185:79::88:0;;:90::91;:65::92:1;184:11;185:109::115:0;;:117::118;:95::119:1;184:11;186:10:186:20:0;;184:11:::1;186:37::43:0;;:45::46;:23::47:1;184:11;186:64::75:0;;:77::78;:50::79:1;184:11;186:82::92:0;;184:11:::1"
      },
      "10": {
        "bytecode": "52517a608a609552799351807e0053807e0055537a95807e",
        "name": "gateRecord",
        "requires": [],
        "logs": [],
        "sourceMap": "10:27:10:31;191:22:191:29;;:11:::1;;30:25:30:27:0;191:76:191:95:1;:98::106:0;;:76:::1;:108::109:0;:62::110:1;:11;192:24:192:25:0;:27::28;:10::29:1;191:11;192:46::47:0;:49::50;:53::61;;:49:::1;:32::62;191:11"
      },
      "11": {
        "bytecode": "51cd527a876951d15179517e876951d3009c6951d2537a876951cc537a9c690065007955799f63525179930079cd547987690079d15379527e87690079d3009c690079d258795879547958795a8a87690079cc02e8039c695f8a6751686652557a93650079c49f630079d100876900795193517a75006751686651650079c39f630079ce00876900795193517a750067516866517777777777777777",
        "name": "requireRoundOutputs",
        "requires": [
          {
            "ip": 5,
            "line": 207,
            "message": "output 1 opens the round's master"
          },
          {
            "ip": 13,
            "line": 208,
            "message": "the master is a mutable NFT of the category"
          },
          {
            "ip": 18,
            "line": 209,
            "message": "no fungible tokens"
          },
          {
            "ip": 24,
            "line": 210,
            "message": "the open record must be exact"
          },
          {
            "ip": 30,
            "line": 211,
            "message": "the master holds the round's budget"
          },
          {
            "ip": 49,
            "line": 214,
            "message": "gates sit at the gate contract"
          },
          {
            "ip": 58,
            "line": 215,
            "message": "a gate is a minting NFT of the category"
          },
          {
            "ip": 64,
            "line": 216,
            "message": "no fungible tokens"
          },
          {
            "ip": 79,
            "line": 217,
            "message": "the gate record must be exact"
          },
          {
            "ip": 85,
            "line": 218,
            "message": "a gate starts with its dust"
          },
          {
            "ip": 107,
            "line": 221,
            "message": "change carries no tokens"
          },
          {
            "ip": 132,
            "line": 224,
            "message": "funding inputs carry no tokens"
          }
        ],
        "logs": [],
        "sourceMap": "207:23:207:24;:12::41:1;:45::66:0;;:12:::1;:4::105;208:23:208:24:0;:12::39:1;:43::51:0;;:54::58;:43:::1;:12;:4::107;209:23:209:24:0;:12::37:1;:41::42:0;:12:::1;:4::66;210:23:210:24:0;:12::39:1;:43::49:0;;:12:::1;:4::84;211:23:211:24:0;:12::31:1;:35::41:0;;:12:::1;:4::82;212:20:212:21:0;:4:219:5;:23:212:24;;:27::32;;:23:::1;:4:219:5:0;213:23:213:24;:27::28;;:23:::1;214:27:214:32:0;;:16::49:1;:53::72:0;;:16:::1;:8::108;215:27:215:32:0;;:16::47:1;:51::59:0;;:62::66;:51:::1;:16;:8::111;216:27:216:32:0;;:16::45:1;:49::50:0;:16:::1;:8::74;217:27:217:32:0;;:16::47:1;:86::94:0;;:74::84;;:71::72;;:62::69;;:51::95:1;;:16;:8::130;218:27:218:32:0;;:16::39:1;50:28:50:32:0;218:16:218:52:1;:8::85;212:34:212:35:0;;:4:219:5:1;;;;220:20:220:21:0;:24::29;;:20:::1;:4:222:5:0;:31:220:32;;:35::52;:31:::1;:4:222:5:0;221:27:221:28;;:16::43:1;:47::49:0;:16:::1;:8::79;220:54:220:55:0;;:::57;::::1;;;;:4:222:5;;;;;223:20:223:21:0;:4:225:5;:23:223:24;;:27::43;:23:::1;:4:225:5:0;224:26:224:27;;:16::42:1;:46::48:0;:16:::1;:8::84;223:45:223:46:0;;:::48;::::1;;;;:4:225:5;;;;;226:11:226:15:0;:4::16:1;;;;;;;"
      },
      "12": {
        "bytecode": "527a527a5279568a007a538a517aa26951",
        "name": "requireClockAtLeast",
        "requires": [
          {
            "ip": 15,
            "line": 232,
            "message": "too early to open this round"
          }
        ],
        "logs": [],
        "sourceMap": "231:43:231:49;;:32::41;;:23::30;;:4::50:1;;232:29:232:36:0;;:12::37:1;;:41::49:0;;:12:::1;:4::83;233:11:233:15:0"
      },
      "13": {
        "bytecode": "51cd527a876951d15179517e876951d3009c6951d2557a876951cc557a9c690065007957799f63525179930079cd547987690079d15379527e87690079d3009c690079d259795354795a795a8a87690079cc02e8039c69525879935279930079cd567987690079d1577987690079d3519c690079cc02e8039c6952795193537a757c6b7c6c757500675168665352587a9593650079c49f630079d100790087635167007957798768695179cd56798791695f8a6751686651650079c39f630079ce00790087635167007958798768695179c757798791695f8a6751686651777777777777777777",
        "name": "requireDollarRoundOutputs",
        "requires": [
          {
            "ip": 5,
            "line": 393,
            "message": "output 1 opens the event's master"
          },
          {
            "ip": 13,
            "line": 394,
            "message": "the master is a mutable NFT of the category"
          },
          {
            "ip": 18,
            "line": 395,
            "message": "no fungible tokens"
          },
          {
            "ip": 24,
            "line": 396,
            "message": "the open record must be exact"
          },
          {
            "ip": 30,
            "line": 397,
            "message": "the master holds the round's budget"
          },
          {
            "ip": 49,
            "line": 400,
            "message": "gates sit at the dollar gate contract"
          },
          {
            "ip": 58,
            "line": 401,
            "message": "a gate is a minting NFT of the category"
          },
          {
            "ip": 64,
            "line": 402,
            "message": "no fungible tokens"
          },
          {
            "ip": 78,
            "line": 403,
            "message": "the gate record must be exact"
          },
          {
            "ip": 84,
            "line": 404,
            "message": "a gate starts with its dust"
          },
          {
            "ip": 98,
            "line": 406,
            "message": "each gate gets a sidecar"
          },
          {
            "ip": 105,
            "line": 407,
            "message": "a sidecar holds only the dollar token"
          },
          {
            "ip": 111,
            "line": 408,
            "message": "a sidecar starts with its seed"
          },
          {
            "ip": 117,
            "line": 409,
            "message": "a sidecar carries the fixed dust"
          },
          {
            "ip": 164,
            "line": 413,
            "message": "change carries satoshis or dollars only"
          },
          {
            "ip": 172,
            "line": 414,
            "message": "no extra sidecar"
          },
          {
            "ip": 202,
            "line": 418,
            "message": "funding carries satoshis or dollars only"
          },
          {
            "ip": 210,
            "line": 419,
            "message": "no sidecar may fund an opening"
          }
        ],
        "logs": [],
        "sourceMap": "393:23:393:24;:12::41:1;:45::66:0;;:12:::1;:4::105;394:23:394:24:0;:12::39:1;:43::51:0;;:54::58;:43:::1;:12;:4::107;395:23:395:24:0;:12::37:1;:41::42:0;:12:::1;:4::66;396:23:396:24:0;:12::39:1;:43::49:0;;:12:::1;:4::84;397:23:397:24:0;:12::31:1;:35::41:0;;:12:::1;:4::82;398:20:398:21:0;:4:410:5;:23:398:24;;:27::32;;:23:::1;:4:410:5:0;399:23:399:24;:27::28;;:23:::1;400:27:400:32:0;;:16::49:1;:53::72:0;;:16:::1;:8::115;401:27:401:32:0;;:16::47:1;:51::59:0;;:62::66;:51:::1;:16;:8::111;402:27:402:32:0;;:16::45:1;:49::50:0;:16:::1;:8::74;403:27:403:32:0;;:16::47:1;:88::96:0;;247:31:247:32;403:71:403:72;;:62::69;;:51::97:1;;:16;:8::132;404:27:404:32:0;;:16::39:1;50:28:50:32:0;404:16:404:52:1;:8::85;405:22:405:23:0;:26::31;;:22:::1;:34::35:0;;:22:::1;406:27:406:31:0;;:16::48:1;:52::71:0;;:16:::1;:8::101;407:27:407:31:0;;:16::46:1;:50::64:0;;:16:::1;:8::107;408:27:408:31:0;;:16::44:1;248:28:248:29:0;408:16:408:57:1;:8::93;409:27:409:31:0;;:16::38:1;249:29:249:33:0;409:16:409:52:1;:8::90;398:34:398:35:0;;:::37;::::1;;;;;;;;:39:410:5;;:4;;;;;411:20:411:21:0;:24::25;:28::33;;:24:::1;:20;:4:415:5:0;:35:411:36;;:39::56;:35:::1;:4:415:5:0;412:34:412:35;;:23::50:1;413:16:413:22:0;;:26::28;:16:::1;:::56:0;;::::1;:32::38:0;;:42::56;;:32:::1;:16;:8::101;414:27:414:28:0;;:16::45:1;:49::68:0;;:16:::1;;:8::90;411:58:411:59:0;;:4:415:5:1;;;;416:20:416:21:0;:4:420:5;:23:416:24;;:27::43;:23:::1;:4:420:5:0;417:34:417:35;;:24::50:1;418:16:418:23:0;;:27::29;:16:::1;:::58:0;;::::1;:33::40:0;;:44::58;;:33:::1;:16;:8::104;419:26:419:27:0;;:16::44:1;:48::67:0;;:16:::1;;:8::103;416:45:416:46:0;;:4:420:5:1;;;;421:11:421:15:0;:4::16:1;;;;;;;;"
      },
      "14": {
        "bytecode": "7f7781765102ff008d9301218001207f77010088",
        "name": "outlined source span 14",
        "requires": [],
        "logs": [],
        "sourceMap": "112:15:112:34:1;;:11::35;;;;;;;;;;;;"
      },
      "15": {
        "bytecode": "51795193527a757c7500",
        "name": "outlined source span 15",
        "requires": [],
        "logs": [],
        "sourceMap": "212:34:212:35;;:::37;::::1;;;;;:39:219:5;:4"
      },
      "16": {
        "bytecode": "7e517a51807e517a",
        "name": "outlined source span 16",
        "requires": [],
        "logs": [],
        "sourceMap": "184:11:184:44:1;:61::66:0;;:68::69;:47::70:1;:11;:87::102:0;"
      }
    }
  },
  "fingerprint": "ab13f102a3e40980a64fea51ada8eee385ae5e1d33bc62098315f0af081f4a87",
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
  "updatedAt": "2026-11-18T11:07:38.429Z",
  "invocationAnalysis": {
    "version": 1,
    "protocolVersions": [
      1
    ],
    "functions": [
      {
        "id": 14,
        "name": "create",
        "arity": 15,
        "entryPoint": true,
        "selector": "ca46d84a",
        "calls": [],
        "closure": [
          14
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
          14
        ],
        "recursive": false
      }
    ]
  }
} as const;
