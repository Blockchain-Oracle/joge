export default {
  "contractName": "LaneThread",
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
      "name": "clockOracle",
      "type": "pubkey"
    }
  ],
  "abi": [
    {
      "name": "open",
      "selector": "fa4c1538",
      "inputs": [
        {
          "name": "slot",
          "type": "bigint"
        },
        {
          "name": "openerPkh",
          "type": "bytes20"
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
  "bytecode": "007a547f75005d8a OP_3 OP_DEFINE 007a5c7f75585d8a OP_4 OP_DEFINE 007a607f755c5d8a OP_5 OP_DEFINE 00798277609c695179827701409c69517a5179537aba690079548a00a069007a558a00a069 OP_6 OP_DEFINE 51517a7e01005e8a51805e8a54807e517a54807e517a52807e517a7e517a55807e517a52807e517a7e OP_9 OP_DEFINE 52517a5e8a609552799351807e0053807e0055537a95807e OP_10 OP_DEFINE 51cd527a876951d15179517e876951d3009c6951d2537a876951cc537a9c690065007955799f63525179930079cd547987690079d15379527e87690079d3009c690079d258795879547958795a8a87690079cc02e8039c6951795193527a757c75006751686652557a93650079c49f630079d100876900795193517a75006751686651650079c39f630079ce00876900795193517a750067516866517777777777777777 OP_11 OP_DEFINE 527a527a5279568a007a538a517aa26951 OP_12 OP_DEFINE 7f7781765102ff008d9301218001207f77010088 OP_13 OP_DEFINE 7e517a51807e517a OP_14 OP_DEFINE OP_5 OP_PICK OP_SIZE 14 OP_EQUALVERIFY OP_DROP OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_2 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_1 OP_SPLIT OP_DROP OP_5 OP_EQUALVERIFY OP_DUP OP_3 OP_SPLIT OP_DROP OP_2 OP_SPLIT OP_NIP OP_BIN2NUM OP_OVER OP_5 OP_SPLIT OP_DROP OP_3 OP_SPLIT OP_NIP OP_BIN2NUM OP_2 OP_PICK OP_9 OP_SPLIT OP_DROP OP_5 OP_SPLIT OP_NIP OP_BIN2NUM OP_3 OP_PICK OP_12 OP_SPLIT OP_DROP OP_9 OP_SPLIT OP_NIP OP_BIN2NUM OP_9 OP_PICK OP_2 OP_PICK OP_GREATERTHANOREQUAL OP_IF OP_9 OP_PICK OP_2 OP_PICK OP_SUB OP_3 OP_PICK OP_MOD OP_0 OP_NUMEQUAL OP_ELSE OP_0 OP_ENDIF OP_VERIFY OP_9 OP_PICK OP_2 OP_4 OP_PICK OP_MUL OP_SUB OP_9 OP_ROLL OP_13 OP_ROLL OP_13 OP_ROLL OP_12 OP_INVOKE OP_VERIFY OP_0 OP_3 OP_PICK 100e OP_GREATERTHANOREQUAL OP_IF OP_DROP OP_1 OP_ENDIF OP_5 OP_PICK OP_2 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_2 OP_PICK OP_3 OP_NUM2BIN OP_CAT OP_0 OP_0 OP_0 OP_14 OP_ROLL 32 OP_15 OP_PICK OP_10 OP_PICK OP_ADD OP_16 OP_PICK OP_2 OP_0 OP_16 OP_MUL OP_2 OP_ADD OP_14 OP_ROLL OP_10 OP_PICK OP_9 OP_INVOKE OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_8 OP_PICK OP_2 OP_CAT OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTTOKENCOMMITMENT OP_7 OP_ROLL OP_5 OP_SPLIT OP_DROP OP_11 OP_PICK OP_8 OP_PICK OP_ADD OP_4 OP_NUM2BIN OP_CAT OP_5 OP_ROLL OP_1ADD OP_3 OP_NUM2BIN OP_CAT OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_2 OP_3 OP_ROLL OP_2 OP_4 OP_ROLL 204e OP_5 OP_ROLL OP_10 OP_ROLL OP_10 OP_ROLL OP_10 OP_ROLL OP_11 OP_INVOKE OP_NIP OP_NIP OP_NIP",
  "source": "pragma solidcash ^0.51.0;\n\n\n\n// Jōge's shared rules: NFT tags, round states, stake classes and fixed lifecycle fees.\n// Generated from cashscript/rules.cash (same values); mirrored in packages/sdk/src/round/constants.ts.\n\n// First byte of every commitment of category K.\nbytes1 constant TAG_MASTER = 0x01;\nbytes1 constant TAG_GATE = 0x02;\nbytes1 constant TAG_TICKET = 0x03;\n\n// Master state byte (offset 5).\nbytes1 constant STATE_OPEN = 0x00;\nbytes1 constant STATE_LOCKED = 0x01;\nbigint constant STATE_SETTLED = 2;\nbigint constant STATE_VOID = 3;\n\n// Assets: index into the oracle table. Gold needs two feeds (USD/BCH and XAU/BCH).\nbigint constant ASSET_BTC = 0;\nbigint constant ASSET_ETH = 1;\nbigint constant ASSET_BCH = 2;\nbigint constant ASSET_GOLD = 3;\n// USD/BCH is in cents, XAU/BCH in ounces × 100000, so usd × 10^7 ÷ xau is dollars per ounce × 10^4.\nbigint constant GOLD_FACTOR = 10000000;\n\n// Modes (high nibble of the mode byte); outcomes are the low nibble.\nbigint constant MODE_UPDOWN = 0;\nbigint constant MODE_RANGES = 1;\nbigint constant NIBBLE = 16;\nbigint constant MAX_OUTCOMES = 6;\n\n// Stake classes (high nibble of the gate's class byte): satoshi bounds per entry and per gate.\nbigint constant CLASS_SHORT = 0;\nbigint constant CLASS_HOURLY = 1;\nbigint constant CLASS_EVENT = 2;\nbigint constant MIN_STAKE = 5000;\nbigint constant SHORT_MAX_STAKE = 500000;\nbigint constant HOURLY_MAX_STAKE = 5000000;\nbigint constant EVENT_MAX_STAKE = 25000000;\nbigint constant SHORT_GATE_CAP = 10000000;\nbigint constant HOURLY_GATE_CAP = 100000000;\nbigint constant EVENT_GATE_CAP = 500000000;\n\n// Fees and dust (satoshis). Lifecycle fees are fixed so every client builds the same bytes; calibrated in S00 from\n// measured sizes (gold settle ~1,840 B, gold lock with one gate ~1,940 B, ~190 B per swept P2SH32 ticket) with headroom.\n// P2S tickets carry their ~112-byte script in the output: dust is 444 + 3 × ~188 B ≈ 1,008 sats, so 1,200.\nbigint constant TICKET_DUST = 1200;\n// Every gate is created holding exactly this; the lock counts anything beyond it as pot.\nbigint constant GATE_DUST = 1000;\n// An event entrant may leave before the lock; this share of the stake stays in the gate and joins the winners' pot.\nbigint constant EVENT_EXIT_FEE_BPS = 300;\n// P2PKH unlocking bytecode: 0x41 push, 64-byte Schnorr signature, then the sighash byte.\nbytes1 constant SIGNATURE_PUSH = 0x41;\nbigint constant SIGHASH_BYTE = 65;\nbigint constant MIN_FEE_OUTPUT = 1000;\nbigint constant LOCK_FEE_BASE = 1600;\nbigint constant LOCK_FEE_PER_GATE = 700;\nbigint constant SETTLE_FEE = 2200;\nbigint constant SWEEP_FEE_BASE = 1000;\nbigint constant SWEEP_FEE_PER_TICKET = 250;\n// Each swept ticket costs ~20,000 operation-cost units; 32 padding bytes buy 25,600 (measured in S00).\nbigint constant SWEEP_PAD_PER_TICKET = 32;\nbigint constant PROTOCOL_FEE_BPS = 200;\nbigint constant MAX_CREATOR_FEE_BPS = 300;\nbigint constant BPS = 10000;\n\n// Lifecycle transactions take every input at this sequence; the SDK default (0xfffffffe) would allow a second variant.\nbigint constant FINAL_SEQUENCE = 4294967295;\n// Timeout paths need a non-final sequence so the node enforces their locktime.\nbigint constant TIMEOUT_SEQUENCE = 4294967294;\nbigint constant TX_VERSION = 2;\n// After T_close, how long settlement has before anyone may void the round (MTP lags about an hour on mainnet).\nbigint constant SETTLE_TIMEOUT = 21600;\n\nfunction maxStake(bigint stakeClass) returns (int) {\n    require(stakeClass >= CLASS_SHORT && stakeClass <= CLASS_EVENT, \"unknown stake class\");\n    bigint limit = SHORT_MAX_STAKE;\n    if (stakeClass == CLASS_HOURLY) {\n        limit = HOURLY_MAX_STAKE;\n    } else if (stakeClass == CLASS_EVENT) {\n        limit = EVENT_MAX_STAKE;\n    }\n    return limit;\n}\n\nfunction gateCap(bigint stakeClass) returns (int) {\n    bigint cap = SHORT_GATE_CAP;\n    if (stakeClass == CLASS_HOURLY) {\n        cap = HOURLY_GATE_CAP;\n    } else if (stakeClass == CLASS_EVENT) {\n        cap = EVENT_GATE_CAP;\n    }\n    return cap;\n}\n\n// Gold in ten-thousandths of a US dollar per ounce, from the USD/BCH and XAU/BCH prices of the same minute.\nfunction goldPrice(bigint usdPerBch, bigint xauPerBch) returns (int) {\n    return usdPerBch * GOLD_FACTOR / xauPerBch;\n}\n\n\n// General Protocols price messages, as verified by AnyHedge v0.12 (contract.cash l.73-94).\n// A message is 16 bytes of little-endian script numbers:\n//   [0,4) message timestamp · [4,8) message sequence · [8,12) data sequence · [12,16) price.\n// Native mode reads them with little-endian VM numbers; evmCompat would read bytesN big-endian (the S00 trap).\n\nbigint constant MESSAGE_BYTES = 16;\nbigint constant DATASIG_BYTES = 64;\n\nfunction messageTimestamp(bytes message) pure returns (int) {\n    return int(message.slice(0, 4));\n}\n\nfunction dataSequence(bytes message) pure returns (int) {\n    return int(message.slice(8, 12));\n}\n\nfunction messagePrice(bytes message) pure returns (int) {\n    return int(message.slice(12, 16));\n}\n\nfunction requireSignedPrice(bytes message, datasig signature, pubkey oracle) pure {\n    require(message.length == MESSAGE_BYTES, \"oracle message must be 16 bytes\");\n    require(bytes(signature).length == DATASIG_BYTES, \"oracle signature must be 64 bytes\");\n    require(checkDataSig(signature, message, oracle), \"oracle signature does not verify\");\n    require(dataSequence(message) > 0, \"metadata message is not a price\");\n    require(messagePrice(message) > 0, \"oracle price must be positive\");\n}\n\nfunction firstAtOrAfter(\n    bytes previous,\n    datasig previousSignature,\n    bytes first,\n    datasig firstSignature,\n    pubkey oracle,\n    int boundary\n) pure returns (int) {\n    requireSignedPrice(previous, previousSignature, oracle);\n    requireSignedPrice(first, firstSignature, oracle);\n    require(dataSequence(first) == dataSequence(previous) + 1, \"oracle messages must be consecutive\");\n    require(messageTimestamp(previous) < boundary, \"previous message must be before the boundary\");\n    require(messageTimestamp(first) >= boundary, \"first message must be at or after the boundary\");\n    return dataSequence(first);\n}\n\nfunction priceAtSequence(bytes message, datasig signature, pubkey oracle, int sequence) pure returns (int) {\n    requireSignedPrice(message, signature, oracle);\n    require(dataSequence(message) == sequence, \"strike must be the message after the lock message\");\n    return messagePrice(message);\n}\n\n\n// Shared by the lane threads and the factory (both mint category K): constants and the checks that every newly\n// opened round is exactly what the player contracts expect. Mirrors packages/sdk/src/round/constants.ts.\n\nbytes1 constant TAG_FACTORY = 0x04;\nbytes1 constant TAG_LANE = 0x05;\nbigint constant LANE_GATES = 2;\nbigint constant LANE_BUDGET = 20000;\nbigint constant LANE_OPENER_FEE_BPS = 50;\nbigint constant HOUR = 3600;\nbigint constant MIN_ROUND_SECONDS = 180;\nbigint constant MAX_ROUND_SECONDS = 2592000;\nbigint constant MAX_EVENT_ADVANCE = 2592000;\nbigint constant MIN_BUDGET = 10000;\nbigint constant CREATION_FEE = 2000;\nbigint constant MAX_GATES = 4;\n\n// The open-round record MasterOpen reads (see cashscript/MasterOpen.cash).\nfunction openRecord(\n    bytes roundId,\n    bigint asset,\n    bigint modeAndOutcomes,\n    bigint gates,\n    bigint lockTime,\n    bigint closeTime,\n    bigint feeBps,\n    bytes creatorPkh,\n    bigint minPot,\n    bigint minEntrants,\n    bytes boundaries\n) pure returns (bytes) {\n    return TAG_MASTER + roundId + STATE_OPEN + toPaddedBytes(asset, 1) + toPaddedBytes(modeAndOutcomes, 1)\n        + toPaddedBytes(gates, 1) + toPaddedBytes(lockTime, 4) + toPaddedBytes(closeTime, 4) + toPaddedBytes(feeBps, 2)\n        + creatorPkh + toPaddedBytes(minPot, 5) + toPaddedBytes(minEntrants, 2) + boundaries;\n}\n\n// An empty gate record (see cashscript/Gate.cash): no entrants, zero totals.\nfunction gateRecord(bytes roundId, bigint gateIndex, bigint stakeClass, bigint outcomes) pure returns (bytes) {\n    return TAG_GATE + roundId + toPaddedBytes(gateIndex, 1) + toPaddedBytes(stakeClass * NIBBLE + outcomes, 1)\n        + toPaddedBytes(0, 3) + toPaddedBytes(0, 5 * outcomes);\n}\n\n// Outputs 1 .. 1 + gates of an opening transaction: the master, then every gate, each exact.\nfunction requireRoundOutputs(\n    bytes category,\n    bytes masterLockingBytecode,\n    bytes gateLockingBytecode,\n    bytes record,\n    bigint budget,\n    bytes roundId,\n    bigint gates,\n    bigint stakeClass,\n    bigint outcomes\n) view returns (bool) {\n    require(tx.outputs[1].lockingBytecode == masterLockingBytecode, \"output 1 opens the round's master\");\n    require(tx.outputs[1].tokenCategory == category + 0x01, \"the master is a mutable NFT of the category\");\n    require(tx.outputs[1].tokenAmount == 0, \"no fungible tokens\");\n    require(tx.outputs[1].nftCommitment == record, \"the open record must be exact\");\n    require(tx.outputs[1].value == budget, \"the master holds the round's budget\");\n    for (bigint i = 0; i < gates; i++) {\n        bigint index = 2 + i;\n        require(tx.outputs[index].lockingBytecode == gateLockingBytecode, \"gates sit at the gate contract\");\n        require(tx.outputs[index].tokenCategory == category + 0x02, \"a gate is a minting NFT of the category\");\n        require(tx.outputs[index].tokenAmount == 0, \"no fungible tokens\");\n        require(tx.outputs[index].nftCommitment == gateRecord(roundId, i, stakeClass, outcomes), \"the gate record must be exact\");\n        require(tx.outputs[index].value == GATE_DUST, \"a gate starts with its dust\");\n    }\n    for (bigint i = 2 + gates; i < tx.outputs.length; i++) {\n        require(tx.outputs[i].tokenCategory == 0x, \"change carries no tokens\");\n    }\n    for (bigint i = 1; i < tx.inputs.length; i++) {\n        require(tx.inputs[i].tokenCategory == 0x, \"funding inputs carry no tokens\");\n    }\n    return true;\n}\n\n// A signed oracle price is a lower bound on the current time: `latest` must be at least `earliest`.\nfunction requireClockAtLeast(bytes message, datasig signature, pubkey oracle, bigint earliest) pure returns (bool) {\n    requireSignedPrice(message, signature, oracle);\n    require(messageTimestamp(message) >= earliest, \"too early to open this round\");\n    return true;\n}\n\n\n// One lane (asset × length, e.g. BTC 5 min): a minting NFT of category K that opens the lane's rounds on a fixed time\n// grid. Commitment: [0] tag 0x05 · [1] thread byte · [2] asset · [3,5) lane seconds · [5,9) next lock time · [9,12) counter\n//\n// open: anyone, for any grid slot at or after the next lock time and at most two lanes ahead of a signed oracle clock.\n// It mints the round's master (opener = creator: budget back after the last payout, plus the lane opener fee) and\n// its gates, then moves the lane's next lock time past the slot, so the same slot can never be opened twice.\ncontract LaneThread(\n    bytes category,\n    bytes masterLockingBytecode,\n    bytes gateLockingBytecode,\n    pubkey clockOracle\n) {\n    function open(bigint slot, bytes20 openerPkh, bytes clockMessage, datasig clockSignature) {\n        require(this.activeInputIndex == 0, \"the lane thread must be input 0\");\n        require(tx.inputs[0].tokenCategory == category + 0x02, \"input 0 must be a lane thread of this category\");\n        bytes lane = tx.inputs[0].nftCommitment;\n        require(lane.slice(0, 1) == TAG_LANE, \"not a lane thread\");\n\n        bigint asset = bigint(lane.slice(2, 3));\n        bigint laneSeconds = bigint(lane.slice(3, 5));\n        bigint nextLock = bigint(lane.slice(5, 9));\n        bigint counter = bigint(lane.slice(9, 12));\n        require(slot >= nextLock && (slot - nextLock) % laneSeconds == 0, \"the slot must be on the lane's grid, not yet opened\");\n        require(requireClockAtLeast(clockMessage, clockSignature, clockOracle, slot - 2 * laneSeconds), \"clock\");\n\n        bigint stakeClass = CLASS_SHORT;\n        if (laneSeconds >= HOUR) {\n            stakeClass = CLASS_HOURLY;\n        }\n        bytes roundId = lane.slice(1, 2) + toPaddedBytes(counter, 3);\n        bytes record = openRecord(\n            roundId,\n            asset,\n            MODE_UPDOWN * NIBBLE + 2,\n            LANE_GATES,\n            slot,\n            slot + laneSeconds,\n            LANE_OPENER_FEE_BPS,\n            bytes(openerPkh),\n            0,\n            0,\n            0x\n        );\n\n        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, \"the lane thread comes back to itself\");\n        require(tx.outputs[0].tokenCategory == category + 0x02, \"the lane keeps its minting NFT\");\n        require(tx.outputs[0].tokenAmount == 0, \"no fungible tokens\");\n        require(\n            tx.outputs[0].nftCommitment == lane.slice(0, 5) + toPaddedBytes(slot + laneSeconds, 4) + toPaddedBytes(counter + 1, 3),\n            \"the lane moves past this slot\"\n        );\n        require(tx.outputs[0].value == tx.inputs[0].value, \"the lane keeps its value\");\n        require(\n            requireRoundOutputs(category, masterLockingBytecode, gateLockingBytecode, record, LANE_BUDGET, roundId, LANE_GATES, stakeClass, 2),\n            \"the round must open exactly\"\n        );\n    }\n}\n",
  "debug": {
    "bytecode": "08007a547f75005d8a538908007a5c7f75585d8a548908007a607f755c5d8a55892500798277609c695179827701409c69517a5179537aba690079548a00a069007a558a00a06956892951517a7e01005e8a51805e8a54807e517a54807e517a52807e517a7e517a55807e517a52807e517a7e59891852517a5e8a609552799351807e0053807e0055537a95807e5a894ca451cd527a876951d15179517e876951d3009c6951d2537a876951cc537a9c690065007955799f63525179930079cd547987690079d15379527e87690079d3009c690079d258795879547958795a8a87690079cc02e8039c6951795193527a757c75006751686652557a93650079c49f630079d100876900795193517a75006751686651650079c39f630079ce00876900795193517a7500675168665177777777777777775b8911527a527a5279568a007a538a517aa269515c89147f7781765102ff008d9301218001207f770100885d89087e517a51807e517a5e8955798201148875c0009d00ce78527e8800cf76517f75558876537f75527f778178557f75537f77815279597f75557f778153795c7f75597f778159795279a2635979527994537997009c6700686959795254799594597a5d7a5d7a5c8a6900537902100ea2637551685579527f75517f77527953807e0000005e7a01325f795a799360795200609552935e7a5a79598a00cd00c78800d15879527e8800d3009d00d2577a557f755b7958799354807e557a8b53807e8800cc00c69d52537a52547a02204e557a5a7a5a7a5a7a5b8a777777",
    "sourceMap": "111::113:1;;;115::117;;;119::121;;;123::129;;;171::187;;;190::193;;;196::227;;;230::234;;;243::294;;;;;;249:31:249:48;;;;;;250:16:250:37;:41::42;:8::79:1;251:26:251:27:0;:16::42:1;:46::54:0;:57::61;:46:::1;:8::113;252:31:252:32:0;:21::47:1;253:16:253:20:0;:30::31;:16::32:1;;158:27:158:31:0;253:8:253:67:1;255:30:255:34:0;:44::45;:30::46:1;;:41::42:0;:30::46:1;;:23::47;256:36:256:40:0;:50::51;:36::52:1;;:47::48:0;:36::52:1;;:29::53;257:33:257:37:0;;:47::48;:33::49:1;;:44::45:0;:33::49:1;;:26::50;258:32:258:36:0;;:46::48;:32::49:1;;:43::44:0;:32::49:1;;:25::50;259:16:259:20:0;;:24::32;;:16:::1;:::72:0;:37::41;;:44::52;;:37:::1;:56::67:0;;:36:::1;:71::72:0;:36:::1;:16;;;:8::129;260:79:260:83:0;;:86::87;:90::101;;:86:::1;:79;:66::77:0;;:50::64;;:36::48;;:16::102:1;;:8::113;34:30:34:31:0;263:12:263:23;;162:23:162:27;263:12:263:31:1;:33:265:9:0;35:31:264:38:1;;263:33:265:9;266:24:266:28:0;;:38::39;:24::40:1;;:35::36:0;:24::40:1;;:57::64:0;;:66::67;:43::68:1;:24;278:12:278:14:0;277::277:13;276::276;275:18:275:27;;161:38:161:40;273:12:273:16;;:19::30;;:12:::1;272::272:16:0;;159:29:159:30;28:30:28:31;30:25:30:27;270:12:270:32:1;:35::36:0;:12:::1;269::269:17:0;;268::268:19;;267:23:279:9:1;;281:27:281:28:0;:16::45:1;:59::60:0;:49::77:1;:8::119;282:27:282:28:0;:16::43:1;:47::55:0;;:58::62;:47:::1;:8::98;283:27:283:28:0;:16::41:1;:45::46:0;:8::70:1;285:23:285:24:0;:12::39:1;:43::47:0;;:57::58;:43::59:1;;:76::80:0;;:83::94;;:76:::1;:96::97:0;:62::98:1;:43;:115::122:0;;:::126:1;:128::129:0;:101::130:1;:43;284:8:287:10;288:27:288:28:0;:16::35:1;:49::50:0;:39::57:1;:8::87;290:140:290:141:0;:128::138;;159:29:159:30;290:107:290:114;;160:30:160:35;290:86:290:92;;:65::84;;:42::63;;:32::40;;:12::142:1;289:8:292:10;249:4:293:5;;",
    "logs": [],
    "requires": [
      {
        "ip": 42,
        "line": 250,
        "message": "the lane thread must be input 0"
      },
      {
        "ip": 48,
        "line": 251,
        "message": "input 0 must be a lane thread of this category"
      },
      {
        "ip": 56,
        "line": 253,
        "message": "not a lane thread"
      },
      {
        "ip": 110,
        "line": 259,
        "message": "the slot must be on the lane's grid, not yet opened"
      },
      {
        "ip": 126,
        "line": 260,
        "message": "clock"
      },
      {
        "ip": 178,
        "line": 281,
        "message": "the lane thread comes back to itself"
      },
      {
        "ip": 185,
        "line": 282,
        "message": "the lane keeps its minting NFT"
      },
      {
        "ip": 189,
        "line": 283,
        "message": "no fungible tokens"
      },
      {
        "ip": 211,
        "line": 284,
        "message": "the lane moves past this slot"
      },
      {
        "ip": 216,
        "line": 288,
        "message": "the lane keeps its value"
      },
      {
        "ip": 234,
        "line": 289,
        "message": "the round must open exactly"
      }
    ],
    "invokeDebug": {
      "3": {
        "bytecode": "007a547f75005d8a",
        "name": "messageTimestamp",
        "requires": [],
        "logs": [],
        "sourceMap": "112:15:112:22;;:32::33;:15::34:1;;:29::30:0;:15::34:1;"
      },
      "4": {
        "bytecode": "007a5c7f75585d8a",
        "name": "dataSequence",
        "requires": [],
        "logs": [],
        "sourceMap": "116:15:116:22;;:32::34;:15::35:1;;:29::30:0;:15::35:1;"
      },
      "5": {
        "bytecode": "007a607f755c5d8a",
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
        "bytecode": "51517a7e01005e8a51805e8a54807e517a54807e517a52807e517a7e517a55807e517a52807e517a7e",
        "name": "openRecord",
        "requires": [],
        "logs": [],
        "sourceMap": "9:29:9:33;184:24:184:31;;:11:::1;14:29:14:33:0;184:11:184:44:1;;:104::105:0;:73::106:1;:11;;185:60:185:61:0;:36::62:1;184:11;185:79::88:0;;:90::91;:65::92:1;184:11;185:109::115:0;;:117::118;:95::119:1;184:11;186:10:186:20:0;;184:11:::1;186:37::43:0;;:45::46;:23::47:1;184:11;186:64::75:0;;:77::78;:50::79:1;184:11;186:82::92:0;;184:11:::1"
      },
      "10": {
        "bytecode": "52517a5e8a609552799351807e0053807e0055537a95807e",
        "name": "gateRecord",
        "requires": [],
        "logs": [],
        "sourceMap": "10:27:10:31;191:22:191:29;;:11:::1;;30:25:30:27:0;191:76:191:95:1;:98::106:0;;:76:::1;:108::109:0;:62::110:1;:11;192:24:192:25:0;:27::28;:10::29:1;191:11;192:46::47:0;:49::50;:53::61;;:49:::1;:32::62;191:11"
      },
      "11": {
        "bytecode": "51cd527a876951d15179517e876951d3009c6951d2537a876951cc537a9c690065007955799f63525179930079cd547987690079d15379527e87690079d3009c690079d258795879547958795a8a87690079cc02e8039c6951795193527a757c75006751686652557a93650079c49f630079d100876900795193517a75006751686651650079c39f630079ce00876900795193517a750067516866517777777777777777",
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
            "ip": 115,
            "line": 221,
            "message": "change carries no tokens"
          },
          {
            "ip": 140,
            "line": 224,
            "message": "funding inputs carry no tokens"
          }
        ],
        "logs": [],
        "sourceMap": "207:23:207:24;:12::41:1;:45::66:0;;:12:::1;:4::105;208:23:208:24:0;:12::39:1;:43::51:0;;:54::58;:43:::1;:12;:4::107;209:23:209:24:0;:12::37:1;:41::42:0;:12:::1;:4::66;210:23:210:24:0;:12::39:1;:43::49:0;;:12:::1;:4::84;211:23:211:24:0;:12::31:1;:35::41:0;;:12:::1;:4::82;212:20:212:21:0;:4:219:5;:23:212:24;;:27::32;;:23:::1;:4:219:5:0;213:23:213:24;:27::28;;:23:::1;214:27:214:32:0;;:16::49:1;:53::72:0;;:16:::1;:8::108;215:27:215:32:0;;:16::47:1;:51::59:0;;:62::66;:51:::1;:16;:8::111;216:27:216:32:0;;:16::45:1;:49::50:0;:16:::1;:8::74;217:27:217:32:0;;:16::47:1;:86::94:0;;:74::84;;:71::72;;:62::69;;:51::95:1;;:16;:8::130;218:27:218:32:0;;:16::39:1;50:28:50:32:0;218:16:218:52:1;:8::85;212:34:212:35:0;;:::37;::::1;;;;;:39:219:5;:4;;;;;220:20:220:21:0;:24::29;;:20:::1;:4:222:5:0;:31:220:32;;:35::52;:31:::1;:4:222:5:0;221:27:221:28;;:16::43:1;:47::49:0;:16:::1;:8::79;220:54:220:55:0;;:::57;::::1;;;;:4:222:5;;;;;223:20:223:21:0;:4:225:5;:23:223:24;;:27::43;:23:::1;:4:225:5:0;224:26:224:27;;:16::42:1;:46::48:0;:16:::1;:8::84;223:45:223:46:0;;:::48;::::1;;;;:4:225:5;;;;;226:11:226:15:0;:4::16:1;;;;;;;"
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
        "bytecode": "7f7781765102ff008d9301218001207f77010088",
        "name": "outlined source span 13",
        "requires": [],
        "logs": [],
        "sourceMap": "112:15:112:34:1;;:11::35;;;;;;;;;;;;"
      },
      "14": {
        "bytecode": "7e517a51807e517a",
        "name": "outlined source span 14",
        "requires": [],
        "logs": [],
        "sourceMap": "184:11:184:44:1;:61::66:0;;:68::69;:47::70:1;:11;:87::102:0;"
      }
    }
  },
  "fingerprint": "f963c98a5f98c473498248e0167aeaff72072adb7a8b0905a77aaab671fb0cc8",
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
  "updatedAt": "2026-11-18T19:51:46.198Z",
  "invocationAnalysis": {
    "version": 1,
    "protocolVersions": [
      1
    ],
    "functions": [
      {
        "id": 13,
        "name": "open",
        "arity": 4,
        "entryPoint": true,
        "selector": "fa4c1538",
        "calls": [],
        "closure": [
          13
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
          13
        ],
        "recursive": false
      }
    ]
  }
} as const;
