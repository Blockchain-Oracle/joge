export default {
  "contractName": "DollarMasterOpen",
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
      "name": "sideLockingBytecode",
      "type": "bytes"
    },
    {
      "name": "dollarCategory",
      "type": "bytes32"
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
  "bytecode": "5c7f75587f7781 OP_0 OP_DEFINE 52798277609d78827701409d7c52797bbb76008a00a069607f755c7f778100a069 OP_1 OP_DEFINE 5579557a5379518a537972518a78008a5379008a8b9d7b547f7581789f6978547f7581a169008a OP_2 OP_DEFINE 05ffffffff00 OP_3 OP_DEFINE 5679517f7551885679567f75557f770100885679557f75517f7700ce01207f755879587f75577f778160975979597f75587f7781c2529dc35152537995939dc4529d0000005165765579a1766b6376cf78ce5879527e8876517f75528876557f75517f7759798876567f75557f778152798c9d76577f75567f77815360955879939d78cb538a9d5379785a7f75577f778193547a757c727b54795279c693557a757c6b7c727b6c5579527993765c795c795279c77b877bce7b879a6976cb538a9d76c602e8039d537978d093547a757c727b7b8b7777686c91667500000000657659799f766b635a78559593005165765b79a1766b636ecf547955937f7554797f7781937b757c8b686c91667555797855807e567a757c6b7c6b7c727b6c6c54797893557a757c6b7c727b6c7600a063537a8b7c727b687b8b7777686c9166755379577951959476537aa2695e7a7b529f9b786079012c7f7501277f77819f9b54796079012e7f75012c7f77819f9b515a797e5351807e01ff7e0056807e0056807e557953807e607901277f7501137f777e5d7a7b64515b797e517e6079587f75567f777e607901277f755d7f777e5f797e537956807e567953807e54797e607901117982777f75012e7f777e7b757c5d79776800cd8800d1597a517e8800d3009d00d28800cc00c6567a9356798c02e803959302f00a94024c04577a95949d51587a587a557a5379cd537a885279d17b8878d39dcc02e8039d51696d6d6d6d51 OP_4 OP_DEFINE OP_9 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_0 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_DUP OP_3 OP_NUMNOTEQUAL OP_VERIFY OP_8 OP_ROLL OP_OVER OP_0 OP_NUMEQUAL OP_IF OP_7 OP_PICK OP_NIP OP_ELSE OP_OVER OP_1 OP_NUMEQUAL OP_IF OP_8 OP_PICK OP_NIP OP_ENDIF OP_ENDIF OP_11 OP_ROLL OP_12 OP_ROLL OP_13 OP_ROLL OP_14 OP_ROLL OP_4 OP_ROLL OP_6 OP_PICK OP_13 OP_SPLIT OP_DROP OP_9 OP_SPLIT OP_NIP OP_BIN2NUM OP_2 OP_INVOKE OP_TXLOCKTIME OP_0 OP_NUMEQUALVERIFY OP_0 OP_INPUTSEQUENCENUMBER OP_3 OP_INVOKE OP_NUMEQUALVERIFY OP_ROT OP_SWAP OP_4 OP_NUM2BIN OP_0 OP_4 OP_NUM2BIN OP_CAT OP_0 OP_2ROT OP_SWAP OP_6 OP_ROLL OP_7 OP_ROLL OP_4 OP_INVOKE OP_VERIFY OP_2DROP OP_2DROP OP_DROP OP_1 OP_ELSE OP_9 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_0 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_3 OP_NUMEQUALVERIFY OP_DUP OP_13 OP_SPLIT OP_DROP OP_9 OP_SPLIT OP_NIP OP_BIN2NUM OP_11 OP_ROLL OP_12 OP_ROLL OP_13 OP_ROLL OP_14 OP_ROLL OP_12 OP_ROLL OP_5 OP_PICK OP_2 OP_INVOKE OP_11 OP_ROLL OP_12 OP_ROLL OP_13 OP_ROLL OP_14 OP_ROLL OP_13 OP_ROLL OP_6 OP_ROLL OP_2 OP_INVOKE OP_TXLOCKTIME OP_0 OP_NUMEQUALVERIFY OP_0 OP_INPUTSEQUENCENUMBER OP_3 OP_INVOKE OP_NUMEQUALVERIFY OP_ROT OP_ROT OP_4 OP_NUM2BIN OP_ROT OP_4 OP_NUM2BIN OP_CAT OP_0 OP_3 OP_ROLL OP_2ROT OP_SWAP OP_6 OP_ROLL OP_4 OP_INVOKE OP_NIP OP_NIP OP_NIP OP_ELSE OP_9 OP_ROLL OP_2 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP 11 OP_SPLIT OP_DROP OP_13 OP_SPLIT OP_NIP OP_BIN2NUM 6054 OP_ADD OP_DUP OP_CHECKLOCKTIMEVERIFY OP_DROP OP_TXLOCKTIME OP_NUMEQUALVERIFY OP_0 OP_INPUTSEQUENCENUMBER feffffff00 OP_NUMEQUALVERIFY OP_0 OP_8 OP_NUM2BIN OP_1 OP_3 OP_ROLL OP_2ROT OP_SWAP OP_6 OP_ROLL OP_4 OP_INVOKE OP_VERIFY OP_2DROP OP_2DROP OP_1 OP_ENDIF OP_ENDIF",
  "source": "pragma cashscript ^0.14.0;\n\nimport \"./dollar.cash\";\nimport \"./oracle.cash\";\n\n// A dollar event before its lock (mutable NFT of category K): MasterOpen, with the stakes in its gates' sidecars.\n// Same commitment and rules as MasterOpen; the lock also merges every sidecar into one pot sidecar beside the master. Commitment:\n//   [0] tag 0x01 · [1,5) round id · [5] state 0x00 · [6] asset · [7] mode << 4 | outcomes · [8] gate count G\n//   [9,13) T_lock · [13,17) T_close · [17,19) creator fee bps · [19,39) creator pubkey hash\n//   [39,44) minimum pot · [44,46) minimum entrants · [46, 46 + 4·(N-1)) range boundaries (RANGES mode)\n//\n// Lock: anyone, once the oracle has signed its first price at or after T_lock. It merges every gate, so no entry can\n// follow, and records the lock message's data sequence S; the strike is the oracle's next message, S + 1, which nobody\n// racing the lock can know yet. A round with no entries, one side only, or below its minimums is void right here.\n// Lock timeout: if the oracle never signs past T_lock (an outage), anyone voids the round after T_close + timeout.\ncontract DollarMasterOpen(\n    bytes32 category,\n    bytes lockedLockingBytecode,\n    bytes sweepLockingBytecode,\n    bytes sideLockingBytecode,\n    bytes32 dollarCategory,\n    pubkey oracleBtc,\n    pubkey oracleEth,\n    pubkey oracleBch,\n    pubkey oracleXau\n) {\n    function lock(bytes previous, datasig previousSignature, bytes first, datasig firstSignature) {\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be a round master of this category\");\n        bytes master = tx.inputs[0].nftCommitment;\n        int asset = int(master.slice(6, 7));\n        require(asset != ASSET_GOLD, \"gold locks with lockGold\");\n        pubkey oracle = oracleBch;\n        if (asset == ASSET_BTC) {\n            oracle = oracleBtc;\n        } else if (asset == ASSET_ETH) {\n            oracle = oracleEth;\n        }\n        int sequence = firstAtOrAfter(previous, previousSignature, first, firstSignature, oracle, int(master.slice(9, 13)));\n        require(tx.locktime == 0, \"lock carries no locktime\");\n        require(tx.inputs[0].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n        require(\n            closeDollarGates(master, toPaddedBytes(sequence, 4) + toPaddedBytes(0, 4), false, lockedLockingBytecode, sweepLockingBytecode, sideLockingBytecode, dollarCategory),\n            \"gates must close\"\n        );\n    }\n\n    function lockGold(\n        bytes previousUsd,\n        datasig previousUsdSignature,\n        bytes firstUsd,\n        datasig firstUsdSignature,\n        bytes previousXau,\n        datasig previousXauSignature,\n        bytes firstXau,\n        datasig firstXauSignature\n    ) {\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be a round master of this category\");\n        bytes master = tx.inputs[0].nftCommitment;\n        require(int(master.slice(6, 7)) == ASSET_GOLD, \"only gold locks with two feeds\");\n        int lockTime = int(master.slice(9, 13));\n        int usdSequence = firstAtOrAfter(previousUsd, previousUsdSignature, firstUsd, firstUsdSignature, oracleBch, lockTime);\n        int xauSequence = firstAtOrAfter(previousXau, previousXauSignature, firstXau, firstXauSignature, oracleXau, lockTime);\n        require(tx.locktime == 0, \"lock carries no locktime\");\n        require(tx.inputs[0].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n        require(\n            closeDollarGates(\n                master,\n                toPaddedBytes(usdSequence, 4) + toPaddedBytes(xauSequence, 4),\n                false,\n                lockedLockingBytecode,\n                sweepLockingBytecode,\n                sideLockingBytecode,\n                dollarCategory\n            ),\n            \"gates must close\"\n        );\n    }\n\n    // The oracle never signed past T_lock: after T_close + timeout anyone merges the gates into a void round, and every\n    // ticket is refunded. The locktime is exactly the deadline, so this transaction is unique too.\n    function lockTimeout() {\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be a round master of this category\");\n        bytes master = tx.inputs[0].nftCommitment;\n        int deadline = int(master.slice(13, 17)) + SETTLE_TIMEOUT;\n        require(tx.time >= deadline, \"too early to void\");\n        require(tx.locktime == deadline, \"locktime is exactly the deadline\");\n        require(tx.inputs[0].sequenceNumber == TIMEOUT_SEQUENCE, \"fixed sequence that enforces the locktime\");\n        require(closeDollarGates(master, toPaddedBytes(0, 8), true, lockedLockingBytecode, sweepLockingBytecode, sideLockingBytecode, dollarCategory), \"gates must close\");\n    }\n}\n\n// Merges input 0 (this master) with inputs 1..G (its dollar gates, in gate order) and inputs G+1..2G (the gates'\n// sidecars) into the locked (or void) master at output 0 and one pot sidecar at output 1 holding every dollar. The pot\n// is what the sidecars hold beyond their seeds: every stake, plus any exit fees left behind. The seeds stay in the pot\n// sidecar until the last payout returns them to the creator.\nfunction closeDollarGates(\n    bytes master,\n    bytes sequences,\n    bool forceVoid,\n    bytes lockedLockingBytecode,\n    bytes sweepLockingBytecode,\n    bytes sideLockingBytecode,\n    bytes32 dollarCategory\n) returns (bool) {\n    require(master.slice(0, 1) == TAG_MASTER, \"not a master commitment\");\n    require(master.slice(5, 6) == STATE_OPEN, \"the round is not open\");\n    bytes roundId = master.slice(1, 5);\n    bytes category = tx.inputs[0].tokenCategory.split(32)[0];\n    int outcomes = int(master.slice(7, 8)) % NIBBLE;\n    int gates = int(master.slice(8, 9));\n\n    require(tx.version == TX_VERSION, \"lifecycle transactions are version 2\");\n    require(tx.inputs.length == 1 + 2 * gates, \"every gate and one sidecar per gate, and nothing else\");\n    require(tx.outputs.length == 2, \"the lock makes the master and the pot sidecar\");\n\n    int gateValue = 0;\n    int entrants = 0;\n    int held = 0;\n    for (int i = 1; i <= gates; i++) {\n        bytes gate = tx.inputs[i].nftCommitment;\n        require(tx.inputs[i].tokenCategory == category + 0x02, \"input must be a gate of this category\");\n        require(gate.slice(0, 1) == TAG_GATE, \"not a gate commitment\");\n        require(gate.slice(1, 5) == roundId, \"gate belongs to another round\");\n        require(int(gate.slice(5, 6)) == i - 1, \"gates must be in gate order\");\n        require(int(gate.slice(6, 7)) == CLASS_DOLLAR * NIBBLE + outcomes, \"a dollar gate with the master's outcomes\");\n        require(tx.inputs[i].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n        entrants = entrants + int(gate.slice(7, 10));\n        gateValue = gateValue + tx.inputs[i].value;\n        int side = gates + i;\n        require(isSide(side, sideLockingBytecode, dollarCategory), \"inputs G+1..2G must be sidecars\");\n        require(tx.inputs[side].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n        require(tx.inputs[side].value == TOKEN_DUST, \"a sidecar carries the fixed dust\");\n        held = held + tx.inputs[side].tokenAmount;\n    }\n\n    bytes totals = 0x;\n    int staked = 0;\n    int sidesWithStake = 0;\n    for (int outcome = 0; outcome < outcomes; outcome++) {\n        int start = 10 + outcome * 5;\n        int sum = 0;\n        for (int i = 1; i <= gates; i++) {\n            sum = sum + int(tx.inputs[i].nftCommitment.slice(start, start + 5));\n        }\n        totals = totals + toPaddedBytes(sum, 5);\n        staked = staked + sum;\n        if (sum > 0) {\n            sidesWithStake = sidesWithStake + 1;\n        }\n    }\n    int pot = held - gates * SIDE_SEED;\n    require(pot >= staked, \"the sidecars hold every stake\");\n\n    bool isVoid = forceVoid || sidesWithStake < 2 || pot < int(master.slice(39, 44)) || entrants < int(master.slice(44, 46));\n    bytes next = TAG_MASTER + roundId + toPaddedBytes(STATE_VOID, 1) + 0xff + toPaddedBytes(0, 6) + toPaddedBytes(0, 6)\n        + toPaddedBytes(entrants, 3) + master.slice(19, 39);\n    bytes destination = sweepLockingBytecode;\n    if (!isVoid) {\n        next = TAG_MASTER + roundId + STATE_LOCKED + master.slice(6, 8) + master.slice(13, 39) + sequences\n            + toPaddedBytes(pot, 6) + toPaddedBytes(entrants, 3) + totals + master.slice(46, master.length);\n        destination = lockedLockingBytecode;\n    }\n    require(tx.outputs[0].lockingBytecode == destination, \"the round moves to its next contract\");\n    require(tx.outputs[0].tokenCategory == category + 0x01, \"the master keeps its mutable NFT\");\n    require(tx.outputs[0].tokenAmount == 0, \"no fungible tokens on the master\");\n    require(tx.outputs[0].nftCommitment == next, \"the lock record must be exact\");\n    // The sidecars' satoshis join the master, less the pot sidecar's own dust and a fixed fee.\n    require(\n        tx.outputs[0].value\n            == tx.inputs[0].value + gateValue + (gates - 1) * TOKEN_DUST - DOLLAR_LOCK_FEE_BASE - DOLLAR_LOCK_FEE_PER_GATE * gates,\n        \"fixed lock fee\"\n    );\n    require(requireSideOut(1, sideLockingBytecode, dollarCategory, held), \"one pot sidecar holds every dollar\");\n    return true;\n}\n",
  "fingerprint": "50e8646815d90521fd55de0b2b9c5782ad9f6b4512ed1fb8ad51b03622facfd3",
  "debug": {
    "bytecode": "075c7f75587f778100892152798277609d78827701409d7c52797bbb76008a00a069607f755c7f778100a0695189275579557a5379518a537972518a78008a5379008a8b9d7b547f7581789f6978547f7581a169008a52890605ffffffff0053894d21025679517f7551885679567f75557f770100885679557f75517f7700ce01207f755879587f75577f778160975979597f75587f7781c2529dc35152537995939dc4529d0000005165765579a1766b6376cf78ce5879527e8876517f75528876557f75517f7759798876567f75557f778152798c9d76577f75567f77815360955879939d78cb538a9d5379785a7f75577f778193547a757c727b54795279c693557a757c6b7c727b6c5579527993765c795c795279c77b877bce7b879a6976cb538a9d76c602e8039d537978d093547a757c727b7b8b7777686c91667500000000657659799f766b635a78559593005165765b79a1766b636ecf547955937f7554797f7781937b757c8b686c91667555797855807e567a757c6b7c6b7c727b6c6c54797893557a757c6b7c727b6c7600a063537a8b7c727b687b8b7777686c9166755379577951959476537aa2695e7a7b529f9b786079012c7f7501277f77819f9b54796079012e7f75012c7f77819f9b515a797e5351807e01ff7e0056807e0056807e557953807e607901277f7501137f777e5d7a7b64515b797e517e6079587f75567f777e607901277f755d7f777e5f797e537956807e567953807e54797e607901117982777f75012e7f777e7b757c5d79776800cd8800d1597a517e8800d3009d00d28800cc00c6567a9356798c02e803959302f00a94024c04577a95949d51587a587a557a5379cd537a885279d17b8878d39dcc02e8039d51696d6d6d6d5154895979009c6300ce7c517e8800cf76577f75567f778176539e69587a78009c635779776778519c6358797768685b7a5c7a5d7a5e7a547a56795d7f75597f7781528ac5009d00cb538a9d7b7c54800054807e00717c567a577a548a696d6d7551675979519c6300ce7c517e8800cf76577f75567f7781539d765d7f75597f77815b7a5c7a5d7a5e7a5c7a5579528a5b7a5c7a5d7a5e7a5d7a567a528ac5009d00cb538a9d7b7b54807b54807e00537a717c567a548a77777767597a529d00ce7c517e8800cf7601117f755d7f77810260549376b175c59d00cb05feffffff009d00588051537a717c567a548a696d6d516868",
    "sourceMap": "15::17:1;;::::1;24::30::0;;::::1;34::48::0;;::::1;70::70:41:0;;::::1;96::175:1:0;;::::1;27:4:45:5:0;;;;;28:26:28:27;:16::42:1;:46::54:0;:57::61;:46:::1;:8::114;29:33:29:34:0;:23::49:1;30:24:30:30:0;:40::41;:24::42:1;;:37::38:0;:24::42:1;;:20::43;31:16:31:21:0;:25::35:1;:16;:8::65;32:24:32:33:0;;33:12:33:17;:21::30:1;:12;:32:35:9:0;34:21:34:30;;:12::31:1;35:15:37:9:0;:19:35:24;:28::37:1;:19;:39:37:9:0;36:21:36:30;;:12::31:1;35:39:37:9;:15;38:38:38:46:0;;:48::65;;:67::72;;:74::88;;:90::96;;:102::108;;:118::120;:102::121:1;;:115::116:0;:102::121:1;;:98::122;:23::123;;39:16:39:27:0;:31::32;:8::62:1;40:26:40:27:0;:16::43:1;:47::61;;:8::81;42:29:42:35:0;:51::59;:61::62;:37::63:1;:80::81:0;:83::84;:66::85:1;:37;:87::92:0;:94::137;;:139::158;;:160::174;;:12::175:1;;41:8:44:10;27:98:45:5;;;;:4;47::77::0;;;;;57:26:57:27;:16::42:1;:46::54:0;:57::61;:46:::1;:8::114;58:33:58:34:0;:23::49:1;59:20:59:26:0;:36::37;:20::38:1;;:33::34:0;:20::38:1;;:16::39;:43::53;:8::89;60:27:60:33:0;:43::45;:27::46:1;;:40::41:0;:27::46:1;;:23::47;61:41:61:52:0;;:54::74;;:76::84;;:86::103;;:105::114;;:116::124;;:26::125:1;;62:41:62:52:0;;:54::74;;:76::84;;:86::103;;:105::114;;:116::124;;:26::125:1;;63:16:63:27:0;:31::32;:8::62:1;64:26:64:27:0;:16::43:1;:47::61;;:8::81;67:16:67:22:0;68:30:68:41;:43::44;:16::45:1;:62::73:0;:75::76;:48::77:1;:16;69::69:21:0;70::70:37;;71::72:35;;73::73:30;;66:12:74:13:1;65:8:76:10;56:6:77:5;;;47:4;81::89::0;;;;82:26:82:27;:16::42:1;:46::54:0;:57::61;:46:::1;:8::114;83:33:83:34:0;:23::49:1;84:27:84:33:0;:44::46;:27::47:1;;:40::42:0;:27::47:1;;:23::48;:51::65;:23;85:27:85:35:0;:8::58:1;;86:16:86:27:0;:8::77:1;87:26:87:27:0;:16::43:1;:47::63;:8::110;88:55:88:56:0;:58::59;:41::60:1;:62::66:0;:68::89;;:91::132;;:134::148;;:16::149:1;;:8::171;81:27:89:5;;;16:0:90:1;",
    "logs": [],
    "requires": [
      {
        "ip": 34,
        "line": 28,
        "message": "input 0 must be a round master of this category"
      },
      {
        "ip": 48,
        "line": 31,
        "message": "gold locks with lockGold"
      },
      {
        "ip": 91,
        "line": 39,
        "message": "lock carries no locktime"
      },
      {
        "ip": 96,
        "line": 40,
        "message": "fixed sequence"
      },
      {
        "ip": 114,
        "line": 41,
        "message": "gates must close"
      },
      {
        "ip": 130,
        "line": 57,
        "message": "input 0 must be a round master of this category"
      },
      {
        "ip": 142,
        "line": 59,
        "message": "only gold locks with two feeds"
      },
      {
        "ip": 181,
        "line": 63,
        "message": "lock carries no locktime"
      },
      {
        "ip": 186,
        "line": 64,
        "message": "fixed sequence"
      },
      {
        "ip": 204,
        "line": 65,
        "message": "gates must close"
      },
      {
        "ip": 217,
        "line": 82,
        "message": "input 0 must be a round master of this category"
      },
      {
        "ip": 231,
        "line": 85,
        "message": "too early to void"
      },
      {
        "ip": 234,
        "line": 86,
        "message": "locktime is exactly the deadline"
      },
      {
        "ip": 238,
        "line": 87,
        "message": "fixed sequence that enforces the locktime"
      },
      {
        "ip": 251,
        "line": 88,
        "message": "gates must close"
      }
    ],
    "sourceTags": "195:197:sc",
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
        "name": "closeDollarGates",
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
          },
          {
            "name": "sideLockingBytecode",
            "type": "bytes"
          },
          {
            "name": "dollarCategory",
            "type": "bytes32"
          }
        ],
        "bytecode": "5679517f7551885679567f75557f770100885679557f75517f7700ce01207f755879587f75577f778160975979597f75587f7781c2529dc35152537995939dc4529d0000005165765579a1766b6376cf78ce5879527e8876517f75528876557f75517f7759798876567f75557f778152798c9d76577f75567f77815360955879939d78cb538a9d5379785a7f75577f778193547a757c727b54795279c693557a757c6b7c727b6c5579527993765c795c795279c77b877bce7b879a6976cb538a9d76c602e8039d537978d093547a757c727b7b8b7777686c91667500000000657659799f766b635a78559593005165765b79a1766b636ecf547955937f7554797f7781937b757c8b686c91667555797855807e567a757c6b7c6b7c727b6c6c54797893557a757c6b7c727b6c7600a063537a8b7c727b687b8b7777686c9166755379577951959476537aa2695e7a7b529f9b786079012c7f7501277f77819f9b54796079012e7f75012c7f77819f9b515a797e5351807e01ff7e0056807e0056807e557953807e607901277f7501137f777e5d7a7b64515b797e517e6079587f75567f777e607901277f755d7f777e5f797e537956807e567953807e54797e607901117982777f75012e7f777e7b757c5d79776800cd8800d1597a517e8800d3009d00d28800cc00c6567a9356798c02e803959302f00a94024c04577a95949d51587a587a557a5379cd537a885279d17b8878d39dcc02e8039d51696d6d6d6d51",
        "sourceMap": "105:12:105:18;;:28::29;:12::30:1;;:34::44;:4::73;106:12:106:18:0;;:28::29;:12::30:1;;:25::26:0;:12::30:1;;:34::44;:4::71;107:20:107:26:0;;:36::37;:20::38:1;;:33::34:0;:20::38:1;;108:31:108:32:0;:21::47:1;:54::56:0;:21::57:1;:::60;109:23:109:29:0;;:39::40;:23::41:1;;:36::37:0;:23::41:1;;:19::42;:45::51;:19;110:20:110:26:0;;:36::37;:20::38:1;;:33::34:0;:20::38:1;;:16::39;112:12:112:22:0;:26::36:1;:4::78;113:12:113:28:0;:32::33;:36::37;:40::45;;:36:::1;:32;:4::104;114:12:114:29:0;:33::34;:4::85:1;116:20:116:21:0;117:19:117:20;118:15:118:16;119:17:119:18;:4:134:5;:20:119:21;:25::30;;:20:::1;;;:37:134:5:0;120:31:120:32;:21::47:1;121:26:121:27:0;:16::42:1;:46::54:0;;:57::61;:46:::1;:8::104;122:16:122:20:0;:30::31;:16::32:1;;:36::44;:8::71;123:16:123:20:0;:30::31;:16::32:1;;:27::28:0;:16::32:1;;:36::43:0;;:8::78:1;124:20:124:24:0;:34::35;:20::36:1;;:31::32:0;:20::36:1;;:16::37;:41::42:0;;:::46:1;:8::79;125:20:125:24:0;:34::35;:20::36:1;;:31::32:0;:20::36:1;;:16::37;:41::53;:56::62;:41;:65::73:0;;:41:::1;:8::119;126:26:126:27:0;:16::43:1;:47::61;;:8::81;127:19:127:27:0;;:34::38;:48::50;:34::51:1;;:45::46:0;:34::51:1;;:30::52;:19;:8::53;;;;;;128:20:128:29:0;;:42::43;;:32::50:1;:20;:8::51;;;;;;;;;129:19:129:24:0;;:27::28;;:19:::1;130:23:130:27:0;:29::48;;:50::64;;:16::65:1;;;;;;;;;;:8::102;131:26:131:30:0;:16::46:1;:50::64;;:8::84;132:26:132:30:0;:16::37:1;:41::51;:8::89;133:15:133:19:0;;:32::36;:22::49:1;:15;:8::50;;;;;;119:32:119:35;;::134:5;;:37;;:4;;;136:19:136:21:0;137:17:137:18;138:25:138:26;139:23:139:24;:4:150:5;:26:139:33;:36::44;;:26:::1;;;:57:150:5:0;140:20:140:22;:25::32;:35::36;:25:::1;:20;141:18:141:19:0;142:21:142:22;:8:144:9;:24:142:25;:29::34;;:24:::1;;;:41:144:9:0;143:18:143:39;:28::54:1;:68::73:0;;:76::77;:68:::1;:28::78;;:61::66:0;;:28::78:1;;:24::79;:18;:12::80;;;142:36:142:39;:41:144:9;;:8;;;145:17:145:23:0;;:40::43;:45::46;:26::47:1;:17;:8::48;;;;;;;;;;;;146:17:146:23:0;;:26::29;:17:::1;:8::30;;;;;;;;;147:12:147:15:0;:18::19;:12:::1;:21:149:9:0;148:12:148:48:1;;;;;;147:21:149:9;139:46:139:55;;::150:5;;:57;;:4;;;151:14:151:18:0;;:21::26;;:29::38:1;:21;:14;152:12:152:15:0;:19::25;;:12:::1;:4::60;154:18:154:27:0;;:31::45;:48::49;:31:::1;:18;:53::56:0;:63::69;;:80::82;:63::83:1;;:76::78:0;:63::83:1;;:59::84;:53;:18;:88::96:0;;:103::109;;:120::122;:103::123:1;;:116::118:0;:103::123:1;;:99::124;:88;:18;155:17:155:27;:30::37:0;;:17:::1;:54::64;:66::67:0;:40::68:1;:17;:71::75:0;:17:::1;:92::93:0;:95::96;:78::97:1;:17;:114::115:0;:117::118;:100::119:1;:17;156:24:156:32:0;;:34::35;:10::36:1;155:17;156:39::45:0;;:56::58;:39::59:1;;:52::54:0;:39::59:1;;155:17;157:24:157:44:0;;158:9:158:15;:8:162:5;159:15:159:25:1;:28::35:0;;:15:::1;:38::50;:15;:53::59:0;;:69::70;:53::71:1;;:66::67:0;:53::71:1;;:15;:74::80:0;;:91::93;:74::94:1;;:87::89:0;:74::94:1;;:15;:97::106:0;;:15:::1;160:28:160:31:0;;:33::34;:14::35:1;159:15;160:52::60:0;;:62::63;:38::64:1;159:15;160:67::73:0;;159:15:::1;160:76::82:0;;:93::99;;:::106:1;;:76::107;;:89::91:0;:76::107:1;;159:15;:8::108;;;161:22:161:43:0;;:8::44:1;158:17:162:5;163:23:163:24:0;:12::41:1;:4::98;164:23:164:24:0;:12::39:1;:43::51:0;;:54::58;:43:::1;:4::96;165:23:165:24:0;:12::37:1;:41::42:0;:4::80:1;166:23:166:24:0;:12::39:1;:4::82;169:19:169:20:0;:8::27:1;170:25:170:26:0;:15::33:1;:36::45:0;;:15:::1;:49::54:0;;:::58:1;:62::72;:48;:15;:75::95;:15;:98::122;:125::130:0;;:98:::1;:15;168:4:172:6;173:27:173:28:0;:30::49;;:51::65;;:67::71;;:12::72:1;;;;;;;;;;;;;;;;;;:4::112;104:17:175:1;;;;",
        "sourceTags": "206:208:fu;209:209:sc;210:213:lc;214:214:sc;259:259:fu;260:263:lc;264:264:sc;307:309:fu;310:310:sc;311:314:lc;315:315:sc",
        "logs": [],
        "requires": [
          {
            "ip": 6,
            "line": 105,
            "message": "not a master commitment"
          },
          {
            "ip": 16,
            "line": 106,
            "message": "the round is not open"
          },
          {
            "ip": 52,
            "line": 112,
            "message": "lifecycle transactions are version 2"
          },
          {
            "ip": 60,
            "line": 113,
            "message": "every gate and one sidecar per gate, and nothing else"
          },
          {
            "ip": 63,
            "line": 114,
            "message": "the lock makes the master and the pot sidecar"
          },
          {
            "ip": 84,
            "line": 121,
            "message": "input must be a gate of this category"
          },
          {
            "ip": 90,
            "line": 122,
            "message": "not a gate commitment"
          },
          {
            "ip": 100,
            "line": 123,
            "message": "gate belongs to another round"
          },
          {
            "ip": 112,
            "line": 124,
            "message": "gates must be in gate order"
          },
          {
            "ip": 127,
            "line": 125,
            "message": "a dollar gate with the master's outcomes"
          },
          {
            "ip": 132,
            "line": 126,
            "message": "fixed sequence"
          },
          {
            "ip": 185,
            "line": 130,
            "message": "inputs G+1..2G must be sidecars"
          },
          {
            "ip": 190,
            "line": 131,
            "message": "fixed sequence"
          },
          {
            "ip": 194,
            "line": 132,
            "message": "a sidecar carries the fixed dust"
          },
          {
            "ip": 327,
            "line": 152,
            "message": "the sidecars hold every stake"
          },
          {
            "ip": 456,
            "line": 163,
            "message": "the round moves to its next contract"
          },
          {
            "ip": 463,
            "line": 164,
            "message": "the master keeps its mutable NFT"
          },
          {
            "ip": 467,
            "line": 165,
            "message": "no fungible tokens on the master"
          },
          {
            "ip": 470,
            "line": 166,
            "message": "the lock record must be exact"
          },
          {
            "ip": 491,
            "line": 168,
            "message": "fixed lock fee"
          },
          {
            "ip": 504,
            "line": 173,
            "message": "the sidecar goes back to the sidecar contract"
          },
          {
            "ip": 509,
            "line": 173,
            "message": "a sidecar holds only the dollar token"
          },
          {
            "ip": 512,
            "line": 173,
            "message": "the sidecar's dollars must be exact"
          },
          {
            "ip": 515,
            "line": 173,
            "message": "a sidecar carries the fixed dust"
          },
          {
            "ip": 517,
            "line": 173,
            "message": "one pot sidecar holds every dollar"
          }
        ],
        "inlineRanges": "5:5:TAG_MASTER;15:15:STATE_OPEN;39:39:NIBBLE;51:51:TX_VERSION;89:89:TAG_GATE;121:121:CLASS_DOLLAR;122:122:NIBBLE;175:184:isSide;193:193:TOKEN_DUST;320:320:SIDE_SEED;359:359:TAG_MASTER;363:363:STATE_VOID;395:395:TAG_MASTER;399:399:STATE_LOCKED;481:481:TOKEN_DUST;484:484:DOLLAR_LOCK_FEE_BASE;486:486:DOLLAR_LOCK_FEE_PER_GATE;499:516:requireSideOut"
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
        "name": "CLASS_DOLLAR",
        "kind": "constant",
        "inputs": [],
        "bytecode": "53",
        "sourceMap": "11:28:11:29",
        "sourceFile": "dollar.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "isSide",
        "inputs": [
          {
            "name": "index",
            "type": "int"
          },
          {
            "name": "sideLockingBytecode",
            "type": "bytes"
          },
          {
            "name": "dollarCategory",
            "type": "bytes32"
          }
        ],
        "bytecode": "5279c77b877bce7b879a",
        "sourceMap": "31:21:31:26;;:11::43:1;:47::66:0;:11:::1;:80::85:0;:70::100:1;:104::118:0;:70:::1;:11",
        "sourceFile": "dollar.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "TOKEN_DUST",
        "kind": "constant",
        "inputs": [],
        "bytecode": "02e803",
        "sourceMap": "19:26:19:30",
        "sourceFile": "dollar.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "SIDE_SEED",
        "kind": "constant",
        "inputs": [],
        "bytecode": "51",
        "sourceMap": "17:25:17:26",
        "sourceFile": "dollar.cash",
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
        "name": "DOLLAR_LOCK_FEE_BASE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "02f00a",
        "sourceMap": "22:36:22:40",
        "sourceFile": "dollar.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "DOLLAR_LOCK_FEE_PER_GATE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "024c04",
        "sourceMap": "23:40:23:44",
        "sourceFile": "dollar.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "requireSideOut",
        "inputs": [
          {
            "name": "index",
            "type": "int"
          },
          {
            "name": "sideLockingBytecode",
            "type": "bytes"
          },
          {
            "name": "dollarCategory",
            "type": "bytes32"
          },
          {
            "name": "amount",
            "type": "int"
          }
        ],
        "bytecode": "5379cd537a885279d17b8878d39dcc02e8039d51",
        "sourceMap": "36:23:36:28;;:12::45:1;:49::68:0;;:4::119:1;37:23:37:28:0;;:12::43:1;:47::61:0;:4::104:1;38:23:38:28:0;:12::41:1;:4::92;39:12:39:35;:39::49;:4::87;40:11:40:15:0",
        "sourceFile": "dollar.cash",
        "logs": [],
        "requires": [
          {
            "ip": 5,
            "line": 36,
            "message": "the sidecar goes back to the sidecar contract"
          },
          {
            "ip": 10,
            "line": 37,
            "message": "a sidecar holds only the dollar token"
          },
          {
            "ip": 13,
            "line": 38,
            "message": "the sidecar's dollars must be exact"
          },
          {
            "ip": 16,
            "line": 39,
            "message": "a sidecar carries the fixed dust"
          }
        ],
        "inlineRanges": "15:15:TOKEN_DUST"
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
      "dollar.cash": "pragma cashscript ^0.14.0;\n\nimport \"./rules.cash\";\n\n// Dollar events: stakes and payouts in a dollar token (ParyonUSD on mainnet, 2 decimals) instead of satoshis.\n// A coin carries one token category, and gates and masters are NFTs of category K, so a round's dollars sit beside\n// them in sidecars (TokenSide.cash): one per gate, merged into one beside the master at the lock. Every number here is\n// mirrored in packages/sdk/src/round/dollar.ts; change both together.\n\n// The dollar stake class (high nibble of the gate's class byte) and its bounds, in token units (cents).\nint constant CLASS_DOLLAR = 3;\nint constant DOLLAR_MIN_STAKE = 10;\nint constant DOLLAR_MAX_STAKE = 5000;\nint constant DOLLAR_GATE_CAP = 100000;\n// A token output cannot be empty, so every sidecar is made holding this much; the lock counts the rest as pot, and\n// the seeds go back to the creator after the last payout (like gate dust).\nint constant SIDE_SEED = 1;\n// Satoshis every sidecar, and every dollar fee output, carries.\nint constant TOKEN_DUST = 1000;\n// A dollar lock spends a sidecar per gate as well as the gate: measured ~2,160 bytes plus ~920 per gate (2 gates:\n// ~4,000 bytes), and gold adds ~300; these fees keep every lock above 1 sat/byte.\nint constant DOLLAR_LOCK_FEE_BASE = 2800;\nint constant DOLLAR_LOCK_FEE_PER_GATE = 1100;\n// Settle and sweep spend the pot sidecar too.\nint constant SIDE_FEE = 300;\n// Dollar fees are paid from one cent (an output's dust is paid from the round's budget, not from the pot).\nint constant MIN_DOLLAR_FEE = 1;\n\n// Input `index` is a sidecar: at the sidecar contract, holding only the dollar token (no NFT).\nfunction isSide(int index, bytes sideLockingBytecode, bytes32 dollarCategory) returns (bool) {\n    return tx.inputs[index].lockingBytecode == sideLockingBytecode && tx.inputs[index].tokenCategory == dollarCategory;\n}\n\n// Output `index` is a sidecar holding exactly `amount` of the dollar token and TOKEN_DUST satoshis.\nfunction requireSideOut(int index, bytes sideLockingBytecode, bytes32 dollarCategory, int amount) returns (bool) {\n    require(tx.outputs[index].lockingBytecode == sideLockingBytecode, \"the sidecar goes back to the sidecar contract\");\n    require(tx.outputs[index].tokenCategory == dollarCategory, \"a sidecar holds only the dollar token\");\n    require(tx.outputs[index].tokenAmount == amount, \"the sidecar's dollars must be exact\");\n    require(tx.outputs[index].value == TOKEN_DUST, \"a sidecar carries the fixed dust\");\n    return true;\n}\n\n// No input from `from` on, and no output from `fromOutput` on, may sit at the sidecar contract. Right after a round\n// is made all its sidecars share the creating transaction, so without this an entry could pass a sibling sidecar as\n// \"funding\" and drain it, or leave a fake sidecar as \"change\" to swap in at the lock; either would freeze the round.\nfunction requireNoOtherSides(int from, int fromOutput, bytes sideLockingBytecode) returns (bool) {\n    for (int i = from; i < tx.inputs.length; i++) {\n        require(tx.inputs[i].lockingBytecode != sideLockingBytecode, \"no other sidecar may be spent here\");\n    }\n    for (int o = fromOutput; o < tx.outputs.length; o++) {\n        require(tx.outputs[o].lockingBytecode != sideLockingBytecode, \"no other sidecar may be made here\");\n    }\n    return true;\n}\n",
      "rules.cash": "pragma cashscript ^0.14.0;\n\n// Jōge's shared rules: NFT tags, round states, stake classes and fixed lifecycle fees.\n// Every number here is mirrored in packages/sdk/src/round/constants.ts; change both together.\n\n// First byte of every commitment of category K.\nbytes constant TAG_MASTER = 0x01;\nbytes constant TAG_GATE = 0x02;\nbytes constant TAG_TICKET = 0x03;\n\n// Master state byte (offset 5).\nbytes constant STATE_OPEN = 0x00;\nbytes constant STATE_LOCKED = 0x01;\nint constant STATE_SETTLED = 2;\nint constant STATE_VOID = 3;\n\n// Assets: index into the oracle table. Gold needs two feeds (USD/BCH and XAU/BCH).\nint constant ASSET_BTC = 0;\nint constant ASSET_ETH = 1;\nint constant ASSET_BCH = 2;\nint constant ASSET_GOLD = 3;\n// USD/BCH is in cents, XAU/BCH in ounces × 100000, so usd × 10^7 ÷ xau is dollars per ounce × 10^4.\nint constant GOLD_FACTOR = 10000000;\n\n// Modes (high nibble of the mode byte); outcomes are the low nibble.\nint constant MODE_UPDOWN = 0;\nint constant MODE_RANGES = 1;\nint constant NIBBLE = 16;\nint constant MAX_OUTCOMES = 6;\n\n// Stake classes (high nibble of the gate's class byte): satoshi bounds per entry and per gate.\nint constant CLASS_SHORT = 0;\nint constant CLASS_HOURLY = 1;\nint constant CLASS_EVENT = 2;\nint constant MIN_STAKE = 5000;\nint constant SHORT_MAX_STAKE = 500000;\nint constant HOURLY_MAX_STAKE = 5000000;\nint constant EVENT_MAX_STAKE = 25000000;\nint constant SHORT_GATE_CAP = 10000000;\nint constant HOURLY_GATE_CAP = 100000000;\nint constant EVENT_GATE_CAP = 500000000;\n\n// Fees and dust (satoshis). Lifecycle fees are fixed so every client builds the same bytes; calibrated on chipnet from\n// measured sizes (gold settle ~1,840 B, gold lock with one gate ~1,940 B, ~190 B per swept P2SH32 ticket) with headroom.\n// P2S tickets carry their ~112-byte script in the output: dust is 444 + 3 × ~188 B ≈ 1,008 sats, so 1,200.\nint constant TICKET_DUST = 1200;\n// Every gate is created holding exactly this; the lock counts anything beyond it as pot.\nint constant GATE_DUST = 1000;\n// An event entrant may leave before the lock; this share of the stake stays in the gate and joins the winners' pot.\nint constant EVENT_EXIT_FEE_BPS = 300;\n// P2PKH unlocking bytecode: 0x41 push, 64-byte Schnorr signature, then the sighash byte.\nbytes constant SIGNATURE_PUSH = 0x41;\nint constant SIGHASH_BYTE = 65;\nint constant MIN_FEE_OUTPUT = 1000;\nint constant LOCK_FEE_BASE = 1600;\nint constant LOCK_FEE_PER_GATE = 700;\n// An event gate's script is nearly twice a lane gate's (~690 bytes per merged gate, measured 2026-11-17: a 2-gate event\n// lock is ~3,090 bytes, which 1,600 + 2 × 700 could not pay), so events pay more per gate.\nint constant EVENT_LOCK_FEE_PER_GATE = 1100;\nint constant SETTLE_FEE = 2200;\nint constant SWEEP_FEE_BASE = 1000;\nint constant SWEEP_FEE_PER_TICKET = 250;\n// Each swept ticket costs ~20,000 operation-cost units; 32 padding bytes buy 25,600 (measured).\nint constant SWEEP_PAD_PER_TICKET = 32;\nint constant PROTOCOL_FEE_BPS = 200;\nint constant MAX_CREATOR_FEE_BPS = 300;\nint constant BPS = 10000;\n\n// Lifecycle transactions take every input at this sequence; the SDK default (0xfffffffe) would allow a second variant.\nint constant FINAL_SEQUENCE = 4294967295;\n// Timeout paths need a non-final sequence so the node enforces their locktime.\nint constant TIMEOUT_SEQUENCE = 4294967294;\nint constant TX_VERSION = 2;\n// After T_close, how long settlement has before anyone may void the round (MTP lags about an hour on mainnet).\nint constant SETTLE_TIMEOUT = 21600;\n\nfunction maxStake(int stakeClass) returns (int) {\n    require(stakeClass >= CLASS_SHORT && stakeClass <= CLASS_EVENT, \"unknown stake class\");\n    int limit = SHORT_MAX_STAKE;\n    if (stakeClass == CLASS_HOURLY) {\n        limit = HOURLY_MAX_STAKE;\n    } else if (stakeClass == CLASS_EVENT) {\n        limit = EVENT_MAX_STAKE;\n    }\n    return limit;\n}\n\nfunction gateCap(int stakeClass) returns (int) {\n    int cap = SHORT_GATE_CAP;\n    if (stakeClass == CLASS_HOURLY) {\n        cap = HOURLY_GATE_CAP;\n    } else if (stakeClass == CLASS_EVENT) {\n        cap = EVENT_GATE_CAP;\n    }\n    return cap;\n}\n\n// Gold in ten-thousandths of a US dollar per ounce, from the USD/BCH and XAU/BCH prices of the same minute.\nfunction goldPrice(int usdPerBch, int xauPerBch) returns (int) {\n    return usdPerBch * GOLD_FACTOR / xauPerBch;\n}\n",
      "oracle.cash": "pragma cashscript ^0.14.0;\n\n// General Protocols price messages, as verified by AnyHedge v0.12 (contract.cash l.73-94).\n// A message is 16 bytes of little-endian script numbers:\n//   [0,4) message timestamp · [4,8) message sequence · [8,12) data sequence · [12,16) price.\n// A data sequence <= 0 marks a metadata message, which is never a price.\n\nint constant MESSAGE_BYTES = 16;\nint constant DATASIG_BYTES = 64;\n\nfunction messageTimestamp(bytes message) returns (int) {\n    return int(message.slice(0, 4));\n}\n\nfunction dataSequence(bytes message) returns (int) {\n    return int(message.slice(8, 12));\n}\n\nfunction messagePrice(bytes message) returns (int) {\n    return int(message.slice(12, 16));\n}\n\n// Proves `message` is a signed price message from `oracle`. Fixed lengths keep every proof byte-identical.\nfunction requireSignedPrice(bytes message, datasig signature, pubkey oracle) {\n    require(message.length == MESSAGE_BYTES, \"oracle message must be 16 bytes\");\n    require(bytes(signature).length == DATASIG_BYTES, \"oracle signature must be 64 bytes\");\n    require(checkDataSig(signature, message, oracle), \"oracle signature does not verify\");\n    require(dataSequence(message) > 0, \"metadata message is not a price\");\n    require(messagePrice(message) > 0, \"oracle price must be positive\");\n}\n\n// Proves `first` is the oracle's first price message at or after `boundary`: the previous message (consecutive data\n// sequence) is strictly before the boundary. Returns the first message's data sequence.\nfunction firstAtOrAfter(\n    bytes previous,\n    datasig previousSignature,\n    bytes first,\n    datasig firstSignature,\n    pubkey oracle,\n    int boundary\n) returns (int) {\n    requireSignedPrice(previous, previousSignature, oracle);\n    requireSignedPrice(first, firstSignature, oracle);\n    require(dataSequence(first) == dataSequence(previous) + 1, \"oracle messages must be consecutive\");\n    require(messageTimestamp(previous) < boundary, \"previous message must be before the boundary\");\n    require(messageTimestamp(first) >= boundary, \"first message must be at or after the boundary\");\n    return dataSequence(first);\n}\n\n// Proves `message` is the oracle's price with data sequence `sequence` and returns its price.\nfunction priceAtSequence(bytes message, datasig signature, pubkey oracle, int sequence) returns (int) {\n    requireSignedPrice(message, signature, oracle);\n    require(dataSequence(message) == sequence, \"strike must be the message after the lock message\");\n    return messagePrice(message);\n}\n"
    },
    "inlineRanges": "46:46:ASSET_GOLD;52:52:ASSET_BTC;60:60:ASSET_ETH;141:141:ASSET_GOLD;228:228:SETTLE_TIMEOUT;237:237:TIMEOUT_SEQUENCE"
  },
  "compiler": {
    "name": "cashc",
    "version": "0.14.0",
    "options": {
      "enforceFunctionParameterTypes": true,
      "enforceLocktimeGuard": false
    }
  },
  "updatedAt": "2026-11-19T09:12:36.563Z"
} as const;
