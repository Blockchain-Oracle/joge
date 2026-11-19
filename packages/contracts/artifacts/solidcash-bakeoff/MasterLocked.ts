export default {
  "contractName": "MasterLocked",
  "constructorInputs": [
    {
      "name": "category",
      "type": "bytes32"
    },
    {
      "name": "sweepLockingBytecode",
      "type": "bytes"
    },
    {
      "name": "protocolLockingBytecode",
      "type": "bytes"
    },
    {
      "name": "oracleBtc",
      "type": "pubkey"
    },
    {
      "name": "oracleEth",
      "type": "pubkey"
    },
    {
      "name": "oracleBch",
      "type": "pubkey"
    },
    {
      "name": "oracleXau",
      "type": "pubkey"
    }
  ],
  "abi": [
    {
      "name": "settle",
      "selector": "1082db8b",
      "inputs": [
        {
          "name": "strike",
          "type": "bytes"
        },
        {
          "name": "strikeSignature",
          "type": "datasig"
        },
        {
          "name": "previous",
          "type": "bytes"
        },
        {
          "name": "previousSignature",
          "type": "datasig"
        },
        {
          "name": "close",
          "type": "bytes"
        },
        {
          "name": "closeSignature",
          "type": "datasig"
        }
      ],
      "sourceEffectOrder": "unsupported-flow"
    },
    {
      "name": "settleGold",
      "selector": "af7a3bea",
      "inputs": [
        {
          "name": "strikeUsd",
          "type": "bytes"
        },
        {
          "name": "strikeUsdSignature",
          "type": "datasig"
        },
        {
          "name": "strikeXau",
          "type": "bytes"
        },
        {
          "name": "strikeXauSignature",
          "type": "datasig"
        },
        {
          "name": "previousUsd",
          "type": "bytes"
        },
        {
          "name": "previousUsdSignature",
          "type": "datasig"
        },
        {
          "name": "closeUsd",
          "type": "bytes"
        },
        {
          "name": "closeUsdSignature",
          "type": "datasig"
        },
        {
          "name": "previousXau",
          "type": "bytes"
        },
        {
          "name": "previousXauSignature",
          "type": "datasig"
        },
        {
          "name": "closeXau",
          "type": "bytes"
        },
        {
          "name": "closeXauSignature",
          "type": "datasig"
        }
      ],
      "sourceEffectOrder": "unsupported-flow"
    },
    {
      "name": "timeoutVoid",
      "selector": "f812fdde",
      "inputs": [],
      "sourceEffectOrder": "linear"
    }
  ],
  "bytecode": "007a048096980095517a965b8a OP_2 OP_DEFINE 007a547f75007f77815b8a OP_3 OP_DEFINE 007a5c7f75587f77815b8a OP_4 OP_DEFINE 007a607f755c7f77815b8a OP_5 OP_DEFINE 00798277609c695179827701409c69517a5179537aba690079548a00a069007a558a00a069 OP_6 OP_DEFINE 5479527a5279568a537a537a5379568a5179548a5179548a51935b8a9c69007a538a52799f690079538a527aa269007a548a OP_7 OP_DEFINE 527a527a5279568a0079548a527a9c69007a558a OP_8 OP_DEFINE c5009c6900cb05ffffffff009c690079587f75577f7781007960974f557955799e6352796096009c6351517a7555795579a06300517a75686700517a750133555379959300650079547951949f63577956795379545479959354937f75537954547995937f7781a26352795193537a757c6b7c6c6800795193517a7500675168667575686800517900a2635479013855547995937f75013355547995937f7781517a7568587a587a567901307f75012a7f7781537a547a57795a8a7777777777 OP_9 OP_DEFINE 00ce01207f775187690079517f75007f775187690079567f75557f77518769c2529c69c3519c6900795e7f755c7f77810079022c01a169517901227f755e7f77527901337f7501307f775579009c0000515779557f75517f777e5351807e01ff7e0056807e0056807e54797e55797e537a9163597902c8009502102796537a757c6b7c6c527902e8039f6300537a757c6b7c6c68597956799502102796527a757c517902e8039f6300527a757c68515779557f75517f777e5251807e587951807e5a7954799453799456807e597956807e54797e55797e517a756800ce01207f7500cd5c7a876900d1517a517e876900d3009c6900d2517a876900cc00c6537994527994029808949c6951527900a06351cd5b79876951cc53799c6951d100876952517a7568517900a0630079cd0376a91456797e0288ac7e87690079cc52799c690079d100876900795193517a7568c4517a9c695177777777777777777777 OP_10 OP_DEFINE 00ce7c517e8800cf76577f75567f778176539e69567a78009c635579776778519c635679776868527901267f7501227f7781768b5b8a52795c7a5c7a588a54795c7f75587f77815b8a537a5e7a5e795e7a5e7a578a7b8ba069547a547a587a558a537a557a598a696d6d51 1082db8b OP_DEFINE 00ce7c517e8800cf76577f75567f7781539d765c7f75587f77817801267f7501227f77815279012a7f7501267f7781768b5b8a5a795f7a5f7a588a52798b5b8a5a795e7a5e7a588a528a53795b8a5a7a5f7a5f795f7a5f7a578a547a5b8a5a7a5f7a5f795f7a5f7a578a7c547a8ba0637653798ba067006869597a558a597a558a528a567a567a7b547a567a598a696d6d51 af7a3bea OP_DEFINE 00ce7c517e8800cf765c7f75587f77810260549376b175c59d00cb05feffffff009d7b7b00004f557a5a8a696d6d51 f812fdde OP_DEFINE 765102ff008d9301218001207f77010088 OP_11 OP_DEFINE OP_DEPTH OP_1SUB OP_ROLL OP_SIZE OP_4 OP_NUMEQUALVERIFY OP_INVOKE",
  "source": "pragma solidcash ^0.51.0;\n\n// SolidCash version of cashscript/MasterLocked.cash (language bake-off; kept in step for BAKEOFF=1 runs).\n\n// Jōge's shared rules: NFT tags, round states, stake classes and fixed lifecycle fees.\n// Generated from cashscript/rules.cash (same values); mirrored in packages/sdk/src/round/constants.ts.\n\n// First byte of every commitment of category K.\nbytes1 constant TAG_MASTER = 0x01;\nbytes1 constant TAG_GATE = 0x02;\nbytes1 constant TAG_TICKET = 0x03;\n\n// Master state byte (offset 5).\nbytes1 constant STATE_OPEN = 0x00;\nbytes1 constant STATE_LOCKED = 0x01;\nbigint constant STATE_SETTLED = 2;\nbigint constant STATE_VOID = 3;\n\n// Assets: index into the oracle table. Gold needs two feeds (USD/BCH and XAU/BCH).\nbigint constant ASSET_BTC = 0;\nbigint constant ASSET_ETH = 1;\nbigint constant ASSET_BCH = 2;\nbigint constant ASSET_GOLD = 3;\n// USD/BCH is in cents, XAU/BCH in ounces × 100000, so usd × 10^7 ÷ xau is dollars per ounce × 10^4.\nbigint constant GOLD_FACTOR = 10000000;\n\n// Modes (high nibble of the mode byte); outcomes are the low nibble.\nbigint constant MODE_UPDOWN = 0;\nbigint constant MODE_RANGES = 1;\nbigint constant NIBBLE = 16;\nbigint constant MAX_OUTCOMES = 6;\n\n// Stake classes (high nibble of the gate's class byte): satoshi bounds per entry and per gate.\nbigint constant CLASS_SHORT = 0;\nbigint constant CLASS_HOURLY = 1;\nbigint constant CLASS_EVENT = 2;\nbigint constant MIN_STAKE = 5000;\nbigint constant SHORT_MAX_STAKE = 500000;\nbigint constant HOURLY_MAX_STAKE = 5000000;\nbigint constant EVENT_MAX_STAKE = 25000000;\nbigint constant SHORT_GATE_CAP = 10000000;\nbigint constant HOURLY_GATE_CAP = 100000000;\nbigint constant EVENT_GATE_CAP = 500000000;\n\n// Fees and dust (satoshis). Lifecycle fees are fixed so every client builds the same bytes; calibrated on chipnet from\n// measured sizes (gold settle ~1,840 B, gold lock with one gate ~1,940 B, ~190 B per swept P2SH32 ticket) with headroom.\n// P2S tickets carry their ~112-byte script in the output: dust is 444 + 3 × ~188 B ≈ 1,008 sats, so 1,200.\nbigint constant TICKET_DUST = 1200;\n// Every gate is created holding exactly this; the lock counts anything beyond it as pot.\nbigint constant GATE_DUST = 1000;\n// An event entrant may leave before the lock; this share of the stake stays in the gate and joins the winners' pot.\nbigint constant EVENT_EXIT_FEE_BPS = 300;\n// P2PKH unlocking bytecode: 0x41 push, 64-byte Schnorr signature, then the sighash byte.\nbytes1 constant SIGNATURE_PUSH = 0x41;\nbigint constant SIGHASH_BYTE = 65;\nbigint constant MIN_FEE_OUTPUT = 1000;\nbigint constant LOCK_FEE_BASE = 1600;\nbigint constant LOCK_FEE_PER_GATE = 700;\nbigint constant SETTLE_FEE = 2200;\nbigint constant SWEEP_FEE_BASE = 1000;\nbigint constant SWEEP_FEE_PER_TICKET = 250;\n// Each swept ticket costs ~20,000 operation-cost units; 32 padding bytes buy 25,600 (measured).\nbigint constant SWEEP_PAD_PER_TICKET = 32;\nbigint constant PROTOCOL_FEE_BPS = 200;\nbigint constant MAX_CREATOR_FEE_BPS = 300;\nbigint constant BPS = 10000;\n\n// Lifecycle transactions take every input at this sequence; the SDK default (0xfffffffe) would allow a second variant.\nbigint constant FINAL_SEQUENCE = 4294967295;\n// Timeout paths need a non-final sequence so the node enforces their locktime.\nbigint constant TIMEOUT_SEQUENCE = 4294967294;\nbigint constant TX_VERSION = 2;\n// After T_close, how long settlement has before anyone may void the round (MTP lags about an hour on mainnet).\nbigint constant SETTLE_TIMEOUT = 21600;\n\nfunction maxStake(bigint stakeClass) returns (int) {\n    require(stakeClass >= CLASS_SHORT && stakeClass <= CLASS_EVENT, \"unknown stake class\");\n    bigint limit = SHORT_MAX_STAKE;\n    if (stakeClass == CLASS_HOURLY) {\n        limit = HOURLY_MAX_STAKE;\n    } else if (stakeClass == CLASS_EVENT) {\n        limit = EVENT_MAX_STAKE;\n    }\n    return limit;\n}\n\nfunction gateCap(bigint stakeClass) returns (int) {\n    bigint cap = SHORT_GATE_CAP;\n    if (stakeClass == CLASS_HOURLY) {\n        cap = HOURLY_GATE_CAP;\n    } else if (stakeClass == CLASS_EVENT) {\n        cap = EVENT_GATE_CAP;\n    }\n    return cap;\n}\n\n// Gold in ten-thousandths of a US dollar per ounce, from the USD/BCH and XAU/BCH prices of the same minute.\nfunction goldPrice(bigint usdPerBch, bigint xauPerBch) returns (int) {\n    return usdPerBch * GOLD_FACTOR / xauPerBch;\n}\n\n\n// General Protocols price messages, as verified by AnyHedge v0.12 (contract.cash l.73-94).\n// A message is 16 bytes of little-endian script numbers:\n//   [0,4) message timestamp · [4,8) message sequence · [8,12) data sequence · [12,16) price.\n// Native mode reads them with little-endian VM numbers; evmCompat would read bytesN big-endian (a trap the tests reproduce).\n\nbigint constant MESSAGE_BYTES = 16;\nbigint constant DATASIG_BYTES = 64;\n\nfunction messageTimestamp(bytes message) pure returns (int) {\n    return int(message.slice(0, 4));\n}\n\nfunction dataSequence(bytes message) pure returns (int) {\n    return int(message.slice(8, 12));\n}\n\nfunction messagePrice(bytes message) pure returns (int) {\n    return int(message.slice(12, 16));\n}\n\nfunction requireSignedPrice(bytes message, datasig signature, pubkey oracle) pure {\n    require(message.length == MESSAGE_BYTES, \"oracle message must be 16 bytes\");\n    require(bytes(signature).length == DATASIG_BYTES, \"oracle signature must be 64 bytes\");\n    require(checkDataSig(signature, message, oracle), \"oracle signature does not verify\");\n    require(dataSequence(message) > 0, \"metadata message is not a price\");\n    require(messagePrice(message) > 0, \"oracle price must be positive\");\n}\n\nfunction firstAtOrAfter(\n    bytes previous,\n    datasig previousSignature,\n    bytes first,\n    datasig firstSignature,\n    pubkey oracle,\n    int boundary\n) pure returns (int) {\n    requireSignedPrice(previous, previousSignature, oracle);\n    requireSignedPrice(first, firstSignature, oracle);\n    require(dataSequence(first) == dataSequence(previous) + 1, \"oracle messages must be consecutive\");\n    require(messageTimestamp(previous) < boundary, \"previous message must be before the boundary\");\n    require(messageTimestamp(first) >= boundary, \"first message must be at or after the boundary\");\n    return dataSequence(first);\n}\n\nfunction priceAtSequence(bytes message, datasig signature, pubkey oracle, int sequence) pure returns (int) {\n    requireSignedPrice(message, signature, oracle);\n    require(dataSequence(message) == sequence, \"strike must be the message after the lock message\");\n    return messagePrice(message);\n}\n\n\n// A locked round waiting for its close. Commitment (written by MasterOpen's lock):\n//   [0] tag 0x01 · [1,5) round id · [5] state 0x01 · [6] asset · [7] mode << 4 | outcomes · [8,12) T_close\n//   [12,14) creator fee bps · [14,34) creator pubkey hash · [34,38) lock data sequence S (USD/BCH for gold)\n//   [38,42) XAU/BCH lock sequence (gold only) · [42,48) pot · [48,51) entrants · [51, 51 + 5·N) totals per outcome\n//   [51 + 5·N, …) range boundaries (4 bytes each, RANGES mode)\n//\n// Settle: anyone, with the strike (the oracle's message S + 1) and the canonical pair at T_close. It pays the fees,\n// freezes the winning outcome, the pot after fees and the winning total, and hands the round to the sweep contract.\ncontract MasterLocked(\n    bytes32 category,\n    bytes sweepLockingBytecode,\n    bytes protocolLockingBytecode,\n    pubkey oracleBtc,\n    pubkey oracleEth,\n    pubkey oracleBch,\n    pubkey oracleXau\n) {\n    function settle(\n        bytes strike,\n        datasig strikeSignature,\n        bytes previous,\n        datasig previousSignature,\n        bytes close,\n        datasig closeSignature\n    ) {\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be a round master of this category\");\n        bytes master = tx.inputs[0].nftCommitment;\n        bigint asset = bigint(master.slice(6, 7));\n        require(asset != ASSET_GOLD, \"gold settles with settleGold\");\n        pubkey oracle = oracleBch;\n        if (asset == ASSET_BTC) {\n            oracle = oracleBtc;\n        } else if (asset == ASSET_ETH) {\n            oracle = oracleEth;\n        }\n        bigint lockSequence = bigint(master.slice(34, 38));\n        bigint strikePrice = priceAtSequence(strike, strikeSignature, oracle, lockSequence + 1);\n        bigint closeSequence = firstAtOrAfter(previous, previousSignature, close, closeSignature, oracle, bigint(master.slice(8, 12)));\n        require(closeSequence > lockSequence + 1, \"the close must come after the strike\");\n        require(\n            payOut(master, strikePrice, messagePrice(close), sweepLockingBytecode, protocolLockingBytecode),\n            \"settlement must be exact\"\n        );\n    }\n\n    function settleGold(\n        bytes strikeUsd,\n        datasig strikeUsdSignature,\n        bytes strikeXau,\n        datasig strikeXauSignature,\n        bytes previousUsd,\n        datasig previousUsdSignature,\n        bytes closeUsd,\n        datasig closeUsdSignature,\n        bytes previousXau,\n        datasig previousXauSignature,\n        bytes closeXau,\n        datasig closeXauSignature\n    ) {\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be a round master of this category\");\n        bytes master = tx.inputs[0].nftCommitment;\n        require(bigint(master.slice(6, 7)) == ASSET_GOLD, \"only gold settles with two feeds\");\n        bigint closeTime = bigint(master.slice(8, 12));\n        bigint usdLock = bigint(master.slice(34, 38));\n        bigint xauLock = bigint(master.slice(38, 42));\n        bigint strikePrice = goldPrice(\n            priceAtSequence(strikeUsd, strikeUsdSignature, oracleBch, usdLock + 1),\n            priceAtSequence(strikeXau, strikeXauSignature, oracleXau, xauLock + 1)\n        );\n        bigint usdClose = firstAtOrAfter(previousUsd, previousUsdSignature, closeUsd, closeUsdSignature, oracleBch, closeTime);\n        bigint xauClose = firstAtOrAfter(previousXau, previousXauSignature, closeXau, closeXauSignature, oracleXau, closeTime);\n        require(usdClose > usdLock + 1 && xauClose > xauLock + 1, \"the close must come after the strike\");\n        bigint closePrice = goldPrice(messagePrice(closeUsd), messagePrice(closeXau));\n        require(\n            payOut(master, strikePrice, closePrice, sweepLockingBytecode, protocolLockingBytecode),\n            \"settlement must be exact\"\n        );\n    }\n\n    // If nobody can settle (an oracle gap breaks every pair), anyone voids the round once T_close + timeout has\n    // passed; everyone is refunded. The locktime is exactly the deadline so this transaction is unique too.\n    function timeoutVoid() {\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be a round master of this category\");\n        bytes master = tx.inputs[0].nftCommitment;\n        bigint deadline = bigint(master.slice(8, 12)) + SETTLE_TIMEOUT;\n        require(tx.time >= deadline, \"too early to void\");\n        require(tx.locktime == deadline, \"locktime is exactly the deadline\");\n        require(tx.inputs[0].sequenceNumber == TIMEOUT_SEQUENCE, \"fixed sequence that enforces the locktime\");\n        require(writeSettlement(master, -1, 0, 0, sweepLockingBytecode, protocolLockingBytecode), \"void must be exact\");\n    }\n}\n\n// Decides the outcome from the strike and close prices, then writes the settlement.\nfunction payOut(bytes master, bigint strikePrice, bigint closePrice, bytes sweepLockingBytecode, bytes protocolLockingBytecode) view returns (bool)\n{\n    require(tx.locktime == 0, \"settle carries no locktime\");\n    require(tx.inputs[0].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n    bigint modeAndOutcomes = bigint(master.slice(7, 8));\n    bigint outcomes = modeAndOutcomes % NIBBLE;\n    bigint winner = -1;\n    // A tie, or a frozen feed (strike equals close), voids the round in either mode.\n    if (closePrice != strikePrice) {\n        if (modeAndOutcomes / NIBBLE == MODE_UPDOWN) {\n            winner = 1;\n            if (closePrice > strikePrice) {\n                winner = 0;\n            }\n        } else {\n            winner = 0;\n            bigint boundaries = 51 + 5 * outcomes;\n            for (bigint j = 0; j < outcomes - 1; j++) {\n                if (closePrice >= bigint(master.slice(boundaries + 4 * j, boundaries + 4 * j + 4))) {\n                    winner = winner + 1;\n                }\n            }\n        }\n    }\n    bigint winnerTotal = 0;\n    if (winner >= 0) {\n        winnerTotal = bigint(master.slice(51 + 5 * winner, 56 + 5 * winner));\n    }\n    return writeSettlement(master, winner, winnerTotal, bigint(master.slice(42, 48)), sweepLockingBytecode, protocolLockingBytecode);\n}\n\n// Writes the sweep record and pays the protocol and creator fees (each only if at least MIN_FEE_OUTPUT; a smaller\n// fee stays in the pot). No winning stake, or winner -1, means void: no fees, every stake refunded.\nfunction writeSettlement(\n    bytes master,\n    bigint winner,\n    bigint winnerTotal,\n    bigint pot,\n    bytes sweepLockingBytecode,\n    bytes protocolLockingBytecode\n) view returns (bool) {\n    require(tx.inputs[0].tokenCategory.split(32)[1] == 0x01, \"input 0 must be a mutable master\");\n    require(master.slice(0, 1) == TAG_MASTER, \"not a master commitment\");\n    require(master.slice(5, 6) == STATE_LOCKED, \"the round is not locked\");\n    require(tx.version == TX_VERSION, \"lifecycle transactions are version 2\");\n    require(tx.inputs.length == 1, \"settlement spends only the master\");\n    bigint feeBps = bigint(master.slice(12, 14));\n    require(feeBps <= MAX_CREATOR_FEE_BPS, \"creator fee above the cap\");\n    bytes creatorPkh = master.slice(14, 34);\n    bytes entrants = master.slice(48, 51);\n\n    bool isVoid = winnerTotal == 0;\n    bigint protocolFee = 0;\n    bigint creatorFee = 0;\n    bytes next = TAG_MASTER + master.slice(1, 5) + toPaddedBytes(STATE_VOID, 1) + 0xff + toPaddedBytes(0, 6)\n        + toPaddedBytes(0, 6) + entrants + creatorPkh;\n    if (!isVoid) {\n        protocolFee = pot * PROTOCOL_FEE_BPS / BPS;\n        if (protocolFee < MIN_FEE_OUTPUT) {\n            protocolFee = 0;\n        }\n        creatorFee = pot * feeBps / BPS;\n        if (creatorFee < MIN_FEE_OUTPUT) {\n            creatorFee = 0;\n        }\n        next = TAG_MASTER + master.slice(1, 5) + toPaddedBytes(STATE_SETTLED, 1) + toPaddedBytes(winner, 1)\n            + toPaddedBytes(pot - protocolFee - creatorFee, 6) + toPaddedBytes(winnerTotal, 6) + entrants + creatorPkh;\n    }\n    bytes category = tx.inputs[0].tokenCategory.split(32)[0];\n    require(tx.outputs[0].lockingBytecode == sweepLockingBytecode, \"the round moves to the sweep contract\");\n    require(tx.outputs[0].tokenCategory == category + 0x01, \"the master keeps its mutable NFT\");\n    require(tx.outputs[0].tokenAmount == 0, \"no fungible tokens\");\n    require(tx.outputs[0].nftCommitment == next, \"the settlement record must be exact\");\n    require(tx.outputs[0].value == tx.inputs[0].value - protocolFee - creatorFee - SETTLE_FEE, \"fixed settle fee\");\n\n    bigint index = 1;\n    if (protocolFee > 0) {\n        require(tx.outputs[1].lockingBytecode == protocolLockingBytecode, \"protocol fee output\");\n        require(tx.outputs[1].value == protocolFee, \"protocol fee amount\");\n        require(tx.outputs[1].tokenCategory == 0x, \"fee carries no tokens\");\n        index = 2;\n    }\n    if (creatorFee > 0) {\n        require(tx.outputs[index].lockingBytecode == new LockingBytecodeP2PKH(unsafe_bytes20(creatorPkh)), \"creator fee output\");\n        require(tx.outputs[index].value == creatorFee, \"creator fee amount\");\n        require(tx.outputs[index].tokenCategory == 0x, \"fee carries no tokens\");\n        index = index + 1;\n    }\n    require(tx.outputs.length == index, \"no other outputs\");\n    return true;\n}\n",
  "debug": {
    "bytecode": "0d007a048096980095517a965b8a52890b007a547f75007f77815b8a53890b007a5c7f75587f77815b8a54890b007a607f755c7f77815b8a55892500798277609c695179827701409c69517a5179537aba690079548a00a069007a558a00a0695689325479527a5279568a537a537a5379568a5179548a5179548a51935b8a9c69007a538a52799f690079538a527aa269007a548a578914527a527a5279568a0079548a527a9c69007a558a58894cc0c5009c6900cb05ffffffff009c690079587f75577f7781007960974f557955799e6352796096009c6351517a7555795579a06300517a75686700517a750133555379959300650079547951949f63577956795379545479959354937f75537954547995937f7781a26352795193537a757c6b7c6c6800795193517a7500675168667575686800517900a2635479013855547995937f75013355547995937f7781517a7568587a587a567901307f75012a7f7781537a547a57795a8a777777777759894d600100ce01207f775187690079517f75007f775187690079567f75557f77518769c2529c69c3519c6900795e7f755c7f77810079022c01a169517901227f755e7f77527901337f7501307f775579009c0000515779557f75517f777e5351807e01ff7e0056807e0056807e54797e55797e537a9163597902c8009502102796537a757c6b7c6c527902e8039f6300537a757c6b7c6c68597956799502102796527a757c517902e8039f6300527a757c68515779557f75517f777e5251807e587951807e5a7954799453799456807e597956807e54797e55797e517a756800ce01207f7500cd5c7a876900d1517a517e876900d3009c6900d2517a876900cc00c6537994527994029808949c6951527900a06351cd5b79876951cc53799c6951d100876952517a7568517900a0630079cd0376a91456797e0288ac7e87690079cc52799c690079d100876900795193517a7568c4517a9c6951777777777777777777775a894c6b00ce7c517e8800cf76577f75567f778176539e69567a78009c635579776778519c635679776868527901267f7501227f7781768b5b8a52795c7a5c7a588a54795c7f75587f77815b8a537a5e7a5e795e7a5e7a578a7b8ba069547a547a587a558a537a557a598a696d6d51041082db8b894c9200ce7c517e8800cf76577f75567f7781539d765c7f75587f77817801267f7501227f77815279012a7f7501267f7781768b5b8a5a795f7a5f7a588a52798b5b8a5a795e7a5e7a588a528a53795b8a5a7a5f7a5f795f7a5f7a578a547a5b8a5a7a5f7a5f795f7a5f7a578a7c547a8ba0637653798ba067006869597a558a597a558a528a567a567a7b547a567a598a696d6d5104af7a3bea892f00ce7c517e8800cf765c7f75587f77810260549376b175c59d00cb05feffffff009d7b7b00004f557a5a8a696d6d5104f812fdde8911765102ff008d9301218001207f770100885b89748c7a82549d8a",
    "sourceMap": "98::100:1;;;111::113;;;115::117;;;119::121;;;123::129;;;131::145;;;147::151;;;247::276;;;280::337;;;171:4:197:5;;;199::231;;;235::243;;;162:0:244:1;;;;;;;;;",
    "logs": [],
    "requires": [],
    "functionDebug": {
      "1082db8b": {
        "requires": [
          {
            "ip": 5,
            "line": 179,
            "message": "input 0 must be a round master of this category"
          },
          {
            "ip": 19,
            "line": 182,
            "message": "gold settles with settleGold"
          },
          {
            "ip": 86,
            "line": 192,
            "message": "the close must come after the strike"
          },
          {
            "ip": 101,
            "line": 193,
            "message": "settlement must be exact"
          }
        ],
        "logs": [],
        "sourceMap": "179:26:179:27;:16::42:1;:46::54:0;:57::61;:46:::1;:8::114;180:33:180:34:0;:23::49:1;181:30:181:36:0;:46::47;:30::48:1;;:43::44:0;:30::48:1;;:23::49;182:16:182:21:0;23:29:23:30;182:16:182:35:1;:8::69;183:24:183:33:0;;184:12:184:17;20:28:20:29;184:12:184:30:1;:32:186:9:0;185:21:185:30;;:12::31:1;186:15:188:9:0;:19:186:24;21:28:21:29;186:19:186:37:1;:39:188:9:0;187:21:187:30;;:12::31:1;186:39:188:9;:15;189:37:189:43:0;;:54::56;:37::57:1;;:50::52:0;:37::57:1;;:30::58;190:78:190:90:0;:::94:1;:29::95;;:70::76:0;;:53::68;;:45::51;;:29::95:1;;191:113:191:119:0;;:129::131;:113::132:1;;:126::127:0;:113::132:1;;:106::133;:31::134;;:98::104:0;;:82::96;;:75::80;;:56::73;;:46::54;;:31::134:1;;192:32:192:44:0;:::48:1;:16;:8::90;194:83:194:106:0;;:61::81;;:53::58;;:40::59:1;;:27::38:0;;:19::25;;:12::107:1;;193:8:196:10;171:4:197:5;;"
      },
      "af7a3bea": {
        "requires": [
          {
            "ip": 5,
            "line": 213,
            "message": "input 0 must be a round master of this category"
          },
          {
            "ip": 17,
            "line": 215,
            "message": "only gold settles with two feeds"
          },
          {
            "ip": 116,
            "line": 225,
            "message": "the close must come after the strike"
          },
          {
            "ip": 138,
            "line": 227,
            "message": "settlement must be exact"
          }
        ],
        "logs": [],
        "sourceMap": "213:26:213:27;:16::42:1;:46::54:0;:57::61;:46:::1;:8::114;214:33:214:34:0;:23::49:1;215::215:29:0;:39::40;:23::41:1;;:36::37:0;:23::41:1;;:16::42;23:29:23:30:0;215:8:215:94:1;216:34:216:40:0;:50::52;:34::53:1;;:47::48:0;:34::53:1;;:27::54;217:32:217:38:0;:49::51;:32::52:1;;:45::47:0;:32::52:1;;:25::53;218:32:218:38:0;;:49::51;:32::52:1;;:45::47:0;:32::52:1;;:25::53;221:70:221:77:0;:::81:1;:12::82;;:59::68:0;;:39::57;;:28::37;;:12::82:1;;220:70:220:77:0;;:::81:1;:12::82;;:59::68:0;;:39::57;;:28::37;;:12::82:1;;219:29:222:9;;223:116:223:125:0;;:26::126:1;;:105::114:0;;:86::103;;:76::84;;:54::74;;:41::52;;:26::126:1;;224:116:224:125:0;;:26::126:1;;:105::114:0;;:86::103;;:76::84;;:54::74;;:41::52;;:26::126:1;;225:16:225:24:0;:27::34;;:::38:1;:16;:::64:0;:42::50;:53::60;;:::64:1;:42;:16;;;:8::106;226:75:226:83:0;;:62::84:1;;:51::59:0;;:38::60:1;;:28::85;;228:74:228:97:0;;:52::72;;:40::50;:27::38;;:19::25;;:12::98:1;;227:8:230:10;199:4:231:5;;"
      },
      "f812fdde": {
        "requires": [
          {
            "ip": 5,
            "line": 236,
            "message": "input 0 must be a round master of this category"
          },
          {
            "ip": 19,
            "line": 239,
            "message": "too early to void"
          },
          {
            "ip": 22,
            "line": 240,
            "message": "locktime is exactly the deadline"
          },
          {
            "ip": 26,
            "line": 241,
            "message": "fixed sequence that enforces the locktime"
          },
          {
            "ip": 36,
            "line": 242,
            "message": "void must be exact"
          }
        ],
        "logs": [],
        "sourceMap": "236:26:236:27;:16::42:1;:46::54:0;:57::61;:46:::1;:8::114;237:33:237:34:0;:23::49:1;238:33:238:39:0;:49::51;:33::52:1;;:46::47:0;:33::52:1;;:26::53;74:33:74:38:0;238:26:238:70:1;239:27:239:35:0;:8::58:1;;240:16:240:27:0;:8::77:1;241:26:241:27:0;:16::43:1;71:35:71:45:0;241:8:241:110:1;242:72:242:95:0;:50::70;:47::48;:44::45;:40::42;:32::38;;:16::96:1;;:8::120;235:4:243:5;;"
      }
    },
    "invokeDebug": {
      "2": {
        "bytecode": "007a048096980095517a965b8a",
        "name": "goldPrice",
        "requires": [],
        "logs": [],
        "sourceMap": "99:11:99:20;;25:30:25:38;99:11:99:34:1;:37::46:0;;:11:::1;:4::47;"
      },
      "3": {
        "bytecode": "007a547f75007f77815b8a",
        "name": "messageTimestamp",
        "requires": [],
        "logs": [],
        "sourceMap": "112:15:112:22;;:32::33;:15::34:1;;:29::30:0;:15::34:1;;:11::35;;"
      },
      "4": {
        "bytecode": "007a5c7f75587f77815b8a",
        "name": "dataSequence",
        "requires": [],
        "logs": [],
        "sourceMap": "116:15:116:22;;:32::34;:15::35:1;;:29::30:0;:15::35:1;;:11::36;;"
      },
      "5": {
        "bytecode": "007a607f755c7f77815b8a",
        "name": "messagePrice",
        "requires": [],
        "logs": [],
        "sourceMap": "120:15:120:22;;:33::35;:15::36:1;;:29::31:0;:15::36:1;;:11::37;;"
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
      "7": {
        "bytecode": "5479527a5279568a537a537a5379568a5179548a5179548a51935b8a9c69007a538a52799f690079538a527aa269007a548a",
        "name": "firstAtOrAfter",
        "requires": [
          {
            "ip": 29,
            "line": 141,
            "message": "oracle messages must be consecutive"
          },
          {
            "ip": 37,
            "line": 142,
            "message": "previous message must be before the boundary"
          },
          {
            "ip": 45,
            "line": 143,
            "message": "first message must be at or after the boundary"
          }
        ],
        "logs": [],
        "sourceMap": "139:52:139:58;;:33::50;;:23::31;;:4::59:1;;140:46:140:52:0;;:30::44;;:23::28;;:4::53:1;;141:25:141:30:0;;:12::31:1;;:48::56:0;;:35::57:1;;:60::61:0;:35:::1;;;:12;:4::102;142:29:142:37:0;;:12::38:1;;:41::49:0;;:12:::1;:4::99;143:29:143:34:0;;:12::35:1;;:39::47:0;;:12:::1;:4::99;144:24:144:29:0;;:11::30:1;"
      },
      "8": {
        "bytecode": "527a527a5279568a0079548a527a9c69007a558a",
        "name": "priceAtSequence",
        "requires": [
          {
            "ip": 15,
            "line": 149,
            "message": "strike must be the message after the lock message"
          }
        ],
        "logs": [],
        "sourceMap": "148:43:148:49;;:32::41;;:23::30;;:4::50:1;;149:25:149:32:0;;:12::33:1;;:37::45:0;;:12:::1;:4::100;150:24:150:31:0;;:11::32:1;"
      },
      "9": {
        "bytecode": "c5009c6900cb05ffffffff009c690079587f75577f7781007960974f557955799e6352796096009c6351517a7555795579a06300517a75686700517a750133555379959300650079547951949f63577956795379545479959354937f75537954547995937f7781a26352795193537a757c6b7c6c6800795193517a7500675168667575686800517900a2635479013855547995937f75013355547995937f7781517a7568587a587a567901307f75012a7f7781537a547a57795a8a7777777777",
        "name": "payOut",
        "requires": [
          {
            "ip": 3,
            "line": 249,
            "message": "settle carries no locktime"
          },
          {
            "ip": 8,
            "line": 250,
            "message": "fixed sequence"
          }
        ],
        "logs": [],
        "sourceMap": "249:12:249:23;:27::28;:12:::1;:4::60;250:22:250:23:0;:12::39:1;69:33:69:43:0;250:12:250:57:1;:4::77;251:36:251:42:0;;:52::53;:36::54:1;;:49::50:0;:36::54:1;;:29::55;252:22:252:37:0;;30:25:30:27;252:22:252:46:1;253:20:253:22:0;255:8:255:18;;:22::33;;:8:::1;:35:270:5:0;256:12:256:27;;30:25:30;256:12:256:36:1;28:30:28:31:0;256:12:256:51:1;:53:261:9:0;257:21:257:22;:12::23:1;;;258:16:258:26:0;;:29::40;;:16:::1;:42:260:13:0;259:25:259:26;:16::27:1;;;258:42:260:13;261:15:269:9:0;262:21:262:22;:12::23:1;;;263:32:263:34:0;:37::38;:41::49;;:37:::1;:32;264:28:264:29:0;:12:268:13;:31:264:32;;:35::43;;:46::47;:35:::1;:31;:12:268:13:0;265:20:265:30;;:41::47;;:74::84;;:87::88;:91::92;;:87:::1;:74;:95::96:0;:74:::1;:41::97;;:54::64:0;;:67::68;:71::72;;:67:::1;:54;:41::97;;:34::98;:20;:100:267:17:0;266:29:266:35;;:38::39;:29:::1;:20::40;;;;;;;265:100:267:17;264:49:264:50:0;;:::52;::::1;;;;:12:268:13;;;;;261:15:269:9;;;255:35:270:5;271:25:271:26:0;272:8:272:14;;:18::19;:8:::1;:21:274:5:0;273:29:273:35;;:59::61;:64::65;:68::74;;:64:::1;:59;:29::75;;:42::44:0;:47::48;:51::57;;:47:::1;:42;:29::75;;:22::76;:8::77;;;272:21:274:5;275:108:275:131:0;;:86::106;;:63::69;;:80::82;:63::83:1;;:76::78:0;:63::83:1;;:56::84;:43::54:0;;:35::41;;:27::33;;:11::132:1;;:4::133;;;;"
      },
      "10": {
        "bytecode": "00ce01207f775187690079517f75007f775187690079567f75557f77518769c2529c69c3519c6900795e7f755c7f77810079022c01a169517901227f755e7f77527901337f7501307f775579009c0000515779557f75517f777e5351807e01ff7e0056807e0056807e54797e55797e537a9163597902c8009502102796537a757c6b7c6c527902e8039f6300537a757c6b7c6c68597956799502102796527a757c517902e8039f6300527a757c68515779557f75517f777e5251807e587951807e5a7954799453799456807e597956807e54797e55797e517a756800ce01207f7500cd5c7a876900d1517a517e876900d3009c6900d2517a876900cc00c6537994527994029808949c6951527900a06351cd5b79876951cc53799c6951d100876952517a7568517900a0630079cd0376a91456797e0288ac7e87690079cc52799c690079d100876900795193517a7568c4517a9c695177777777777777777777",
        "name": "writeSettlement",
        "requires": [
          {
            "ip": 7,
            "line": 288,
            "message": "input 0 must be a mutable master"
          },
          {
            "ip": 18,
            "line": 289,
            "message": "not a master commitment"
          },
          {
            "ip": 29,
            "line": 290,
            "message": "the round is not locked"
          },
          {
            "ip": 33,
            "line": 291,
            "message": "lifecycle transactions are version 2"
          },
          {
            "ip": 37,
            "line": 292,
            "message": "settlement spends only the master"
          },
          {
            "ip": 51,
            "line": 294,
            "message": "creator fee above the cap"
          },
          {
            "ip": 212,
            "line": 316,
            "message": "the round moves to the sweep contract"
          },
          {
            "ip": 220,
            "line": 317,
            "message": "the master keeps its mutable NFT"
          },
          {
            "ip": 225,
            "line": 318,
            "message": "no fungible tokens"
          },
          {
            "ip": 231,
            "line": 319,
            "message": "the settlement record must be exact"
          },
          {
            "ip": 245,
            "line": 320,
            "message": "fixed settle fee"
          },
          {
            "ip": 257,
            "line": 324,
            "message": "protocol fee output"
          },
          {
            "ip": 263,
            "line": 325,
            "message": "protocol fee amount"
          },
          {
            "ip": 268,
            "line": 326,
            "message": "fee carries no tokens"
          },
          {
            "ip": 289,
            "line": 330,
            "message": "creator fee output"
          },
          {
            "ip": 296,
            "line": 331,
            "message": "creator fee amount"
          },
          {
            "ip": 302,
            "line": 332,
            "message": "fee carries no tokens"
          },
          {
            "ip": 315,
            "line": 335,
            "message": "no other outputs"
          }
        ],
        "logs": [],
        "sourceMap": "288:22:288:23;:12::38:1;:45::47:0;:12::48:1;:::51;:55::59:0;:12:::1;:4::97;289:12:289:18:0;;:28::29;:12::30:1;;:25::26:0;:12::30:1;;9:29:9:33:0;289:12:289:44:1;:4::73;290:12:290:18:0;;:28::29;:12::30:1;;:25::26:0;:12::30:1;;15:31:15:35:0;290:12:290:46:1;:4::75;291:12:291:22:0;72:29:72:30;291:12:291:36:1;:4::78;292:12:292:28:0;:32::33;:12:::1;:4::72;293:27:293:33:0;;:44::46;:27::47:1;;:40::42:0;:27::47:1;;:20::48;294:12:294:18:0;;65:38:65:41;294:12:294::1;:4::72;295:23:295:29:0;;:40::42;:23::43:1;;:36::38:0;:23::43:1;;296:21:296:27:0;;:38::40;:21::41:1;;:34::36:0;:21::41:1;;298:18:298:29:0;;:33::34;:18:::1;299:25:299:26:0;300:24:300:25;9:29:9:33;301:30:301:36;;:46::47;:30::48:1;;:43::44:0;:30::48:1;;:17;17:29:17:30:0;301:77:301:78;:51::79:1;:17;:82::86:0;:17:::1;:103::104:0;:106::107;:89::108:1;:17;302:24:302:25:0;:27::28;:10::29:1;301:17;302:32::40:0;;301:17:::1;302:43::53:0;;301:17:::1;303:9:303:15:0;;:8:::1;:17:314:5:0;304:22:304:25;;64:35:64:38;304:22:304:44:1;66::66:27:0;304::304:50:1;:8::51;;;;;;;305:12:305:23:0;;56:33:56:37;305:12:305:40:1;:42:307:9:0;306:26:306:27;:12::28:1;;;;;;;305:42:307:9;308:21:308:24:0;;:27::33;;:21:::1;66:22:66:27:0;308:21:308:39:1;:8::40;;;;309:12:309:22:0;;56:33:56:37;309:12:309:39:1;:41:311:9:0;310:25:310:26;:12::27:1;;;;309:41:311:9;9:29:9:33:0;312:28:312:34;;:44::45;:28::46:1;;:41::42:0;:28::46:1;;:15;16:32:16:33:0;312:78:312:79;:49::80:1;:15;:97::103:0;;:105::106;:83::107:1;:15;313:28:313:31:0;;:34::45;;:28:::1;:48::58:0;;:28:::1;:60::61:0;:14::62:1;312:15;313:79::90:0;;:92::93;:65::94:1;312:15;313:97::105:0;;312:15:::1;313:108::118:0;;312:15:::1;:8::119;;;303:17:314:5;315:31:315:32:0;:21::47:1;:54::56:0;:21::57:1;:::60;316:23:316:24:0;:12::41:1;:45::65:0;;:12:::1;:4::108;317:23:317:24:0;:12::39:1;:43::51:0;;:54::58;:43:::1;:12;:4::96;318:23:318:24:0;:12::37:1;:41::42:0;:12:::1;:4::66;319:23:319:24:0;:12::39:1;:43::47:0;;:12:::1;:4::88;320:23:320:24:0;:12::31:1;:45::46:0;:35::53:1;:56::67:0;;:35:::1;:70::80:0;;:35:::1;59:29:59:33:0;320:35:320:93:1;:12;:4::115;322:19:322:20:0;323:8:323:19;;:22::23;:8:::1;:25:328:5:0;324:27:324:28;:16::45:1;:49::72:0;;:16:::1;:8::97;325:27:325:28:0;:16::35:1;:39::50:0;;:16:::1;:8::75;326:27:326:28:0;:16::43:1;:47::49:0;:16:::1;:8::76;327:16:327:17:0;:8::18:1;;;323:25:328:5;329:8:329:18:0;;:21::22;:8:::1;:24:334:5:0;330:27:330:32;;:16::49:1;:53::105:0;:93::103;;:53::105:1;;;:16;:8::129;331:27:331:32:0;;:16::39:1;:43::53:0;;:16:::1;:8::77;332:27:332:32:0;;:16::47:1;:51::53:0;:16:::1;:8::80;333:16:333:21:0;;:24::25;:16:::1;:8::26;;;329:24:334:5;335:12:335:29:0;:33::38;;:12:::1;:4::60;336:11:336:15:0;:4::16:1;;;;;;;;;"
      },
      "11": {
        "bytecode": "765102ff008d9301218001207f77010088",
        "name": "outlined source span 11",
        "requires": [],
        "logs": [],
        "sourceMap": "99:4:99:47:1;;;;;;;;;;;"
      }
    }
  },
  "functionBodies": {
    "1082db8b": "00ce7c517e8800cf76577f75567f778176539e69567a78009c635579776778519c635679776868527901267f7501227f7781768b5b8a52795c7a5c7a588a54795c7f75587f77815b8a537a5e7a5e795e7a5e7a578a7b8ba069547a547a587a558a537a557a598a696d6d51",
    "af7a3bea": "00ce7c517e8800cf76577f75567f7781539d765c7f75587f77817801267f7501227f77815279012a7f7501267f7781768b5b8a5a795f7a5f7a588a52798b5b8a5a795e7a5e7a588a528a53795b8a5a7a5f7a5f795f7a5f7a578a547a5b8a5a7a5f7a5f795f7a5f7a578a7c547a8ba0637653798ba067006869597a558a597a558a528a567a567a7b547a567a598a696d6d51",
    "f812fdde": "00ce7c517e8800cf765c7f75587f77810260549376b175c59d00cb05feffffff009d7b7b00004f557a5a8a696d6d51"
  },
  "fingerprint": "cae374f8ae580029214ea472fc2b03dd56083db8e51ae0006ea471c45c6546f9",
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
  "updatedAt": "2026-11-19T09:12:37.915Z",
  "invocationAnalysis": {
    "version": 1,
    "protocolVersions": [
      1
    ],
    "functions": [
      {
        "id": 11,
        "name": "settle",
        "arity": 6,
        "entryPoint": true,
        "selector": "1082db8b",
        "calls": [],
        "closure": [
          11
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
        "id": 12,
        "name": "settleGold",
        "arity": 12,
        "entryPoint": true,
        "selector": "af7a3bea",
        "calls": [],
        "closure": [
          12
        ],
        "component": 1,
        "recursive": false,
        "reads": [],
        "writes": [],
        "effects": [],
        "unknown": false,
        "bounded": true,
        "maximumDirectInvocations": 0
      },
      {
        "id": 13,
        "name": "timeoutVoid",
        "arity": 0,
        "entryPoint": true,
        "selector": "f812fdde",
        "calls": [],
        "closure": [
          13
        ],
        "component": 2,
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
          11
        ],
        "recursive": false
      },
      {
        "id": 1,
        "functions": [
          12
        ],
        "recursive": false
      },
      {
        "id": 2,
        "functions": [
          13
        ],
        "recursive": false
      }
    ]
  }
} as const;
