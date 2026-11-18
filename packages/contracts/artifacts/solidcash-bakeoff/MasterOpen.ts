export default {
  "contractName": "MasterOpen",
  "constructorInputs": [
    {
      "name": "category",
      "type": "bytes32"
    },
    {
      "name": "lockedLockingBytecode",
      "type": "bytes"
    },
    {
      "name": "sweepLockingBytecode",
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
      "name": "lock",
      "selector": "99391c89",
      "inputs": [
        {
          "name": "previous",
          "type": "bytes"
        },
        {
          "name": "previousSignature",
          "type": "datasig"
        },
        {
          "name": "first",
          "type": "bytes"
        },
        {
          "name": "firstSignature",
          "type": "datasig"
        }
      ],
      "sourceEffectOrder": "unsupported-flow"
    },
    {
      "name": "lockGold",
      "selector": "3f980fe4",
      "inputs": [
        {
          "name": "previousUsd",
          "type": "bytes"
        },
        {
          "name": "previousUsdSignature",
          "type": "datasig"
        },
        {
          "name": "firstUsd",
          "type": "bytes"
        },
        {
          "name": "firstUsdSignature",
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
          "name": "firstXau",
          "type": "bytes"
        },
        {
          "name": "firstXauSignature",
          "type": "datasig"
        }
      ],
      "sourceEffectOrder": "linear"
    }
  ],
  "bytecode": "007a547f75007f77815a8a OP_3 OP_DEFINE 007a5c7f75587f77815a8a OP_4 OP_DEFINE 007a607f755c7f77815a8a OP_5 OP_DEFINE 00798277609c695179827701409c69517a5179537aba690079548a00a069007a558a00a069 OP_6 OP_DEFINE 5479527a5279568a537a537a5379568a5179548a5179548a51935a8a9c69007a538a52799f690079538a527aa269007a548a OP_7 OP_DEFINE 00ce01207f775187690079517f75007f775187690079567f75557f77010087690079557f75517f7700ce01207f755279587f75577f7781007a60975379597f75587f7781c2529c69c5009c69c3515279939c69c4519c6900cb05ffffffff009c6900c60051650079c39f630079cf5179ce5779527e87690079517f75007f775287690079557f75517f77587987690079567f75557f7781527951949c690079577f75567f7781609756799c695179cb05ffffffff009c69527951795a7f75577f778193537a757c6b7c6c53795279c693547a75537a537a537a51795193527a757c7500675168660000000065007959799f635a51795595930051650079c39f6351795179cf547955937f7554797f778193527a757c00795193517a7500675168665679527955807e577a75567a567a567a567a567a567a5579527993567a75557a557a557a557a557a517900a06354795193557a75547a547a547a547a6853795193547a75537a537a537a7575750067516866517a529f63516751795b79012c7f7501277f77819f6863516754795b79012e7f75012c7f77819f68515b797e5351807e01ff7e0056807e0056807e567953807e5c7901277f7501137f777e5f7a527a9163515c797e517e5d79587f75567f777e5d7901277f755d7f777e5e797e547956807e577953807e55797e5d795e7982777f75012e7f777e527a757c5e79517a756800cd517a876900d15a7a517e876900d3009c6900d2517a876900cc567a0240069402bc02587a95949c695177777777777777777777 OP_9 OP_DEFINE 00cf76577f75567f778176539e69577a78009c635679776778519c63577977686852795d7f75597f77815a8a7c5d7a5d7a5d7a5d7a578a717b54800054807e547a598a696d6d7551 99391c89 OP_DEFINE 00cf76577f75567f7781539d765d7f75597f7781765a8a587a5d7a5d7a5d7a5d7a578a7c5a8a587a5c7a5c7a5c7a5c7a578a71537a5480537a54807e537a598a777777 3f980fe4 OP_DEFINE 765102ff008d9301218001207f77010088 OP_10 OP_DEFINE OP_DEPTH OP_1SUB OP_ROLL OP_SIZE OP_4 OP_NUMEQUALVERIFY OP_INVOKE",
  "source": "pragma solidcash ^0.51.0;\n\n// SolidCash port of cashscript/MasterOpen.cash (S00 bake-off; kept in step for BAKEOFF=1 runs).\n\n// Jōge's shared rules: NFT tags, round states, stake classes and fixed lifecycle fees.\n// Generated from cashscript/rules.cash (same values); mirrored in packages/sdk/src/round/constants.ts.\n\n// First byte of every commitment of category K.\nbytes1 constant TAG_MASTER = 0x01;\nbytes1 constant TAG_GATE = 0x02;\nbytes1 constant TAG_TICKET = 0x03;\n\n// Master state byte (offset 5).\nbytes1 constant STATE_OPEN = 0x00;\nbytes1 constant STATE_LOCKED = 0x01;\nbigint constant STATE_SETTLED = 2;\nbigint constant STATE_VOID = 3;\n\n// Assets: index into the oracle table. Gold needs two feeds (USD/BCH and XAU/BCH).\nbigint constant ASSET_BTC = 0;\nbigint constant ASSET_ETH = 1;\nbigint constant ASSET_BCH = 2;\nbigint constant ASSET_GOLD = 3;\n// USD/BCH is in cents, XAU/BCH in ounces × 100000, so usd × 10^7 ÷ xau is dollars per ounce × 10^4.\nbigint constant GOLD_FACTOR = 10000000;\n\n// Modes (high nibble of the mode byte); outcomes are the low nibble.\nbigint constant MODE_UPDOWN = 0;\nbigint constant MODE_RANGES = 1;\nbigint constant NIBBLE = 16;\nbigint constant MAX_OUTCOMES = 6;\n\n// Stake classes (high nibble of the gate's class byte): satoshi bounds per entry and per gate.\nbigint constant CLASS_SHORT = 0;\nbigint constant CLASS_HOURLY = 1;\nbigint constant CLASS_EVENT = 2;\nbigint constant MIN_STAKE = 5000;\nbigint constant SHORT_MAX_STAKE = 500000;\nbigint constant HOURLY_MAX_STAKE = 5000000;\nbigint constant EVENT_MAX_STAKE = 25000000;\nbigint constant SHORT_GATE_CAP = 10000000;\nbigint constant HOURLY_GATE_CAP = 100000000;\nbigint constant EVENT_GATE_CAP = 500000000;\n\n// Fees and dust (satoshis). Lifecycle fees are fixed so every client builds the same bytes; calibrated in S00 from\n// measured sizes (gold settle ~1,840 B, gold lock with one gate ~1,940 B, ~190 B per swept P2SH32 ticket) with headroom.\n// P2S tickets carry their ~112-byte script in the output: dust is 444 + 3 × ~188 B ≈ 1,008 sats, so 1,200.\nbigint constant TICKET_DUST = 1200;\n// Every gate is created holding exactly this; the lock counts anything beyond it as pot.\nbigint constant GATE_DUST = 1000;\n// An event entrant may leave before the lock; this share of the stake stays in the gate and joins the winners' pot.\nbigint constant EVENT_EXIT_FEE_BPS = 300;\n// P2PKH unlocking bytecode: 0x41 push, 64-byte Schnorr signature, then the sighash byte.\nbytes1 constant SIGNATURE_PUSH = 0x41;\nbigint constant SIGHASH_BYTE = 65;\nbigint constant MIN_FEE_OUTPUT = 1000;\nbigint constant LOCK_FEE_BASE = 1600;\nbigint constant LOCK_FEE_PER_GATE = 700;\nbigint constant SETTLE_FEE = 2200;\nbigint constant SWEEP_FEE_BASE = 1000;\nbigint constant SWEEP_FEE_PER_TICKET = 250;\n// Each swept ticket costs ~20,000 operation-cost units; 32 padding bytes buy 25,600 (measured in S00).\nbigint constant SWEEP_PAD_PER_TICKET = 32;\nbigint constant PROTOCOL_FEE_BPS = 200;\nbigint constant MAX_CREATOR_FEE_BPS = 300;\nbigint constant BPS = 10000;\n\n// Lifecycle transactions take every input at this sequence; the SDK default (0xfffffffe) would allow a second variant.\nbigint constant FINAL_SEQUENCE = 4294967295;\n// Timeout paths need a non-final sequence so the node enforces their locktime.\nbigint constant TIMEOUT_SEQUENCE = 4294967294;\nbigint constant TX_VERSION = 2;\n// After T_close, how long settlement has before anyone may void the round (MTP lags about an hour on mainnet).\nbigint constant SETTLE_TIMEOUT = 21600;\n\nfunction maxStake(bigint stakeClass) returns (int) {\n    require(stakeClass >= CLASS_SHORT && stakeClass <= CLASS_EVENT, \"unknown stake class\");\n    bigint limit = SHORT_MAX_STAKE;\n    if (stakeClass == CLASS_HOURLY) {\n        limit = HOURLY_MAX_STAKE;\n    } else if (stakeClass == CLASS_EVENT) {\n        limit = EVENT_MAX_STAKE;\n    }\n    return limit;\n}\n\nfunction gateCap(bigint stakeClass) returns (int) {\n    bigint cap = SHORT_GATE_CAP;\n    if (stakeClass == CLASS_HOURLY) {\n        cap = HOURLY_GATE_CAP;\n    } else if (stakeClass == CLASS_EVENT) {\n        cap = EVENT_GATE_CAP;\n    }\n    return cap;\n}\n\n// Gold in ten-thousandths of a US dollar per ounce, from the USD/BCH and XAU/BCH prices of the same minute.\nfunction goldPrice(bigint usdPerBch, bigint xauPerBch) returns (int) {\n    return usdPerBch * GOLD_FACTOR / xauPerBch;\n}\n\n\n// General Protocols price messages, as verified by AnyHedge v0.12 (contract.cash l.73-94).\n// A message is 16 bytes of little-endian script numbers:\n//   [0,4) message timestamp · [4,8) message sequence · [8,12) data sequence · [12,16) price.\n// Native mode reads them with little-endian VM numbers; evmCompat would read bytesN big-endian (the S00 trap).\n\nbigint constant MESSAGE_BYTES = 16;\nbigint constant DATASIG_BYTES = 64;\n\nfunction messageTimestamp(bytes message) pure returns (int) {\n    return int(message.slice(0, 4));\n}\n\nfunction dataSequence(bytes message) pure returns (int) {\n    return int(message.slice(8, 12));\n}\n\nfunction messagePrice(bytes message) pure returns (int) {\n    return int(message.slice(12, 16));\n}\n\nfunction requireSignedPrice(bytes message, datasig signature, pubkey oracle) pure {\n    require(message.length == MESSAGE_BYTES, \"oracle message must be 16 bytes\");\n    require(bytes(signature).length == DATASIG_BYTES, \"oracle signature must be 64 bytes\");\n    require(checkDataSig(signature, message, oracle), \"oracle signature does not verify\");\n    require(dataSequence(message) > 0, \"metadata message is not a price\");\n    require(messagePrice(message) > 0, \"oracle price must be positive\");\n}\n\nfunction firstAtOrAfter(\n    bytes previous,\n    datasig previousSignature,\n    bytes first,\n    datasig firstSignature,\n    pubkey oracle,\n    int boundary\n) pure returns (int) {\n    requireSignedPrice(previous, previousSignature, oracle);\n    requireSignedPrice(first, firstSignature, oracle);\n    require(dataSequence(first) == dataSequence(previous) + 1, \"oracle messages must be consecutive\");\n    require(messageTimestamp(previous) < boundary, \"previous message must be before the boundary\");\n    require(messageTimestamp(first) >= boundary, \"first message must be at or after the boundary\");\n    return dataSequence(first);\n}\n\nfunction priceAtSequence(bytes message, datasig signature, pubkey oracle, int sequence) pure returns (int) {\n    requireSignedPrice(message, signature, oracle);\n    require(dataSequence(message) == sequence, \"strike must be the message after the lock message\");\n    return messagePrice(message);\n}\n\n\n// A round before its lock (mutable NFT of category K). Commitment:\n//   [0] tag 0x01 · [1,5) round id · [5] state 0x00 · [6] asset · [7] mode << 4 | outcomes · [8] gate count G\n//   [9,13) T_lock · [13,17) T_close · [17,19) creator fee bps · [19,39) creator pubkey hash\n//   [39,44) minimum pot · [44,46) minimum entrants · [46, 46 + 4·(N-1)) range boundaries (RANGES mode)\n//\n// Lock: anyone, once the oracle has signed its first price at or after T_lock. It merges every gate, so no entry can\n// follow, and records the lock message's data sequence S; the strike is the oracle's next message, S + 1, which nobody\n// racing the lock can know yet. A round with no entries, one side only, or below its minimums is void right here.\ncontract MasterOpen(\n    bytes32 category,\n    bytes lockedLockingBytecode,\n    bytes sweepLockingBytecode,\n    pubkey oracleBtc,\n    pubkey oracleEth,\n    pubkey oracleBch,\n    pubkey oracleXau\n) {\n    function lock(bytes previous, datasig previousSignature, bytes first, datasig firstSignature) {\n        bytes master = tx.inputs[0].nftCommitment;\n        bigint asset = bigint(master.slice(6, 7));\n        require(asset != ASSET_GOLD, \"gold locks with lockGold\");\n        pubkey oracle = oracleBch;\n        if (asset == ASSET_BTC) {\n            oracle = oracleBtc;\n        } else if (asset == ASSET_ETH) {\n            oracle = oracleEth;\n        }\n        bigint sequence = firstAtOrAfter(previous, previousSignature, first, firstSignature, oracle, bigint(master.slice(9, 13)));\n        require(closeGates(master, toPaddedBytes(sequence, 4) + toPaddedBytes(0, 4), lockedLockingBytecode, sweepLockingBytecode), \"gates must close\");\n    }\n\n    function lockGold(\n        bytes previousUsd,\n        datasig previousUsdSignature,\n        bytes firstUsd,\n        datasig firstUsdSignature,\n        bytes previousXau,\n        datasig previousXauSignature,\n        bytes firstXau,\n        datasig firstXauSignature\n    ) {\n        bytes master = tx.inputs[0].nftCommitment;\n        require(bigint(master.slice(6, 7)) == ASSET_GOLD, \"only gold locks with two feeds\");\n        bigint lockTime = bigint(master.slice(9, 13));\n        bigint usdSequence = firstAtOrAfter(previousUsd, previousUsdSignature, firstUsd, firstUsdSignature, oracleBch, lockTime);\n        bigint xauSequence = firstAtOrAfter(previousXau, previousXauSignature, firstXau, firstXauSignature, oracleXau, lockTime);\n        require(\n            closeGates(master, toPaddedBytes(usdSequence, 4) + toPaddedBytes(xauSequence, 4), lockedLockingBytecode, sweepLockingBytecode),\n            \"gates must close\"\n        );\n    }\n}\n\n// Merges input 0 (this master) with inputs 1..G (its gates, in gate order) into one output: the locked round, or the\n// void round ready for refunds. `sequences` is the 8-byte lock record (two feeds for gold, else the second is zero).\nfunction closeGates(bytes master, bytes sequences, bytes lockedLockingBytecode, bytes sweepLockingBytecode) view returns (bool) {\n    require(tx.inputs[0].tokenCategory.split(32)[1] == 0x01, \"input 0 must be a mutable master\");\n    require(master.slice(0, 1) == TAG_MASTER, \"not a master commitment\");\n    require(master.slice(5, 6) == STATE_OPEN, \"the round is not open\");\n    bytes roundId = master.slice(1, 5);\n    bytes category = tx.inputs[0].tokenCategory.split(32)[0];\n    bigint modeAndOutcomes = bigint(master.slice(7, 8));\n    bigint outcomes = modeAndOutcomes % NIBBLE;\n    bigint gates = bigint(master.slice(8, 9));\n\n    require(tx.version == TX_VERSION, \"lifecycle transactions are version 2\");\n    require(tx.locktime == 0, \"lock carries no locktime\");\n    require(tx.inputs.length == 1 + gates, \"every gate, and nothing else, must be merged\");\n    require(tx.outputs.length == 1, \"the lock has one output\");\n    require(tx.inputs[0].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n\n    bigint value = tx.inputs[0].value;\n    bigint entrants = 0;\n    for (bigint i = 1; i < tx.inputs.length; i++) {\n        bytes gate = tx.inputs[i].nftCommitment;\n        require(tx.inputs[i].tokenCategory == category + 0x02, \"input must be a gate of this category\");\n        require(gate.slice(0, 1) == TAG_GATE, \"not a gate commitment\");\n        require(gate.slice(1, 5) == roundId, \"gate belongs to another round\");\n        require(bigint(gate.slice(5, 6)) == i - 1, \"gates must be in gate order\");\n        require(bigint(gate.slice(6, 7)) % NIBBLE == outcomes, \"gate and master disagree on outcomes\");\n        require(tx.inputs[i].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n        entrants = entrants + bigint(gate.slice(7, 10));\n        value = value + tx.inputs[i].value;\n    }\n\n    bytes totals = 0x;\n    bigint pot = 0;\n    bigint sidesWithStake = 0;\n    for (bigint outcome = 0; outcome < outcomes; outcome++) {\n        bigint start = 10 + outcome * 5;\n        bigint sum = 0;\n        for (bigint i = 1; i < tx.inputs.length; i++) {\n            sum = sum + bigint(tx.inputs[i].nftCommitment.slice(start, start + 5));\n        }\n        totals = totals + toPaddedBytes(sum, 5);\n        pot = pot + sum;\n        if (sum > 0) {\n            sidesWithStake = sidesWithStake + 1;\n        }\n    }\n\n    bool isVoid = sidesWithStake < 2 || pot < bigint(master.slice(39, 44)) || entrants < bigint(master.slice(44, 46));\n    bytes next = TAG_MASTER + roundId + toPaddedBytes(STATE_VOID, 1) + 0xff + toPaddedBytes(0, 6) + toPaddedBytes(0, 6)\n        + toPaddedBytes(entrants, 3) + master.slice(19, 39);\n    bytes destination = sweepLockingBytecode;\n    if (!isVoid) {\n        next = TAG_MASTER + roundId + STATE_LOCKED + master.slice(6, 8) + master.slice(13, 39) + sequences\n            + toPaddedBytes(pot, 6) + toPaddedBytes(entrants, 3) + totals + master.slice(46, master.length);\n        destination = lockedLockingBytecode;\n    }\n    require(tx.outputs[0].lockingBytecode == destination, \"the round moves to its next contract\");\n    require(tx.outputs[0].tokenCategory == category + 0x01, \"the master keeps its mutable NFT\");\n    require(tx.outputs[0].tokenAmount == 0, \"no fungible tokens\");\n    require(tx.outputs[0].nftCommitment == next, \"the lock record must be exact\");\n    require(tx.outputs[0].value == value - LOCK_FEE_BASE - LOCK_FEE_PER_GATE * gates, \"fixed lock fee\");\n    return true;\n}\n",
  "debug": {
    "bytecode": "0b007a547f75007f77815a8a53890b007a5c7f75587f77815a8a54890b007a607f755c7f77815a8a55892500798277609c695179827701409c69517a5179537aba690079548a00a069007a558a00a0695689325479527a5279568a537a537a5379568a5179548a5179548a51935a8a9c69007a538a52799f690079538a527aa269007a548a57894d390200ce01207f775187690079517f75007f775187690079567f75557f77010087690079557f75517f7700ce01207f755279587f75577f7781007a60975379597f75587f7781c2529c69c5009c69c3515279939c69c4519c6900cb05ffffffff009c6900c60051650079c39f630079cf5179ce5779527e87690079517f75007f775287690079557f75517f77587987690079567f75557f7781527951949c690079577f75567f7781609756799c695179cb05ffffffff009c69527951795a7f75577f778193537a757c6b7c6c53795279c693547a75537a537a537a51795193527a757c7500675168660000000065007959799f635a51795595930051650079c39f6351795179cf547955937f7554797f778193527a757c00795193517a7500675168665679527955807e577a75567a567a567a567a567a567a5579527993567a75557a557a557a557a557a517900a06354795193557a75547a547a547a547a6853795193547a75537a537a537a7575750067516866517a529f63516751795b79012c7f7501277f77819f6863516754795b79012e7f75012c7f77819f68515b797e5351807e01ff7e0056807e0056807e567953807e5c7901277f7501137f777e5f7a527a9163515c797e517e5d79587f75567f777e5d7901277f755d7f777e5e797e547956807e577953807e55797e5d795e7982777f75012e7f777e527a757c5e79517a756800cd517a876900d15a7a517e876900d3009c6900d2517a876900cc567a0240069402bc02587a95949c69517777777777777777777759894800cf76577f75567f778176539e69577a78009c635679776778519c63577977686852795d7f75597f77815a8a7c5d7a5d7a5d7a5d7a578a717b54800054807e547a598a696d6d75510499391c89894300cf76577f75567f7781539d765d7f75597f7781765a8a587a5d7a5d7a5d7a5d7a578a7c5a8a587a5c7a5c7a5c7a5c7a578a71537a5480537a54807e537a598a777777043f980fe48911765102ff008d9301218001207f770100885a89748c7a82549d8a",
    "sourceMap": "111::113:1;;;115::117;;;119::121;;;123::129;;;131::145;;;209::270;;;171:4:183:5;;;185::204;;;162:0:205:1;;;;;;;;;",
    "logs": [],
    "requires": [],
    "functionDebug": {
      "99391c89": {
        "requires": [
          {
            "ip": 13,
            "line": 174,
            "message": "gold locks with lockGold"
          },
          {
            "ip": 67,
            "line": 182,
            "message": "gates must close"
          }
        ],
        "logs": [],
        "sourceMap": "172:33:172:34;:23::49:1;173:30:173:36:0;:46::47;:30::48:1;;:43::44:0;:30::48:1;;:23::49;174:16:174:21:0;23:29:23:30;174:16:174:35:1;:8::65;175:24:175:33:0;;176:12:176:17;20:28:20:29;176:12:176:30:1;:32:178:9:0;177:21:177:30;;:12::31:1;178:15:180:9:0;:19:178:24;21:28:21:29;178:19:178:37:1;:39:180:9:0;179:21:179:30;;:12::31:1;178:39:180:9;:15;181:108:181:114:0;;:124::126;:108::127:1;;:121::122:0;:108::127:1;;:101::128;:26::129;;:93::99:0;:77::91;;:70::75;;:51::68;;:41::49;;:26::129:1;;182:85:182:128:0;:49::57;:59::60;:35::61:1;:78::79:0;:81::82;:64::83:1;:35;:27::33:0;;:16::129:1;;:8::151;171:4:183:5;;;"
      },
      "3f980fe4": {
        "requires": [
          {
            "ip": 11,
            "line": 196,
            "message": "only gold locks with two feeds"
          },
          {
            "ip": 64,
            "line": 200,
            "message": "gates must close"
          }
        ],
        "logs": [],
        "sourceMap": "195:33:195:34;:23::49:1;196::196:29:0;:39::40;:23::41:1;;:36::37:0;:23::41:1;;:16::42;23:29:23:30:0;196:8:196:92:1;197:33:197:39:0;:49::51;:33::52:1;;:46::47:0;:33::52:1;;:26::53;198:119:198:127:0;:29::128:1;;:108::117:0;;:89::106;;:79::87;;:57::77;;:44::55;;:29::128:1;;199:119:199:127:0;:29::128:1;;:108::117:0;;:89::106;;:79::87;;:57::77;;:44::55;;:29::128:1;;201:94:201:137:0;:45::56;;:58::59;:31::60:1;:77::88:0;;:90::91;:63::92:1;:31;:23::29:0;;:12::138:1;200:8:203:10;185:4:204:5;;"
      }
    },
    "invokeDebug": {
      "3": {
        "bytecode": "007a547f75007f77815a8a",
        "name": "messageTimestamp",
        "requires": [],
        "logs": [],
        "sourceMap": "112:15:112:22;;:32::33;:15::34:1;;:29::30:0;:15::34:1;;:11::35;;"
      },
      "4": {
        "bytecode": "007a5c7f75587f77815a8a",
        "name": "dataSequence",
        "requires": [],
        "logs": [],
        "sourceMap": "116:15:116:22;;:32::34;:15::35:1;;:29::30:0;:15::35:1;;:11::36;;"
      },
      "5": {
        "bytecode": "007a607f755c7f77815a8a",
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
        "bytecode": "5479527a5279568a537a537a5379568a5179548a5179548a51935a8a9c69007a538a52799f690079538a527aa269007a548a",
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
      "9": {
        "bytecode": "00ce01207f775187690079517f75007f775187690079567f75557f77010087690079557f75517f7700ce01207f755279587f75577f7781007a60975379597f75587f7781c2529c69c5009c69c3515279939c69c4519c6900cb05ffffffff009c6900c60051650079c39f630079cf5179ce5779527e87690079517f75007f775287690079557f75517f77587987690079567f75557f7781527951949c690079577f75567f7781609756799c695179cb05ffffffff009c69527951795a7f75577f778193537a757c6b7c6c53795279c693547a75537a537a537a51795193527a757c7500675168660000000065007959799f635a51795595930051650079c39f6351795179cf547955937f7554797f778193527a757c00795193517a7500675168665679527955807e577a75567a567a567a567a567a567a5579527993567a75557a557a557a557a557a517900a06354795193557a75547a547a547a547a6853795193547a75537a537a537a7575750067516866517a529f63516751795b79012c7f7501277f77819f6863516754795b79012e7f75012c7f77819f68515b797e5351807e01ff7e0056807e0056807e567953807e5c7901277f7501137f777e5f7a527a9163515c797e517e5d79587f75567f777e5d7901277f755d7f777e5e797e547956807e577953807e55797e5d795e7982777f75012e7f777e527a757c5e79517a756800cd517a876900d15a7a517e876900d3009c6900d2517a876900cc567a0240069402bc02587a95949c695177777777777777777777",
        "name": "closeGates",
        "requires": [
          {
            "ip": 7,
            "line": 210,
            "message": "input 0 must be a mutable master"
          },
          {
            "ip": 18,
            "line": 211,
            "message": "not a master commitment"
          },
          {
            "ip": 29,
            "line": 212,
            "message": "the round is not open"
          },
          {
            "ip": 68,
            "line": 219,
            "message": "lifecycle transactions are version 2"
          },
          {
            "ip": 72,
            "line": 220,
            "message": "lock carries no locktime"
          },
          {
            "ip": 79,
            "line": 221,
            "message": "every gate, and nothing else, must be merged"
          },
          {
            "ip": 83,
            "line": 222,
            "message": "the lock has one output"
          },
          {
            "ip": 88,
            "line": 223,
            "message": "fixed sequence"
          },
          {
            "ip": 110,
            "line": 229,
            "message": "input must be a gate of this category"
          },
          {
            "ip": 121,
            "line": 230,
            "message": "not a gate commitment"
          },
          {
            "ip": 133,
            "line": 231,
            "message": "gate belongs to another round"
          },
          {
            "ip": 148,
            "line": 232,
            "message": "gates must be in gate order"
          },
          {
            "ip": 163,
            "line": 233,
            "message": "gate and master disagree on outcomes"
          },
          {
            "ip": 169,
            "line": 234,
            "message": "fixed sequence"
          },
          {
            "ip": 499,
            "line": 264,
            "message": "the round moves to its next contract"
          },
          {
            "ip": 507,
            "line": 265,
            "message": "the master keeps its mutable NFT"
          },
          {
            "ip": 512,
            "line": 266,
            "message": "no fungible tokens"
          },
          {
            "ip": 518,
            "line": 267,
            "message": "the lock record must be exact"
          },
          {
            "ip": 531,
            "line": 268,
            "message": "fixed lock fee"
          }
        ],
        "logs": [],
        "sourceMap": "210:22:210:23;:12::38:1;:45::47:0;:12::48:1;:::51;:55::59:0;:12:::1;:4::97;211:12:211:18:0;;:28::29;:12::30:1;;:25::26:0;:12::30:1;;9:29:9:33:0;211:12:211:44:1;:4::73;212:12:212:18:0;;:28::29;:12::30:1;;:25::26:0;:12::30:1;;14:29:14:33:0;212:12:212:44:1;:4::71;213:20:213:26:0;;:36::37;:20::38:1;;:33::34:0;:20::38:1;;214:31:214:32:0;:21::47:1;:54::56:0;:21::57:1;:::60;215:36:215:42:0;;:52::53;:36::54:1;;:49::50:0;:36::54:1;;:29::55;216:22:216:37:0;;30:25:30:27;216:22:216:46:1;217:26:217:32:0;;:42::43;:26::44:1;;:39::40:0;:26::44:1;;:19::45;219:12:219:22:0;72:29:72:30;219:12:219:36:1;:4::78;220:12:220:23:0;:27::28;:12:::1;:4::58;221:12:221:28:0;:32::33;:36::41;;:32:::1;:12;:4::91;222:12:222:29:0;:33::34;:12:::1;:4::63;223:22:223:23:0;:12::39:1;69:33:69:43:0;223:12:223:57:1;:4::77;225:29:225:30:0;:19::37:1;226:22:226:23:0;227:20:227:21;:4:237:5;:23:227:24;;:27::43;:23:::1;:4:237:5:0;228:31:228:32;;:21::47:1;229:26:229:27:0;;:16::42:1;:46::54:0;;:57::61;:46:::1;:16;:8::104;230:16:230:20:0;;:30::31;:16::32:1;;:27::28:0;:16::32:1;;10:27:10:31:0;230:16:230:44:1;:8::71;231:16:231:20:0;;:30::31;:16::32:1;;:27::28:0;:16::32:1;;:36::43:0;;:16:::1;:8::78;232:23:232:27:0;;:37::38;:23::39:1;;:34::35:0;:23::39:1;;:16::40;:44::45:0;;:48::49;:44:::1;:16;:8::82;233:23:233:27:0;;:37::38;:23::39:1;;:34::35:0;:23::39:1;;:16::40;30:25:30:27:0;233:16:233:49:1;:53::61:0;;:16:::1;:8::103;234:26:234:27:0;;:16::43:1;69:33:69::0;234:16:234:61:1;:8::81;235:19:235:27:0;;:37::41;;:51::53;:37::54:1;;:48::49:0;:37::54:1;;:30::55;:19;:8::56;;;;;;;236:16:236:21:0;;:34::35;;:24::42:1;:16;:8::43;;;;;;;;;227:45:227:46:0;;:::48;::::1;;;;;:50:237:5;:4;;;;;239:19:239:21:0;240:17:240:18;241:28:241:29;242:26:242:27;:4:253:5;:29:242:36;;:39::47;;:29:::1;:4:253:5:0;243:23:243:25;:28::35;;:38::39;:28:::1;:23;244:21:244:22:0;245:24:245:25;:8:247:9;:27:245:28;;:31::47;:27:::1;:8:247:9:0;246:18:246:21;;:41::42;;:31::57:1;:71::76:0;;:79::80;:71:::1;:31::81;;:64::69:0;;:31::81:1;;:24::82;:18;:12::83;;;;245:49:245:50:0;;:::52;::::1;;;;:8:247:9;;;;;248:17:248:23:0;;:40::43;;:45::46;:26::47:1;:17;:8::48;;;;;;;;;;;;;;;249:14:249:17:0;;:20::23;;:14:::1;:8::24;;;;;;;;;;;;;250:12:250:15:0;;:18::19;:12:::1;:21:252:9:0;251:29:251:43;;:46::47;:29:::1;:12::48;;;;;;;;;;;250:21:252:9;242:49:242:56:0;;:::58;::::1;;;;;;;;;;:60:253:5;;;:4;;;;;255:18:255:32:0;;:35::36;:18:::1;:::74:0;;::::1;:40::43:0;;:53::59;;:70::72;:53::73:1;;:66::68:0;:53::73:1;;:46::74;:40;:18;:::117:0;;::::1;:78::86:0;;:96::102;;:113::115;:96::116:1;;:109::111:0;:96::116:1;;:89::117;:78;:18;9:29:9:33:0;256:30:256:37;;:17:::1;17:29:17:30:0;256:66:256:67;:40::68:1;:17;:71::75:0;:17:::1;:92::93:0;:95::96;:78::97:1;:17;:114::115:0;:117::118;:100::119:1;:17;257:24:257:32:0;;:34::35;:10::36:1;256:17;257:39::45:0;;:56::58;:39::59:1;;:52::54:0;:39::59:1;;256:17;258:24:258:44:0;;259:9:259:15;;:8:::1;:17:263:5:0;9:29:9:33;260:28:260:35;;:15:::1;15:31:15::0;260:15:260:50:1;:53::59:0;;:69::70;:53::71:1;;:66::67:0;:53::71:1;;:15;:74::80:0;;:91::93;:74::94:1;;:87::89:0;:74::94:1;;:15;:97::106:0;;:15:::1;261:28:261:31:0;;:33::34;:14::35:1;260:15;261:52::60:0;;:62::63;:38::64:1;260:15;261:67::73:0;;260:15:::1;261:76::82:0;;:93::99;;:::106:1;;:76::107;;:89::91:0;:76::107:1;;260:15;:8::108;;;;262:22:262:43:0;;:8::44:1;;;259:17:263:5;264:23:264:24:0;:12::41:1;:45::56:0;;:12:::1;:4::98;265:23:265:24:0;:12::39:1;:43::51:0;;:54::58;:43:::1;:12;:4::96;266:23:266:24:0;:12::37:1;:41::42:0;:12:::1;:4::66;267:23:267:24:0;:12::39:1;:43::47:0;;:12:::1;:4::82;268:23:268:24:0;:12::31:1;:35::40:0;;57:32:57:36;268:35:268:56:1;58:36:58:39:0;268:79:268:84;;:59:::1;:35;:12;:4::104;269:11:269:15:0;:4::16:1;;;;;;;;;"
      },
      "10": {
        "bytecode": "765102ff008d9301218001207f77010088",
        "name": "outlined source span 10",
        "requires": [],
        "logs": [],
        "sourceMap": "112:11:112:35:1;;;;;;;;;;;"
      }
    }
  },
  "functionBodies": {
    "99391c89": "00cf76577f75567f778176539e69577a78009c635679776778519c63577977686852795d7f75597f77815a8a7c5d7a5d7a5d7a5d7a578a717b54800054807e547a598a696d6d7551",
    "3f980fe4": "00cf76577f75567f7781539d765d7f75597f7781765a8a587a5d7a5d7a5d7a5d7a578a7c5a8a587a5c7a5c7a5c7a5c7a578a71537a5480537a54807e537a598a777777"
  },
  "fingerprint": "ee7da87430e5ead5cddbd2f0e98140c99f86847a03d609a29dcb94a64ec0e2fd",
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
  "updatedAt": "2026-11-18T11:07:39.177Z",
  "invocationAnalysis": {
    "version": 1,
    "protocolVersions": [
      1
    ],
    "functions": [
      {
        "id": 10,
        "name": "lock",
        "arity": 4,
        "entryPoint": true,
        "selector": "99391c89",
        "calls": [],
        "closure": [
          10
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
        "id": 11,
        "name": "lockGold",
        "arity": 8,
        "entryPoint": true,
        "selector": "3f980fe4",
        "calls": [],
        "closure": [
          11
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
          10
        ],
        "recursive": false
      },
      {
        "id": 1,
        "functions": [
          11
        ],
        "recursive": false
      }
    ]
  }
} as const;
