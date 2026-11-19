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
      ]
    },
    {
      "name": "lockGold",
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
      ]
    },
    {
      "name": "lockTimeout",
      "inputs": []
    }
  ],
  "bytecode": "5c7f75587f7781 OP_0 OP_DEFINE 52798277609d78827701409d7c52797bbb76008a00a069607f755c7f778100a069 OP_1 OP_DEFINE 5579557a5379518a537972518a78008a5379008a8b9d7b547f7581789f6978547f7581a169008a OP_2 OP_DEFINE 05ffffffff00 OP_3 OP_DEFINE 5479517f7551885479567f75557f770100885479557f75517f7700ce01207f755679587f75577f778160975779597f75587f7781c2529dc3515279939dc4519d0000516576c39f766b6376cf78ce5779527e8876517f75528876557f75517f7758798876567f75557f778152798c9d76577f75567f7781609756799d78cb538a9d5279785a7f75577f77819372777b53795279c693547a757c727b7c8b77686c91667500000000657658799f766b635a7855959300516576c39f766b636ecf547955937f7554797f7781937b757c8b686c91667555797855807e567a757c6b7c6b7c727b6c6c54797893557a757c6b7c727b6c7600a063537a8b7c727b687b8b7777686c9166755479567902e803959476537aa2695b7a7b529f9b785d79012c7f7501277f77819f9b53795d79012e7f75012c7f77819f9b5159797e5351807e01ff7e0056807e0056807e547953807e5d7901277f7501137f777e5a7a7b64515a797e517e5d79587f75567f777e5d7901277f755d7f777e5c797e537956807e557953807e54797e5d795e7982777f75012e7f777e7b757c5a79776800cd8800d1587a517e8800d3009d00d28802bc0251cf577f75567f77816096529c63024c04776800cc00c6567a93024006947b567a95949d6d6d6d6d51 OP_4 OP_DEFINE OP_7 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_0 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_DUP OP_3 OP_NUMNOTEQUAL OP_VERIFY OP_6 OP_ROLL OP_OVER OP_0 OP_NUMEQUAL OP_IF OP_5 OP_PICK OP_NIP OP_ELSE OP_OVER OP_1 OP_NUMEQUAL OP_IF OP_6 OP_PICK OP_NIP OP_ENDIF OP_ENDIF OP_9 OP_ROLL OP_10 OP_ROLL OP_11 OP_ROLL OP_12 OP_ROLL OP_4 OP_ROLL OP_6 OP_PICK OP_13 OP_SPLIT OP_DROP OP_9 OP_SPLIT OP_NIP OP_BIN2NUM OP_2 OP_INVOKE OP_TXLOCKTIME OP_0 OP_NUMEQUALVERIFY OP_0 OP_INPUTSEQUENCENUMBER OP_3 OP_INVOKE OP_NUMEQUALVERIFY OP_ROT OP_SWAP OP_4 OP_NUM2BIN OP_0 OP_4 OP_NUM2BIN OP_CAT OP_0 OP_2ROT OP_SWAP OP_4 OP_INVOKE OP_VERIFY OP_2DROP OP_2DROP OP_DROP OP_1 OP_ELSE OP_7 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_0 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_3 OP_NUMEQUALVERIFY OP_DUP OP_13 OP_SPLIT OP_DROP OP_9 OP_SPLIT OP_NIP OP_BIN2NUM OP_9 OP_ROLL OP_10 OP_ROLL OP_11 OP_ROLL OP_12 OP_ROLL OP_10 OP_ROLL OP_5 OP_PICK OP_2 OP_INVOKE OP_9 OP_ROLL OP_10 OP_ROLL OP_11 OP_ROLL OP_12 OP_ROLL OP_11 OP_ROLL OP_6 OP_ROLL OP_2 OP_INVOKE OP_TXLOCKTIME OP_0 OP_NUMEQUALVERIFY OP_0 OP_INPUTSEQUENCENUMBER OP_3 OP_INVOKE OP_NUMEQUALVERIFY OP_ROT OP_ROT OP_4 OP_NUM2BIN OP_ROT OP_4 OP_NUM2BIN OP_CAT OP_0 OP_3 OP_ROLL OP_4 OP_ROLL OP_4 OP_INVOKE OP_NIP OP_NIP OP_NIP OP_ELSE OP_7 OP_ROLL OP_2 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP 11 OP_SPLIT OP_DROP OP_13 OP_SPLIT OP_NIP OP_BIN2NUM 6054 OP_ADD OP_DUP OP_CHECKLOCKTIMEVERIFY OP_DROP OP_TXLOCKTIME OP_NUMEQUALVERIFY OP_0 OP_INPUTSEQUENCENUMBER feffffff00 OP_NUMEQUALVERIFY OP_0 OP_8 OP_NUM2BIN OP_1 OP_3 OP_ROLL OP_4 OP_ROLL OP_4 OP_INVOKE OP_VERIFY OP_2DROP OP_2DROP OP_1 OP_ENDIF OP_ENDIF",
  "source": "pragma cashscript ^0.14.0;\n\nimport \"./rules.cash\";\nimport \"./oracle.cash\";\n\n// A round before its lock (mutable NFT of category K). Commitment:\n//   [0] tag 0x01 · [1,5) round id · [5] state 0x00 · [6] asset · [7] mode << 4 | outcomes · [8] gate count G\n//   [9,13) T_lock · [13,17) T_close · [17,19) creator fee bps · [19,39) creator pubkey hash\n//   [39,44) minimum pot · [44,46) minimum entrants · [46, 46 + 4·(N-1)) range boundaries (RANGES mode)\n//\n// Lock: anyone, once the oracle has signed its first price at or after T_lock. It merges every gate, so no entry can\n// follow, and records the lock message's data sequence S; the strike is the oracle's next message, S + 1, which nobody\n// racing the lock can know yet. A round with no entries, one side only, or below its minimums is void right here.\n// Lock timeout: if the oracle never signs past T_lock (an outage), anyone voids the round after T_close + timeout.\ncontract MasterOpen(\n    bytes32 category,\n    bytes lockedLockingBytecode,\n    bytes sweepLockingBytecode,\n    pubkey oracleBtc,\n    pubkey oracleEth,\n    pubkey oracleBch,\n    pubkey oracleXau\n) {\n    function lock(bytes previous, datasig previousSignature, bytes first, datasig firstSignature) {\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be a round master of this category\");\n        bytes master = tx.inputs[0].nftCommitment;\n        int asset = int(master.slice(6, 7));\n        require(asset != ASSET_GOLD, \"gold locks with lockGold\");\n        pubkey oracle = oracleBch;\n        if (asset == ASSET_BTC) {\n            oracle = oracleBtc;\n        } else if (asset == ASSET_ETH) {\n            oracle = oracleEth;\n        }\n        int sequence = firstAtOrAfter(previous, previousSignature, first, firstSignature, oracle, int(master.slice(9, 13)));\n        require(tx.locktime == 0, \"lock carries no locktime\");\n        require(tx.inputs[0].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n        require(\n            closeGates(master, toPaddedBytes(sequence, 4) + toPaddedBytes(0, 4), false, lockedLockingBytecode, sweepLockingBytecode),\n            \"gates must close\"\n        );\n    }\n\n    function lockGold(\n        bytes previousUsd,\n        datasig previousUsdSignature,\n        bytes firstUsd,\n        datasig firstUsdSignature,\n        bytes previousXau,\n        datasig previousXauSignature,\n        bytes firstXau,\n        datasig firstXauSignature\n    ) {\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be a round master of this category\");\n        bytes master = tx.inputs[0].nftCommitment;\n        require(int(master.slice(6, 7)) == ASSET_GOLD, \"only gold locks with two feeds\");\n        int lockTime = int(master.slice(9, 13));\n        int usdSequence = firstAtOrAfter(previousUsd, previousUsdSignature, firstUsd, firstUsdSignature, oracleBch, lockTime);\n        int xauSequence = firstAtOrAfter(previousXau, previousXauSignature, firstXau, firstXauSignature, oracleXau, lockTime);\n        require(tx.locktime == 0, \"lock carries no locktime\");\n        require(tx.inputs[0].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n        require(\n            closeGates(\n                master,\n                toPaddedBytes(usdSequence, 4) + toPaddedBytes(xauSequence, 4),\n                false,\n                lockedLockingBytecode,\n                sweepLockingBytecode\n            ),\n            \"gates must close\"\n        );\n    }\n\n    // The oracle never signed past T_lock: after T_close + timeout anyone merges the gates into a void round, and every\n    // ticket is refunded. The locktime is exactly the deadline, so this transaction is unique too.\n    function lockTimeout() {\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be a round master of this category\");\n        bytes master = tx.inputs[0].nftCommitment;\n        int deadline = int(master.slice(13, 17)) + SETTLE_TIMEOUT;\n        require(tx.time >= deadline, \"too early to void\");\n        require(tx.locktime == deadline, \"locktime is exactly the deadline\");\n        require(tx.inputs[0].sequenceNumber == TIMEOUT_SEQUENCE, \"fixed sequence that enforces the locktime\");\n        require(closeGates(master, toPaddedBytes(0, 8), true, lockedLockingBytecode, sweepLockingBytecode), \"gates must close\");\n    }\n}\n\n// Merges input 0 (this master) with inputs 1..G (its gates, in gate order) into one output: the locked round, or the\n// void round ready for refunds. `sequences` is the 8-byte lock record (two feeds for gold, else the second is zero).\n// The pot is what the gates hold beyond their creation dust: every stake, plus any event exit fees left behind.\nfunction closeGates(\n    bytes master,\n    bytes sequences,\n    bool forceVoid,\n    bytes lockedLockingBytecode,\n    bytes sweepLockingBytecode\n) returns (bool) {\n    require(master.slice(0, 1) == TAG_MASTER, \"not a master commitment\");\n    require(master.slice(5, 6) == STATE_OPEN, \"the round is not open\");\n    bytes roundId = master.slice(1, 5);\n    bytes category = tx.inputs[0].tokenCategory.split(32)[0];\n    int outcomes = int(master.slice(7, 8)) % NIBBLE;\n    int gates = int(master.slice(8, 9));\n\n    require(tx.version == TX_VERSION, \"lifecycle transactions are version 2\");\n    require(tx.inputs.length == 1 + gates, \"every gate, and nothing else, must be merged\");\n    require(tx.outputs.length == 1, \"the lock has one output\");\n\n    int gateValue = 0;\n    int entrants = 0;\n    for (int i = 1; i < tx.inputs.length; i++) {\n        bytes gate = tx.inputs[i].nftCommitment;\n        require(tx.inputs[i].tokenCategory == category + 0x02, \"input must be a gate of this category\");\n        require(gate.slice(0, 1) == TAG_GATE, \"not a gate commitment\");\n        require(gate.slice(1, 5) == roundId, \"gate belongs to another round\");\n        require(int(gate.slice(5, 6)) == i - 1, \"gates must be in gate order\");\n        require(int(gate.slice(6, 7)) % NIBBLE == outcomes, \"gate and master disagree on outcomes\");\n        require(tx.inputs[i].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n        entrants = entrants + int(gate.slice(7, 10));\n        gateValue = gateValue + tx.inputs[i].value;\n    }\n\n    bytes totals = 0x;\n    int staked = 0;\n    int sidesWithStake = 0;\n    for (int outcome = 0; outcome < outcomes; outcome++) {\n        int start = 10 + outcome * 5;\n        int sum = 0;\n        for (int i = 1; i < tx.inputs.length; i++) {\n            sum = sum + int(tx.inputs[i].nftCommitment.slice(start, start + 5));\n        }\n        totals = totals + toPaddedBytes(sum, 5);\n        staked = staked + sum;\n        if (sum > 0) {\n            sidesWithStake = sidesWithStake + 1;\n        }\n    }\n    int pot = gateValue - gates * GATE_DUST;\n    require(pot >= staked, \"gates hold every stake\");\n\n    bool isVoid = forceVoid || sidesWithStake < 2 || pot < int(master.slice(39, 44)) || entrants < int(master.slice(44, 46));\n    bytes next = TAG_MASTER + roundId + toPaddedBytes(STATE_VOID, 1) + 0xff + toPaddedBytes(0, 6) + toPaddedBytes(0, 6)\n        + toPaddedBytes(entrants, 3) + master.slice(19, 39);\n    bytes destination = sweepLockingBytecode;\n    if (!isVoid) {\n        next = TAG_MASTER + roundId + STATE_LOCKED + master.slice(6, 8) + master.slice(13, 39) + sequences\n            + toPaddedBytes(pot, 6) + toPaddedBytes(entrants, 3) + totals + master.slice(46, master.length);\n        destination = lockedLockingBytecode;\n    }\n    require(tx.outputs[0].lockingBytecode == destination, \"the round moves to its next contract\");\n    require(tx.outputs[0].tokenCategory == category + 0x01, \"the master keeps its mutable NFT\");\n    require(tx.outputs[0].tokenAmount == 0, \"no fungible tokens\");\n    require(tx.outputs[0].nftCommitment == next, \"the lock record must be exact\");\n    // Every gate of a round has the same stake class (the factory and the lanes make them so).\n    int perGate = LOCK_FEE_PER_GATE;\n    if (int(tx.inputs[1].nftCommitment.slice(6, 7)) / NIBBLE == CLASS_EVENT) {\n        perGate = EVENT_LOCK_FEE_PER_GATE;\n    }\n    require(tx.outputs[0].value == tx.inputs[0].value + gateValue - LOCK_FEE_BASE - perGate * gates, \"fixed lock fee\");\n    return true;\n}\n",
  "fingerprint": "ca4503e6035cb26c31eebb4fa102e20a01e9b671c53df748fb14113c395a5207",
  "debug": {
    "bytecode": "075c7f75587f778100892152798277609d78827701409d7c52797bbb76008a00a069607f755c7f778100a0695189275579557a5379518a537972518a78008a5379008a8b9d7b547f7581789f6978547f7581a169008a52890605ffffffff0053894dd9015479517f7551885479567f75557f770100885479557f75517f7700ce01207f755679587f75577f778160975779597f75587f7781c2529dc3515279939dc4519d0000516576c39f766b6376cf78ce5779527e8876517f75528876557f75517f7758798876567f75557f778152798c9d76577f75567f7781609756799d78cb538a9d5279785a7f75577f77819372777b53795279c693547a757c727b7c8b77686c91667500000000657658799f766b635a7855959300516576c39f766b636ecf547955937f7554797f7781937b757c8b686c91667555797855807e567a757c6b7c6b7c727b6c6c54797893557a757c6b7c727b6c7600a063537a8b7c727b687b8b7777686c9166755479567902e803959476537aa2695b7a7b529f9b785d79012c7f7501277f77819f9b53795d79012e7f75012c7f77819f9b5159797e5351807e01ff7e0056807e0056807e547953807e5d7901277f7501137f777e5a7a7b64515a797e517e5d79587f75567f777e5d7901277f755d7f777e5c797e537956807e557953807e54797e5d795e7982777f75012e7f777e7b757c5a79776800cd8800d1587a517e8800d3009d00d28802bc0251cf577f75567f77816096529c63024c04776800cc00c6567a93024006947b567a95949d6d6d6d6d5154895779009c6300ce7c517e8800cf76577f75567f778176539e69567a78009c635579776778519c635679776868597a5a7a5b7a5c7a547a56795d7f75597f7781528ac5009d00cb538a9d7b7c54800054807e00717c548a696d6d7551675779519c6300ce7c517e8800cf76577f75567f7781539d765d7f75597f7781597a5a7a5b7a5c7a5a7a5579528a597a5a7a5b7a5c7a5b7a567a528ac5009d00cb538a9d7b7b54807b54807e00537a547a548a77777767577a529d00ce7c517e8800cf7601117f755d7f77810260549376b175c59d00cb05feffffff009d00588051537a547a548a696d6d516868",
    "sourceMap": "15::17:1;;::::1;24::30::0;;::::1;34::48::0;;::::1;70::70:41:0;;::::1;90::160:1:0;;::::1;24:4:42:5:0;;;;;25:26:25:27;:16::42:1;:46::54:0;:57::61;:46:::1;:8::114;26:33:26:34:0;:23::49:1;27:24:27:30:0;:40::41;:24::42:1;;:37::38:0;:24::42:1;;:20::43;28:16:28:21:0;:25::35:1;:16;:8::65;29:24:29:33:0;;30:12:30:17;:21::30:1;:12;:32:32:9:0;31:21:31:30;;:12::31:1;32:15:34:9:0;:19:32:24;:28::37:1;:19;:39:34:9:0;33:21:33:30;;:12::31:1;32:39:34:9;:15;35:38:35:46:0;;:48::65;;:67::72;;:74::88;;:90::96;;:102::108;;:118::120;:102::121:1;;:115::116:0;:102::121:1;;:98::122;:23::123;;36:16:36:27:0;:31::32;:8::62:1;37:26:37:27:0;:16::43:1;:47::61;;:8::81;39:23:39:29:0;:45::53;:55::56;:31::57:1;:74::75:0;:77::78;:60::79:1;:31;:81::86:0;:88::131;;:12::132:1;;38:8:41:10;24:98:42:5;;;;:4;44::72::0;;;;;54:26:54:27;:16::42:1;:46::54:0;:57::61;:46:::1;:8::114;55:33:55:34:0;:23::49:1;56:20:56:26:0;:36::37;:20::38:1;;:33::34:0;:20::38:1;;:16::39;:43::53;:8::89;57:27:57:33:0;:43::45;:27::46:1;;:40::41:0;:27::46:1;;:23::47;58:41:58:52:0;;:54::74;;:76::84;;:86::103;;:105::114;;:116::124;;:26::125:1;;59:41:59:52:0;;:54::74;;:76::84;;:86::103;;:105::114;;:116::124;;:26::125:1;;60:16:60:27:0;:31::32;:8::62:1;61:26:61:27:0;:16::43:1;:47::61;;:8::81;64:16:64:22:0;65:30:65:41;:43::44;:16::45:1;:62::73:0;:75::76;:48::77:1;:16;66::66:21:0;67::67:37;;68::68:36;;63:12:69:13:1;62:8:71:10;53:6:72:5;;;44:4;76::84::0;;;;77:26:77:27;:16::42:1;:46::54:0;:57::61;:46:::1;:8::114;78:33:78:34:0;:23::49:1;79:27:79:33:0;:44::46;:27::47:1;;:40::42:0;:27::47:1;;:23::48;:51::65;:23;80:27:80:35:0;:8::58:1;;81:16:81:27:0;:8::77:1;82:26:82:27:0;:16::43:1;:47::63;:8::110;83:49:83:50:0;:52::53;:35::54:1;:56::60:0;:62::83;;:85::105;;:16::106:1;;:8::128;76:27:84:5;;;15:0:85:1;",
    "logs": [],
    "requires": [
      {
        "ip": 32,
        "line": 25,
        "message": "input 0 must be a round master of this category"
      },
      {
        "ip": 46,
        "line": 28,
        "message": "gold locks with lockGold"
      },
      {
        "ip": 89,
        "line": 36,
        "message": "lock carries no locktime"
      },
      {
        "ip": 94,
        "line": 37,
        "message": "fixed sequence"
      },
      {
        "ip": 108,
        "line": 38,
        "message": "gates must close"
      },
      {
        "ip": 124,
        "line": 54,
        "message": "input 0 must be a round master of this category"
      },
      {
        "ip": 136,
        "line": 56,
        "message": "only gold locks with two feeds"
      },
      {
        "ip": 175,
        "line": 60,
        "message": "lock carries no locktime"
      },
      {
        "ip": 180,
        "line": 61,
        "message": "fixed sequence"
      },
      {
        "ip": 196,
        "line": 62,
        "message": "gates must close"
      },
      {
        "ip": 209,
        "line": 77,
        "message": "input 0 must be a round master of this category"
      },
      {
        "ip": 223,
        "line": 80,
        "message": "too early to void"
      },
      {
        "ip": 226,
        "line": 81,
        "message": "locktime is exactly the deadline"
      },
      {
        "ip": 230,
        "line": 82,
        "message": "fixed sequence that enforces the locktime"
      },
      {
        "ip": 241,
        "line": 83,
        "message": "gates must close"
      }
    ],
    "sourceTags": "189:191:sc",
    "functions": [
      {
        "id": 0,
        "name": "dataSequence",
        "inputs": [
          {
            "name": "message",
            "type": "bytes"
          }
        ],
        "bytecode": "5c7f75587f7781",
        "sourceMap": "16:32:16:34;:15::35:1;;:29::30:0;:15::35:1;;:11::36",
        "sourceFile": "oracle.cash",
        "logs": [],
        "requires": []
      },
      {
        "id": 1,
        "name": "requireSignedPrice",
        "inputs": [
          {
            "name": "message",
            "type": "bytes"
          },
          {
            "name": "signature",
            "type": "datasig"
          },
          {
            "name": "oracle",
            "type": "pubkey"
          }
        ],
        "bytecode": "52798277609d78827701409d7c52797bbb76008a00a069607f755c7f778100a069",
        "sourceMap": "25:12:25:19;;:::26:1;;:30::43;:4::80;26:18:26:27:0;:12::35:1;;:39::52;:4::91;27:25:27:34:0;:36::43;;:45::51;:4::90:1;28:25:28:32:0;:12::33:1;;:36::37:0;:12:::1;:4::74;29:12:29:33;;;;;;;:36::37:0;:12:::1;:4::72",
        "sourceFile": "oracle.cash",
        "logs": [],
        "requires": [
          {
            "ip": 5,
            "line": 25,
            "message": "oracle message must be 16 bytes"
          },
          {
            "ip": 10,
            "line": 26,
            "message": "oracle signature must be 64 bytes"
          },
          {
            "ip": 15,
            "line": 27,
            "message": "oracle signature does not verify"
          },
          {
            "ip": 21,
            "line": 28,
            "message": "metadata message is not a price"
          },
          {
            "ip": 31,
            "line": 29,
            "message": "oracle price must be positive"
          }
        ],
        "inlineRanges": "4:4:MESSAGE_BYTES;9:9:DATASIG_BYTES;22:28:messagePrice"
      },
      {
        "id": 2,
        "name": "firstAtOrAfter",
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
          },
          {
            "name": "oracle",
            "type": "pubkey"
          },
          {
            "name": "boundary",
            "type": "int"
          }
        ],
        "bytecode": "5579557a5379518a537972518a78008a5379008a8b9d7b547f7581789f6978547f7581a169008a",
        "sourceMap": "42:23:42:31;;:33::50;;:52::58;;:4::59:1;;43:23:43:28:0;;:30::52;:4::53:1;;44:25:44:30:0;:12::31:1;;:48::56:0;;:35::57:1;;:::61;:4::102;45:29:45:37:0;:12::38:1;;;;:41::49:0;:12:::1;:4::99;46:29:46:34:0;:12::35:1;;;;:::47;:4::99;47:11:47:30;",
        "sourceFile": "oracle.cash",
        "logs": [],
        "requires": [
          {
            "ip": 21,
            "line": 44,
            "message": "oracle messages must be consecutive"
          },
          {
            "ip": 29,
            "line": 45,
            "message": "previous message must be before the boundary"
          },
          {
            "ip": 36,
            "line": 46,
            "message": "first message must be at or after the boundary"
          }
        ],
        "inlineRanges": "23:26:messageTimestamp;31:34:messageTimestamp"
      },
      {
        "id": 3,
        "name": "FINAL_SEQUENCE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "05ffffffff00",
        "sourceMap": "70:30:70:40",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "id": 4,
        "name": "closeGates",
        "inputs": [
          {
            "name": "master",
            "type": "bytes"
          },
          {
            "name": "sequences",
            "type": "bytes"
          },
          {
            "name": "forceVoid",
            "type": "bool"
          },
          {
            "name": "lockedLockingBytecode",
            "type": "bytes"
          },
          {
            "name": "sweepLockingBytecode",
            "type": "bytes"
          }
        ],
        "bytecode": "5479517f7551885479567f75557f770100885479557f75517f7700ce01207f755679587f75577f778160975779597f75587f7781c2529dc3515279939dc4519d0000516576c39f766b6376cf78ce5779527e8876517f75528876557f75517f7758798876567f75557f778152798c9d76577f75567f7781609756799d78cb538a9d5279785a7f75577f77819372777b53795279c693547a757c727b7c8b77686c91667500000000657658799f766b635a7855959300516576c39f766b636ecf547955937f7554797f7781937b757c8b686c91667555797855807e567a757c6b7c6b7c727b6c6c54797893557a757c6b7c727b6c7600a063537a8b7c727b687b8b7777686c9166755479567902e803959476537aa2695b7a7b529f9b785d79012c7f7501277f77819f9b53795d79012e7f75012c7f77819f9b5159797e5351807e01ff7e0056807e0056807e547953807e5d7901277f7501137f777e5a7a7b64515a797e517e5d79587f75567f777e5d7901277f755d7f777e5c797e537956807e557953807e54797e5d795e7982777f75012e7f777e7b757c5a79776800cd8800d1587a517e8800d3009d00d28802bc0251cf577f75567f77816096529c63024c04776800cc00c6567a93024006947b567a95949d6d6d6d6d51",
        "sourceMap": "97:12:97:18;;:28::29;:12::30:1;;:34::44;:4::73;98:12:98:18:0;;:28::29;:12::30:1;;:25::26:0;:12::30:1;;:34::44;:4::71;99:20:99:26:0;;:36::37;:20::38:1;;:33::34:0;:20::38:1;;100:31:100:32:0;:21::47:1;:54::56:0;:21::57:1;:::60;101:23:101:29:0;;:39::40;:23::41:1;;:36::37:0;:23::41:1;;:19::42;:45::51;:19;102:20:102:26:0;;:36::37;:20::38:1;;:33::34:0;:20::38:1;;:16::39;104:12:104:22:0;:26::36:1;:4::78;105:12:105:28:0;:32::33;:36::41;;:32:::1;:4::91;106:12:106:29:0;:33::34;:4::63:1;108:20:108:21:0;109:19:109:20;110:17:110:18;:4:120:5;:20:110:21;:24::40;:20:::1;;;:47:120:5:0;111:31:111:32;:21::47:1;112:26:112:27:0;:16::42:1;:46::54:0;;:57::61;:46:::1;:8::104;113:16:113:20:0;:30::31;:16::32:1;;:36::44;:8::71;114:16:114:20:0;:30::31;:16::32:1;;:27::28:0;:16::32:1;;:36::43:0;;:8::78:1;115:20:115:24:0;:34::35;:20::36:1;;:31::32:0;:20::36:1;;:16::37;:41::42:0;;:::46:1;:8::79;116:20:116:24:0;:34::35;:20::36:1;;:31::32:0;:20::36:1;;:16::37;:40::46;:16;:50::58:0;;:8::100:1;117:26:117:27:0;:16::43:1;:47::61;;:8::81;118:19:118:27:0;;:34::38;:48::50;:34::51:1;;:45::46:0;:34::51:1;;:30::52;:19;:8::53;;;119:20:119:29:0;;:42::43;;:32::50:1;:20;:8::51;;;;;;110:42:110:45;;::120:5;:47;;:4;;;122:19:122:21:0;123:17:123:18;124:25:124:26;125:23:125:24;:4:136:5;:26:125:33;:36::44;;:26:::1;;;:57:136:5:0;126:20:126:22;:25::32;:35::36;:25:::1;:20;127:18:127:19:0;128:21:128:22;:8:130:9;:24:128:25;:28::44;:24:::1;;;:51:130:9:0;129:18:129:39;:28::54:1;:68::73:0;;:76::77;:68:::1;:28::78;;:61::66:0;;:28::78:1;;:24::79;:18;:12::80;;;128:46:128:49;:51:130:9;;:8;;;131:17:131:23:0;;:40::43;:45::46;:26::47:1;:17;:8::48;;;;;;;;;;;;132:17:132:23:0;;:26::29;:17:::1;:8::30;;;;;;;;;133:12:133:15:0;:18::19;:12:::1;:21:135:9:0;134:12:134:48:1;;;;;;133:21:135:9;125:46:125:55;;::136:5;;:57;;:4;;;137:14:137:23:0;;:26::31;;:34::43:1;:26;:14;138:12:138:15:0;:19::25;;:12:::1;:4::53;140:18:140:27:0;;:31::45;:48::49;:31:::1;:18;:53::56:0;:63::69;;:80::82;:63::83:1;;:76::78:0;:63::83:1;;:59::84;:53;:18;:88::96:0;;:103::109;;:120::122;:103::123:1;;:116::118:0;:103::123:1;;:99::124;:88;:18;141:17:141:27;:30::37:0;;:17:::1;:54::64;:66::67:0;:40::68:1;:17;:71::75:0;:17:::1;:92::93:0;:95::96;:78::97:1;:17;:114::115:0;:117::118;:100::119:1;:17;142:24:142:32:0;;:34::35;:10::36:1;141:17;142:39::45:0;;:56::58;:39::59:1;;:52::54:0;:39::59:1;;141:17;143:24:143:44:0;;144:9:144:15;:8:148:5;145:15:145:25:1;:28::35:0;;:15:::1;:38::50;:15;:53::59:0;;:69::70;:53::71:1;;:66::67:0;:53::71:1;;:15;:74::80:0;;:91::93;:74::94:1;;:87::89:0;:74::94:1;;:15;:97::106:0;;:15:::1;146:28:146:31:0;;:33::34;:14::35:1;145:15;146:52::60:0;;:62::63;:38::64:1;145:15;146:67::73:0;;145:15:::1;146:76::82:0;;:93::99;;:::106:1;;:76::107;;:89::91:0;:76::107:1;;145:15;:8::108;;;147:22:147:43:0;;:8::44:1;144:17:148:5;149:23:149:24:0;:12::41:1;:4::98;150:23:150:24:0;:12::39:1;:43::51:0;;:54::58;:43:::1;:4::96;151:23:151:24:0;:12::37:1;:41::42:0;:4::66:1;152:23:152:24:0;:12::39:1;:4::82;154:18:154:35;155:22:155:23:0;:12::38:1;:48::49:0;:12::50:1;;:45::46:0;:12::50:1;;:8::51;:54::60;:8;:64::75;:8;:77:157:5:0;156:18:156:41:1;:8::42;155:77:157:5;158:23:158:24:0;:12::31:1;:45::46:0;:35::53:1;:56::65:0;;:35:::1;:68::81;:35;:84::91:0;:94::99;;:84:::1;:35;:4::119;96:17:160:1;;;;",
        "sourceTags": "153:155:fu;156:159:lc;160:160:sc;204:204:fu;205:208:lc;209:209:sc;252:254:fu;255:255:sc;256:259:lc;260:260:sc",
        "logs": [],
        "requires": [
          {
            "ip": 6,
            "line": 97,
            "message": "not a master commitment"
          },
          {
            "ip": 16,
            "line": 98,
            "message": "the round is not open"
          },
          {
            "ip": 52,
            "line": 104,
            "message": "lifecycle transactions are version 2"
          },
          {
            "ip": 58,
            "line": 105,
            "message": "every gate, and nothing else, must be merged"
          },
          {
            "ip": 61,
            "line": 106,
            "message": "the lock has one output"
          },
          {
            "ip": 80,
            "line": 112,
            "message": "input must be a gate of this category"
          },
          {
            "ip": 86,
            "line": 113,
            "message": "not a gate commitment"
          },
          {
            "ip": 96,
            "line": 114,
            "message": "gate belongs to another round"
          },
          {
            "ip": 108,
            "line": 115,
            "message": "gates must be in gate order"
          },
          {
            "ip": 121,
            "line": 116,
            "message": "gate and master disagree on outcomes"
          },
          {
            "ip": 126,
            "line": 117,
            "message": "fixed sequence"
          },
          {
            "ip": 272,
            "line": 138,
            "message": "gates hold every stake"
          },
          {
            "ip": 401,
            "line": 149,
            "message": "the round moves to its next contract"
          },
          {
            "ip": 408,
            "line": 150,
            "message": "the master keeps its mutable NFT"
          },
          {
            "ip": 412,
            "line": 151,
            "message": "no fungible tokens"
          },
          {
            "ip": 415,
            "line": 152,
            "message": "the lock record must be exact"
          },
          {
            "ip": 448,
            "line": 158,
            "message": "fixed lock fee"
          }
        ],
        "inlineRanges": "5:5:TAG_MASTER;15:15:STATE_OPEN;39:39:NIBBLE;51:51:TX_VERSION;85:85:TAG_GATE;117:117:NIBBLE;265:265:GATE_DUST;304:304:TAG_MASTER;308:308:STATE_VOID;340:340:TAG_MASTER;344:344:STATE_LOCKED;416:416:LOCK_FEE_PER_GATE;426:426:NIBBLE;428:428:CLASS_EVENT;431:431:EVENT_LOCK_FEE_PER_GATE;441:441:LOCK_FEE_BASE"
      },
      {
        "name": "ASSET_GOLD",
        "kind": "constant",
        "inputs": [],
        "bytecode": "53",
        "sourceMap": "21:26:21:27",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "ASSET_BTC",
        "kind": "constant",
        "inputs": [],
        "bytecode": "00",
        "sourceMap": "18:25:18:26",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "ASSET_ETH",
        "kind": "constant",
        "inputs": [],
        "bytecode": "51",
        "sourceMap": "19:25:19:26",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "MESSAGE_BYTES",
        "kind": "constant",
        "inputs": [],
        "bytecode": "60",
        "sourceMap": "8:29:8:31",
        "sourceFile": "oracle.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "DATASIG_BYTES",
        "kind": "constant",
        "inputs": [],
        "bytecode": "0140",
        "sourceMap": "9:29:9:31",
        "sourceFile": "oracle.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "messagePrice",
        "inputs": [
          {
            "name": "message",
            "type": "bytes"
          }
        ],
        "bytecode": "607f755c7f7781",
        "sourceMap": "20:33:20:35;:15::36:1;;:29::31:0;:15::36:1;;:11::37",
        "sourceFile": "oracle.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "messageTimestamp",
        "inputs": [
          {
            "name": "message",
            "type": "bytes"
          }
        ],
        "bytecode": "547f7581",
        "sourceMap": "12:32:12:33;:15::34:1;;:11::35",
        "sourceFile": "oracle.cash",
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
      },
      {
        "name": "STATE_OPEN",
        "kind": "constant",
        "inputs": [],
        "bytecode": "0100",
        "sourceMap": "12:28:12:32",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "NIBBLE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "60",
        "sourceMap": "28:22:28:24",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "TX_VERSION",
        "kind": "constant",
        "inputs": [],
        "bytecode": "52",
        "sourceMap": "73:26:73:27",
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
      },
      {
        "name": "GATE_DUST",
        "kind": "constant",
        "inputs": [],
        "bytecode": "02e803",
        "sourceMap": "48:25:48:29",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "STATE_VOID",
        "kind": "constant",
        "inputs": [],
        "bytecode": "53",
        "sourceMap": "15:26:15:27",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "STATE_LOCKED",
        "kind": "constant",
        "inputs": [],
        "bytecode": "51",
        "sourceMap": "13:30:13:34",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "LOCK_FEE_PER_GATE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "02bc02",
        "sourceMap": "56:33:56:36",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "CLASS_EVENT",
        "kind": "constant",
        "inputs": [],
        "bytecode": "52",
        "sourceMap": "34:27:34:28",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "EVENT_LOCK_FEE_PER_GATE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "024c04",
        "sourceMap": "59:39:59:43",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "LOCK_FEE_BASE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "024006",
        "sourceMap": "55:29:55:33",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "SETTLE_TIMEOUT",
        "kind": "constant",
        "inputs": [],
        "bytecode": "026054",
        "sourceMap": "75:30:75:35",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "TIMEOUT_SEQUENCE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "05feffffff00",
        "sourceMap": "72:32:72:42",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      }
    ],
    "sources": {
      "rules.cash": "pragma cashscript ^0.14.0;\n\n// Jōge's shared rules: NFT tags, round states, stake classes and fixed lifecycle fees.\n// Every number here is mirrored in packages/sdk/src/round/constants.ts; change both together.\n\n// First byte of every commitment of category K.\nbytes constant TAG_MASTER = 0x01;\nbytes constant TAG_GATE = 0x02;\nbytes constant TAG_TICKET = 0x03;\n\n// Master state byte (offset 5).\nbytes constant STATE_OPEN = 0x00;\nbytes constant STATE_LOCKED = 0x01;\nint constant STATE_SETTLED = 2;\nint constant STATE_VOID = 3;\n\n// Assets: index into the oracle table. Gold needs two feeds (USD/BCH and XAU/BCH).\nint constant ASSET_BTC = 0;\nint constant ASSET_ETH = 1;\nint constant ASSET_BCH = 2;\nint constant ASSET_GOLD = 3;\n// USD/BCH is in cents, XAU/BCH in ounces × 100000, so usd × 10^7 ÷ xau is dollars per ounce × 10^4.\nint constant GOLD_FACTOR = 10000000;\n\n// Modes (high nibble of the mode byte); outcomes are the low nibble.\nint constant MODE_UPDOWN = 0;\nint constant MODE_RANGES = 1;\nint constant NIBBLE = 16;\nint constant MAX_OUTCOMES = 6;\n\n// Stake classes (high nibble of the gate's class byte): satoshi bounds per entry and per gate.\nint constant CLASS_SHORT = 0;\nint constant CLASS_HOURLY = 1;\nint constant CLASS_EVENT = 2;\nint constant MIN_STAKE = 5000;\nint constant SHORT_MAX_STAKE = 500000;\nint constant HOURLY_MAX_STAKE = 5000000;\nint constant EVENT_MAX_STAKE = 25000000;\nint constant SHORT_GATE_CAP = 10000000;\nint constant HOURLY_GATE_CAP = 100000000;\nint constant EVENT_GATE_CAP = 500000000;\n\n// Fees and dust (satoshis). Lifecycle fees are fixed so every client builds the same bytes; calibrated on chipnet from\n// measured sizes (gold settle ~1,840 B, gold lock with one gate ~1,940 B, ~190 B per swept P2SH32 ticket) with headroom.\n// P2S tickets carry their ~112-byte script in the output: dust is 444 + 3 × ~188 B ≈ 1,008 sats, so 1,200.\nint constant TICKET_DUST = 1200;\n// Every gate is created holding exactly this; the lock counts anything beyond it as pot.\nint constant GATE_DUST = 1000;\n// An event entrant may leave before the lock; this share of the stake stays in the gate and joins the winners' pot.\nint constant EVENT_EXIT_FEE_BPS = 300;\n// P2PKH unlocking bytecode: 0x41 push, 64-byte Schnorr signature, then the sighash byte.\nbytes constant SIGNATURE_PUSH = 0x41;\nint constant SIGHASH_BYTE = 65;\nint constant MIN_FEE_OUTPUT = 1000;\nint constant LOCK_FEE_BASE = 1600;\nint constant LOCK_FEE_PER_GATE = 700;\n// An event gate's script is nearly twice a lane gate's (~690 bytes per merged gate, measured 2026-11-17: a 2-gate event\n// lock is ~3,090 bytes, which 1,600 + 2 × 700 could not pay), so events pay more per gate.\nint constant EVENT_LOCK_FEE_PER_GATE = 1100;\nint constant SETTLE_FEE = 2200;\nint constant SWEEP_FEE_BASE = 1000;\nint constant SWEEP_FEE_PER_TICKET = 250;\n// Each swept ticket costs ~20,000 operation-cost units; 32 padding bytes buy 25,600 (measured).\nint constant SWEEP_PAD_PER_TICKET = 32;\nint constant PROTOCOL_FEE_BPS = 200;\nint constant MAX_CREATOR_FEE_BPS = 300;\nint constant BPS = 10000;\n\n// Lifecycle transactions take every input at this sequence; the SDK default (0xfffffffe) would allow a second variant.\nint constant FINAL_SEQUENCE = 4294967295;\n// Timeout paths need a non-final sequence so the node enforces their locktime.\nint constant TIMEOUT_SEQUENCE = 4294967294;\nint constant TX_VERSION = 2;\n// After T_close, how long settlement has before anyone may void the round (MTP lags about an hour on mainnet).\nint constant SETTLE_TIMEOUT = 21600;\n\nfunction maxStake(int stakeClass) returns (int) {\n    require(stakeClass >= CLASS_SHORT && stakeClass <= CLASS_EVENT, \"unknown stake class\");\n    int limit = SHORT_MAX_STAKE;\n    if (stakeClass == CLASS_HOURLY) {\n        limit = HOURLY_MAX_STAKE;\n    } else if (stakeClass == CLASS_EVENT) {\n        limit = EVENT_MAX_STAKE;\n    }\n    return limit;\n}\n\nfunction gateCap(int stakeClass) returns (int) {\n    int cap = SHORT_GATE_CAP;\n    if (stakeClass == CLASS_HOURLY) {\n        cap = HOURLY_GATE_CAP;\n    } else if (stakeClass == CLASS_EVENT) {\n        cap = EVENT_GATE_CAP;\n    }\n    return cap;\n}\n\n// Gold in ten-thousandths of a US dollar per ounce, from the USD/BCH and XAU/BCH prices of the same minute.\nfunction goldPrice(int usdPerBch, int xauPerBch) returns (int) {\n    return usdPerBch * GOLD_FACTOR / xauPerBch;\n}\n",
      "oracle.cash": "pragma cashscript ^0.14.0;\n\n// General Protocols price messages, as verified by AnyHedge v0.12 (contract.cash l.73-94).\n// A message is 16 bytes of little-endian script numbers:\n//   [0,4) message timestamp · [4,8) message sequence · [8,12) data sequence · [12,16) price.\n// A data sequence <= 0 marks a metadata message, which is never a price.\n\nint constant MESSAGE_BYTES = 16;\nint constant DATASIG_BYTES = 64;\n\nfunction messageTimestamp(bytes message) returns (int) {\n    return int(message.slice(0, 4));\n}\n\nfunction dataSequence(bytes message) returns (int) {\n    return int(message.slice(8, 12));\n}\n\nfunction messagePrice(bytes message) returns (int) {\n    return int(message.slice(12, 16));\n}\n\n// Proves `message` is a signed price message from `oracle`. Fixed lengths keep every proof byte-identical.\nfunction requireSignedPrice(bytes message, datasig signature, pubkey oracle) {\n    require(message.length == MESSAGE_BYTES, \"oracle message must be 16 bytes\");\n    require(bytes(signature).length == DATASIG_BYTES, \"oracle signature must be 64 bytes\");\n    require(checkDataSig(signature, message, oracle), \"oracle signature does not verify\");\n    require(dataSequence(message) > 0, \"metadata message is not a price\");\n    require(messagePrice(message) > 0, \"oracle price must be positive\");\n}\n\n// Proves `first` is the oracle's first price message at or after `boundary`: the previous message (consecutive data\n// sequence) is strictly before the boundary. Returns the first message's data sequence.\nfunction firstAtOrAfter(\n    bytes previous,\n    datasig previousSignature,\n    bytes first,\n    datasig firstSignature,\n    pubkey oracle,\n    int boundary\n) returns (int) {\n    requireSignedPrice(previous, previousSignature, oracle);\n    requireSignedPrice(first, firstSignature, oracle);\n    require(dataSequence(first) == dataSequence(previous) + 1, \"oracle messages must be consecutive\");\n    require(messageTimestamp(previous) < boundary, \"previous message must be before the boundary\");\n    require(messageTimestamp(first) >= boundary, \"first message must be at or after the boundary\");\n    return dataSequence(first);\n}\n\n// Proves `message` is the oracle's price with data sequence `sequence` and returns its price.\nfunction priceAtSequence(bytes message, datasig signature, pubkey oracle, int sequence) returns (int) {\n    requireSignedPrice(message, signature, oracle);\n    require(dataSequence(message) == sequence, \"strike must be the message after the lock message\");\n    return messagePrice(message);\n}\n"
    },
    "inlineRanges": "44:44:ASSET_GOLD;50:50:ASSET_BTC;58:58:ASSET_ETH;135:135:ASSET_GOLD;220:220:SETTLE_TIMEOUT;229:229:TIMEOUT_SEQUENCE"
  },
  "compiler": {
    "name": "cashc",
    "version": "0.14.0",
    "options": {
      "enforceFunctionParameterTypes": true,
      "enforceLocktimeGuard": false
    }
  },
  "updatedAt": "2026-11-19T09:12:36.898Z"
} as const;
