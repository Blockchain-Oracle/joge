export default {
  "contractName": "DollarMasterLocked",
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
      "name": "settle",
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
      ]
    },
    {
      "name": "settleGold",
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
      ]
    },
    {
      "name": "timeoutVoid",
      "inputs": []
    }
  ],
  "bytecode": "5c7f75587f7781 OP_0 OP_DEFINE 607f755c7f7781 OP_1 OP_DEFINE 52798277609d78827701409d7c52797bbb76008a00a069518a00a069 OP_2 OP_DEFINE 537972528a78008a9d518a OP_3 OP_DEFINE 5579557a5379528a537972528a78008a5379008a8b9d7b547f7581789f6978547f7581a169008a OP_4 OP_DEFINE 00ce01207f7751885779517f7551885779567f75557f775188c2529dc3529d516fc77b877bce7b879a6951cb00cb9d57795e7f755c7f778176022c01a169587901227f755e7f77597901337f7501307f775879009c0000515e79557f75517f777e5351807e01ff7e0056807e0056807e54797e55797e537a645a7902c800950210279672777b5279519f630072777b685a79567995021027967b757d519f63007b757c68515e79557f75517f777e5251807e5d7951807e5b7954799453799456807e5c7956807e54797e55797e776800537900a063755168527900a0638b6800ce01207f7500cd5c7a8800d17c517e8800d3009d00d27b8800cc00c67b02e803959402980894022c01949d51577a577951d05579945479945379cd537a885279d17b8878d39dcc02e8039d516952527900a06352cd58798852d157798852d353799d52cc02e8039d7553687800a06376cd0376a91456797e0288ac7e8876d157798876d352799d76cc02e8039d8b68c49d6d6d6d6d6d7551 OP_5 OP_DEFINE c5009d00cb05ffffffff009d5679587f75577f77817660974f577959799e6352796096009c63755157795979a0637500686775000133555379959300657654798c9f766b6359795c795379545479959354937f75537954547995937f7781a2637b8b7b7b688b686c91666d6868007800a2635a79013855547995937f75013355547995937f778177685a797b7b5b7a01307f75012a7f7781597a597a597a597a558a77777777 OP_6 OP_DEFINE 7c0480969800957c96 OP_7 OP_DEFINE OP_9 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_0 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_DUP OP_3 OP_NUMNOTEQUAL OP_VERIFY OP_8 OP_ROLL OP_OVER OP_0 OP_NUMEQUAL OP_IF OP_7 OP_PICK OP_NIP OP_ELSE OP_OVER OP_1 OP_NUMEQUAL OP_IF OP_8 OP_PICK OP_NIP OP_ENDIF OP_ENDIF OP_2 OP_PICK 26 OP_SPLIT OP_DROP 22 OP_SPLIT OP_NIP OP_BIN2NUM OP_12 OP_ROLL OP_13 OP_ROLL OP_2OVER OP_1ADD OP_3 OP_INVOKE OP_13 OP_ROLL OP_14 OP_ROLL OP_15 OP_PICK 11 OP_ROLL OP_6 OP_ROLL OP_8 OP_PICK OP_12 OP_SPLIT OP_DROP OP_8 OP_SPLIT OP_NIP OP_BIN2NUM OP_4 OP_INVOKE OP_ROT OP_1ADD OP_GREATERTHAN OP_VERIFY OP_ROT OP_SWAP OP_11 OP_ROLL OP_1 OP_INVOKE OP_2ROT OP_SWAP OP_6 OP_ROLL OP_7 OP_ROLL OP_6 OP_INVOKE OP_VERIFY OP_2DROP OP_2DROP OP_DROP OP_1 OP_ELSE OP_9 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_0 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_3 OP_NUMEQUALVERIFY OP_DUP OP_12 OP_SPLIT OP_DROP OP_8 OP_SPLIT OP_NIP OP_BIN2NUM OP_OVER 26 OP_SPLIT OP_DROP 22 OP_SPLIT OP_NIP OP_BIN2NUM OP_2 OP_PICK 2a OP_SPLIT OP_DROP 26 OP_SPLIT OP_NIP OP_BIN2NUM OP_13 OP_ROLL OP_14 OP_ROLL OP_12 OP_PICK OP_4 OP_PICK OP_1ADD OP_3 OP_INVOKE OP_14 OP_ROLL OP_15 OP_ROLL OP_14 OP_PICK OP_4 OP_PICK OP_1ADD OP_3 OP_INVOKE OP_7 OP_INVOKE OP_14 OP_ROLL OP_15 OP_ROLL OP_16 OP_PICK 12 OP_ROLL OP_15 OP_ROLL OP_8 OP_PICK OP_4 OP_INVOKE OP_15 OP_ROLL OP_16 OP_ROLL 11 OP_PICK 13 OP_ROLL OP_16 OP_ROLL OP_9 OP_ROLL OP_4 OP_INVOKE OP_SWAP OP_4 OP_ROLL OP_1ADD OP_GREATERTHAN OP_SWAP OP_3 OP_ROLL OP_1ADD OP_GREATERTHAN OP_BOOLAND OP_VERIFY OP_9 OP_ROLL OP_1 OP_INVOKE OP_10 OP_ROLL OP_1 OP_INVOKE OP_7 OP_INVOKE OP_ROT OP_ROT OP_2SWAP OP_SWAP OP_2ROT OP_SWAP OP_6 OP_ROLL OP_6 OP_INVOKE OP_NIP OP_NIP OP_NIP OP_ELSE OP_9 OP_ROLL OP_2 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_12 OP_SPLIT OP_DROP OP_8 OP_SPLIT OP_NIP OP_BIN2NUM 6054 OP_ADD OP_DUP OP_CHECKLOCKTIMEVERIFY OP_DROP OP_TXLOCKTIME OP_NUMEQUALVERIFY OP_0 OP_INPUTSEQUENCENUMBER feffffff00 OP_NUMEQUALVERIFY OP_1NEGATE OP_0 OP_0 OP_2ROT OP_SWAP OP_6 OP_ROLL OP_7 OP_ROLL OP_5 OP_INVOKE OP_VERIFY OP_2DROP OP_2DROP OP_1 OP_ENDIF OP_ENDIF",
  "source": "pragma cashscript ^0.14.0;\n\nimport \"./dollar.cash\";\nimport \"./oracle.cash\";\n\n// A locked dollar event waiting for its close: MasterLocked, with the pot in the sidecar at input 1. Fees are paid in\n// dollars (each fee output carries TOKEN_DUST satoshis from the master).\n// A locked round waiting for its close. Commitment (written by MasterOpen's lock):\n//   [0] tag 0x01 · [1,5) round id · [5] state 0x01 · [6] asset · [7] mode << 4 | outcomes · [8,12) T_close\n//   [12,14) creator fee bps · [14,34) creator pubkey hash · [34,38) lock data sequence S (USD/BCH for gold)\n//   [38,42) XAU/BCH lock sequence (gold only) · [42,48) pot · [48,51) entrants · [51, 51 + 5·N) totals per outcome\n//   [51 + 5·N, …) range boundaries (4 bytes each, RANGES mode)\n//\n// Settle: anyone, with the strike (the oracle's message S + 1) and the canonical pair at T_close. It pays the fees,\n// freezes the winning outcome, the pot after fees and the winning total, and hands the round to the sweep contract.\ncontract DollarMasterLocked(\n    bytes32 category,\n    bytes sweepLockingBytecode,\n    bytes protocolLockingBytecode,\n    bytes sideLockingBytecode,\n    bytes32 dollarCategory,\n    pubkey oracleBtc,\n    pubkey oracleEth,\n    pubkey oracleBch,\n    pubkey oracleXau\n) {\n    function settle(\n        bytes strike,\n        datasig strikeSignature,\n        bytes previous,\n        datasig previousSignature,\n        bytes close,\n        datasig closeSignature\n    ) {\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be a round master of this category\");\n        bytes master = tx.inputs[0].nftCommitment;\n        int asset = int(master.slice(6, 7));\n        require(asset != ASSET_GOLD, \"gold settles with settleGold\");\n        pubkey oracle = oracleBch;\n        if (asset == ASSET_BTC) {\n            oracle = oracleBtc;\n        } else if (asset == ASSET_ETH) {\n            oracle = oracleEth;\n        }\n        int lockSequence = int(master.slice(34, 38));\n        int strikePrice = priceAtSequence(strike, strikeSignature, oracle, lockSequence + 1);\n        int closeSequence = firstAtOrAfter(previous, previousSignature, close, closeSignature, oracle, int(master.slice(8, 12)));\n        require(closeSequence > lockSequence + 1, \"the close must come after the strike\");\n        require(\n            payOutDollar(master, strikePrice, messagePrice(close), sweepLockingBytecode, protocolLockingBytecode, sideLockingBytecode, dollarCategory),\n            \"settlement must be exact\"\n        );\n    }\n\n    function settleGold(\n        bytes strikeUsd,\n        datasig strikeUsdSignature,\n        bytes strikeXau,\n        datasig strikeXauSignature,\n        bytes previousUsd,\n        datasig previousUsdSignature,\n        bytes closeUsd,\n        datasig closeUsdSignature,\n        bytes previousXau,\n        datasig previousXauSignature,\n        bytes closeXau,\n        datasig closeXauSignature\n    ) {\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be a round master of this category\");\n        bytes master = tx.inputs[0].nftCommitment;\n        require(int(master.slice(6, 7)) == ASSET_GOLD, \"only gold settles with two feeds\");\n        int closeTime = int(master.slice(8, 12));\n        int usdLock = int(master.slice(34, 38));\n        int xauLock = int(master.slice(38, 42));\n        int strikePrice = goldPrice(\n            priceAtSequence(strikeUsd, strikeUsdSignature, oracleBch, usdLock + 1),\n            priceAtSequence(strikeXau, strikeXauSignature, oracleXau, xauLock + 1)\n        );\n        int usdClose = firstAtOrAfter(previousUsd, previousUsdSignature, closeUsd, closeUsdSignature, oracleBch, closeTime);\n        int xauClose = firstAtOrAfter(previousXau, previousXauSignature, closeXau, closeXauSignature, oracleXau, closeTime);\n        require(usdClose > usdLock + 1 && xauClose > xauLock + 1, \"the close must come after the strike\");\n        int closePrice = goldPrice(messagePrice(closeUsd), messagePrice(closeXau));\n        require(\n            payOutDollar(master, strikePrice, closePrice, sweepLockingBytecode, protocolLockingBytecode, sideLockingBytecode, dollarCategory),\n            \"settlement must be exact\"\n        );\n    }\n\n    // If nobody can settle (an oracle gap breaks every pair), anyone voids the round once T_close + timeout has\n    // passed; everyone is refunded. The locktime is exactly the deadline so this transaction is unique too.\n    function timeoutVoid() {\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be a round master of this category\");\n        bytes master = tx.inputs[0].nftCommitment;\n        int deadline = int(master.slice(8, 12)) + SETTLE_TIMEOUT;\n        require(tx.time >= deadline, \"too early to void\");\n        require(tx.locktime == deadline, \"locktime is exactly the deadline\");\n        require(tx.inputs[0].sequenceNumber == TIMEOUT_SEQUENCE, \"fixed sequence that enforces the locktime\");\n        require(writeDollarSettlement(master, -1, 0, 0, sweepLockingBytecode, protocolLockingBytecode, sideLockingBytecode, dollarCategory), \"void must be exact\");\n    }\n}\n\n// Decides the outcome from the strike and close prices, then writes the settlement.\nfunction payOutDollar(\n    bytes master,\n    int strikePrice,\n    int closePrice,\n    bytes sweepLockingBytecode,\n    bytes protocolLockingBytecode,\n    bytes sideLockingBytecode,\n    bytes32 dollarCategory\n)\n    returns (bool)\n{\n    require(tx.locktime == 0, \"settle carries no locktime\");\n    require(tx.inputs[0].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n    int modeAndOutcomes = int(master.slice(7, 8));\n    int outcomes = modeAndOutcomes % NIBBLE;\n    int winner = -1;\n    // A tie, or a frozen feed (strike equals close), voids the round in either mode.\n    if (closePrice != strikePrice) {\n        if (modeAndOutcomes / NIBBLE == MODE_UPDOWN) {\n            winner = 1;\n            if (closePrice > strikePrice) {\n                winner = 0;\n            }\n        } else {\n            winner = 0;\n            int boundaries = 51 + 5 * outcomes;\n            for (int j = 0; j < outcomes - 1; j++) {\n                if (closePrice >= int(master.slice(boundaries + 4 * j, boundaries + 4 * j + 4))) {\n                    winner = winner + 1;\n                }\n            }\n        }\n    }\n    int winnerTotal = 0;\n    if (winner >= 0) {\n        winnerTotal = int(master.slice(51 + 5 * winner, 56 + 5 * winner));\n    }\n    return writeDollarSettlement(master, winner, winnerTotal, int(master.slice(42, 48)), sweepLockingBytecode, protocolLockingBytecode, sideLockingBytecode, dollarCategory);\n}\n\n// Writes the sweep record and pays the protocol and creator fees in dollars from the pot sidecar (each only if at least\n// MIN_DOLLAR_FEE; each fee output carries TOKEN_DUST satoshis from the master). No winning stake, or winner -1, means\n// void: no fees, every stake refunded. Outputs: the master, the pot sidecar, then the fees.\nfunction writeDollarSettlement(\n    bytes master,\n    int winner,\n    int winnerTotal,\n    int pot,\n    bytes sweepLockingBytecode,\n    bytes protocolLockingBytecode,\n    bytes sideLockingBytecode,\n    bytes32 dollarCategory\n) returns (bool) {\n    require(tx.inputs[0].tokenCategory.split(32)[1] == 0x01, \"input 0 must be a mutable master\");\n    require(master.slice(0, 1) == TAG_MASTER, \"not a master commitment\");\n    require(master.slice(5, 6) == STATE_LOCKED, \"the round is not locked\");\n    require(tx.version == TX_VERSION, \"lifecycle transactions are version 2\");\n    require(tx.inputs.length == 2, \"settlement spends only the master and its pot sidecar\");\n    require(isSide(1, sideLockingBytecode, dollarCategory), \"input 1 must be the pot sidecar\");\n    require(tx.inputs[1].sequenceNumber == tx.inputs[0].sequenceNumber, \"the sidecar's sequence matches the master's\");\n    int feeBps = int(master.slice(12, 14));\n    require(feeBps <= MAX_CREATOR_FEE_BPS, \"creator fee above the cap\");\n    bytes creatorPkh = master.slice(14, 34);\n    bytes entrants = master.slice(48, 51);\n\n    bool isVoid = winnerTotal == 0;\n    int protocolFee = 0;\n    int creatorFee = 0;\n    bytes next = TAG_MASTER + master.slice(1, 5) + toPaddedBytes(STATE_VOID, 1) + 0xff + toPaddedBytes(0, 6)\n        + toPaddedBytes(0, 6) + entrants + creatorPkh;\n    if (!isVoid) {\n        protocolFee = pot * PROTOCOL_FEE_BPS / BPS;\n        if (protocolFee < MIN_DOLLAR_FEE) {\n            protocolFee = 0;\n        }\n        creatorFee = pot * feeBps / BPS;\n        if (creatorFee < MIN_DOLLAR_FEE) {\n            creatorFee = 0;\n        }\n        next = TAG_MASTER + master.slice(1, 5) + toPaddedBytes(STATE_SETTLED, 1) + toPaddedBytes(winner, 1)\n            + toPaddedBytes(pot - protocolFee - creatorFee, 6) + toPaddedBytes(winnerTotal, 6) + entrants + creatorPkh;\n    }\n    int feeOutputs = 0;\n    if (protocolFee > 0) {\n        feeOutputs = 1;\n    }\n    if (creatorFee > 0) {\n        feeOutputs = feeOutputs + 1;\n    }\n    bytes category = tx.inputs[0].tokenCategory.split(32)[0];\n    require(tx.outputs[0].lockingBytecode == sweepLockingBytecode, \"the round moves to the sweep contract\");\n    require(tx.outputs[0].tokenCategory == category + 0x01, \"the master keeps its mutable NFT\");\n    require(tx.outputs[0].tokenAmount == 0, \"no fungible tokens on the master\");\n    require(tx.outputs[0].nftCommitment == next, \"the settlement record must be exact\");\n    require(\n        tx.outputs[0].value == tx.inputs[0].value - feeOutputs * TOKEN_DUST - SETTLE_FEE - SIDE_FEE,\n        \"fixed settle fee, and the fee outputs' dust\"\n    );\n    require(\n        requireSideOut(1, sideLockingBytecode, dollarCategory, tx.inputs[1].tokenAmount - protocolFee - creatorFee),\n        \"the fees leave the pot sidecar\"\n    );\n\n    int index = 2;\n    if (protocolFee > 0) {\n        require(tx.outputs[2].lockingBytecode == protocolLockingBytecode, \"protocol fee output\");\n        require(tx.outputs[2].tokenCategory == dollarCategory, \"the protocol fee is in dollars\");\n        require(tx.outputs[2].tokenAmount == protocolFee, \"protocol fee amount\");\n        require(tx.outputs[2].value == TOKEN_DUST, \"a fee output carries the fixed dust\");\n        index = 3;\n    }\n    if (creatorFee > 0) {\n        require(tx.outputs[index].lockingBytecode == new LockingBytecodeP2PKH(unsafe_bytes20(creatorPkh)), \"creator fee output\");\n        require(tx.outputs[index].tokenCategory == dollarCategory, \"the creator fee is in dollars\");\n        require(tx.outputs[index].tokenAmount == creatorFee, \"creator fee amount\");\n        require(tx.outputs[index].value == TOKEN_DUST, \"a fee output carries the fixed dust\");\n        index = index + 1;\n    }\n    require(tx.outputs.length == index, \"no other outputs\");\n    return true;\n}\n",
  "fingerprint": "eaf09a464e2c079268d0aeaa123459654029ee94de9de4964243885c7b48bf93",
  "debug": {
    "bytecode": "075c7f75587f7781008907607f755c7f778151891c52798277609d78827701409d7c52797bbb76008a00a069518a00a06952890b537972528a78008a9d518a5389275579557a5379528a537972528a78008a5379008a8b9d7b547f7581789f6978547f7581a169008a54894d780100ce01207f7751885779517f7551885779567f75557f775188c2529dc3529d516fc77b877bce7b879a6951cb00cb9d57795e7f755c7f778176022c01a169587901227f755e7f77597901337f7501307f775879009c0000515e79557f75517f777e5351807e01ff7e0056807e0056807e54797e55797e537a645a7902c800950210279672777b5279519f630072777b685a79567995021027967b757d519f63007b757c68515e79557f75517f777e5251807e5d7951807e5b7954799453799456807e5c7956807e54797e55797e776800537900a063755168527900a0638b6800ce01207f7500cd5c7a8800d17c517e8800d3009d00d27b8800cc00c67b02e803959402980894022c01949d51577a577951d05579945479945379cd537a885279d17b8878d39dcc02e8039d516952527900a06352cd58798852d157798852d353799d52cc02e8039d7553687800a06376cd0376a91456797e0288ac7e8876d157798876d352799d76cc02e8039d8b68c49d6d6d6d6d6d755155894ca6c5009d00cb05ffffffff009d5679587f75577f77817660974f577959799e6352796096009c63755157795979a0637500686775000133555379959300657654798c9f766b6359795c795379545479959354937f75537954547995937f7781a2637b8b7b7b688b686c91666d6868007800a2635a79013855547995937f75013355547995937f778177685a797b7b5b7a01307f75012a7f7781597a597a597a597a558a777777775689097c0480969800957c9657895979009c6300ce7c517e8800cf76577f75567f778176539e69587a78009c635779776778519c635879776868527901267f7501227f77815c7a5d7a708b538a5d7a5e7a5f7901117a567a58795c7f75587f7781548a7b8ba0697b7c5b7a518a717c567a577a568a696d6d7551675979519c6300ce7c517e8800cf76577f75567f7781539d765c7f75587f77817801267f7501227f77815279012a7f7501267f77815d7a5e7a5c7954798b538a5e7a5f7a5e7954798b538a578a5e7a5f7a607901127a5f7a5879548a5f7a607a01117901137a607a597a548a7c547a8ba07c537a8ba09a69597a518a5a7a518a578a7b7b727c717c567a568a77777767597a529d00ce7c517e8800cf765c7f75587f77810260549376b175c59d00cb05feffffff009d4f0000717c567a577a558a696d6d516868",
    "sourceMap": "15::17:1;;::::1;19::21::0;;::::1;24::30::0;;::::1;51::55::0;;::::1;34::48::0;;::::1;146::223::0;;::::1;103::141::0;;::::1;99::101::0;;::::1;27:4:53:5:0;;;;;35:26:35:27;:16::42:1;:46::54:0;:57::61;:46:::1;:8::114;36:33:36:34:0;:23::49:1;37:24:37:30:0;:40::41;:24::42:1;;:37::38:0;:24::42:1;;:20::43;38:16:38:21:0;:25::35:1;:16;:8::69;39:24:39:33:0;;40:12:40:17;:21::30:1;:12;:32:42:9:0;41:21:41:30;;:12::31:1;42:15:44:9:0;:19:42:24;:28::37:1;:19;:39:44:9:0;43:21:43:30;;:12::31:1;42:39:44:9;:15;45:31:45:37:0;;:48::50;:31::51:1;;:44::46:0;:31::51:1;;:27::52;46:42:46:48:0;;:50::65;;:67::87;:75::91:1;:26::92;;47:43:47:51:0;;:53::70;;:72::77;;:79::93;;:95::101;;:107::113;;:123::125;:107::126:1;;:120::121:0;:107::126:1;;:103::127;:28::128;;48:32:48:44:0;:::48:1;:16;:8::90;50:25:50:31:0;:33::44;:59::64;;:46::65:1;;:67::112:0;;:114::133;;:135::149;;:12::150:1;;49:8:52:10;34:6:53:5;;;;27:4;55::87::0;;;;;69:26:69:27;:16::42:1;:46::54:0;:57::61;:46:::1;:8::114;70:33:70:34:0;:23::49:1;71:20:71:26:0;:36::37;:20::38:1;;:33::34:0;:20::38:1;;:16::39;:43::53;:8::91;72:28:72:34:0;:44::46;:28::47:1;;:41::42:0;:28::47:1;;:24::48;73:26:73:32:0;:43::45;:26::46:1;;:39::41:0;:26::46:1;;:22::47;74:26:74:32:0;;:43::45;:26::46:1;;:39::41:0;:26::46:1;;:22::47;76:28:76:37:0;;:39::57;;:59::68;;:70::77;;:::81:1;:12::82;;77:28:77:37:0;;:39::57;;:59::68;;:70::77;;:::81:1;:12::82;;75:26:78:9;;79:38:79:49:0;;:51::71;;:73::81;;:83::100;;:102::111;;:113::122;;:23::123:1;;80:38:80:49:0;;:51::71;;:73::81;;:83::100;;:102::111;;:113::122;;:23::123:1;;81:16:81:24:0;:27::34;;:::38:1;:16;:42::50:0;:53::60;;:::64:1;:42;:16;:8::106;82:48:82:56:0;;:35::57:1;;:72::80:0;;:59::81:1;;:25::82;;84::84:31:0;:33::44;:46::78;;:80::124;;:126::140;;:12::141:1;83:8:86:10;68:6:87:5;;;55:4;91::99::0;;;;92:26:92:27;:16::42:1;:46::54:0;:57::61;:46:::1;:8::114;93:33:93:34:0;:23::49:1;94:27:94:33:0;:43::45;:27::46:1;;:40::41:0;:27::46:1;;:23::47;:50::64;:23;95:27:95:35:0;:8::58:1;;96:16:96:27:0;:8::77:1;97:26:97:27:0;:16::43:1;:47::63;:8::110;98:46:98:48:0;:50::51;:53::54;:56::101;;:103::122;;:124::138;;:16::139:1;;:8::163;91:27:99:5;;;16:0:100:1;",
    "logs": [],
    "requires": [
      {
        "ip": 43,
        "line": 35,
        "message": "input 0 must be a round master of this category"
      },
      {
        "ip": 57,
        "line": 38,
        "message": "gold settles with settleGold"
      },
      {
        "ip": 118,
        "line": 48,
        "message": "the close must come after the strike"
      },
      {
        "ip": 133,
        "line": 49,
        "message": "settlement must be exact"
      },
      {
        "ip": 149,
        "line": 69,
        "message": "input 0 must be a round master of this category"
      },
      {
        "ip": 161,
        "line": 71,
        "message": "only gold settles with two feeds"
      },
      {
        "ip": 250,
        "line": 81,
        "message": "the close must come after the strike"
      },
      {
        "ip": 271,
        "line": 83,
        "message": "settlement must be exact"
      },
      {
        "ip": 284,
        "line": 92,
        "message": "input 0 must be a round master of this category"
      },
      {
        "ip": 298,
        "line": 95,
        "message": "too early to void"
      },
      {
        "ip": 301,
        "line": 96,
        "message": "locktime is exactly the deadline"
      },
      {
        "ip": 305,
        "line": 97,
        "message": "fixed sequence that enforces the locktime"
      },
      {
        "ip": 317,
        "line": 98,
        "message": "void must be exact"
      }
    ],
    "sourceTags": "262:264:sc",
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
        "id": 2,
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
        "bytecode": "52798277609d78827701409d7c52797bbb76008a00a069518a00a069",
        "sourceMap": "25:12:25:19;;:::26:1;;:30::43;:4::80;26:18:26:27:0;:12::35:1;;:39::52;:4::91;27:25:27:34:0;:36::43;;:45::51;:4::90:1;28:25:28:32:0;:12::33:1;;:36::37:0;:12:::1;:4::74;29:12:29:33;;:36::37:0;:12:::1;:4::72",
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
            "ip": 26,
            "line": 29,
            "message": "oracle price must be positive"
          }
        ],
        "inlineRanges": "4:4:MESSAGE_BYTES;9:9:DATASIG_BYTES"
      },
      {
        "id": 3,
        "name": "priceAtSequence",
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
          },
          {
            "name": "sequence",
            "type": "int"
          }
        ],
        "bytecode": "537972528a78008a9d518a",
        "sourceMap": "52:23:52:30;;:32::49;:4::50:1;;53:25:53:32:0;:12::33:1;;:4::100;54:11:54:32;",
        "sourceFile": "oracle.cash",
        "logs": [],
        "requires": [
          {
            "ip": 8,
            "line": 53,
            "message": "strike must be the message after the lock message"
          }
        ]
      },
      {
        "id": 4,
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
        "bytecode": "5579557a5379528a537972528a78008a5379008a8b9d7b547f7581789f6978547f7581a169008a",
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
        "id": 5,
        "name": "writeDollarSettlement",
        "inputs": [
          {
            "name": "master",
            "type": "bytes"
          },
          {
            "name": "winner",
            "type": "int"
          },
          {
            "name": "winnerTotal",
            "type": "int"
          },
          {
            "name": "pot",
            "type": "int"
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
            "name": "sideLockingBytecode",
            "type": "bytes"
          },
          {
            "name": "dollarCategory",
            "type": "bytes32"
          }
        ],
        "bytecode": "00ce01207f7751885779517f7551885779567f75557f775188c2529dc3529d516fc77b877bce7b879a6951cb00cb9d57795e7f755c7f778176022c01a169587901227f755e7f77597901337f7501307f775879009c0000515e79557f75517f777e5351807e01ff7e0056807e0056807e54797e55797e537a645a7902c800950210279672777b5279519f630072777b685a79567995021027967b757d519f63007b757c68515e79557f75517f777e5251807e5d7951807e5b7954799453799456807e5c7956807e54797e55797e776800537900a063755168527900a0638b6800ce01207f7500cd5c7a8800d17c517e8800d3009d00d27b8800cc00c67b02e803959402980894022c01949d51577a577951d05579945479945379cd537a885279d17b8878d39dcc02e8039d516952527900a06352cd58798852d157798852d353799d52cc02e8039d7553687800a06376cd0376a91456797e0288ac7e8876d157798876d352799d76cc02e8039d8b68c49d6d6d6d6d6d7551",
        "sourceMap": "156:22:156:23;:12::38:1;:45::47:0;:12::48:1;:::51;:55::59:0;:4::97:1;157:12:157:18:0;;:28::29;:12::30:1;;:34::44;:4::73;158:12:158:18:0;;:28::29;:12::30:1;;:25::26:0;:12::30:1;;:34::46;:4::75;159:12:159:22:0;:26::36:1;:4::78;160:12:160:28:0;:32::33;:4::92:1;161:19:161:20:0;:12::58:1;;;;;;;;;:4::95;162:22:162:23:0;:12::39:1;:53::54:0;:43::70:1;:4::119;163:21:163:27:0;;:38::40;:21::41:1;;:34::36:0;:21::41:1;;:17::42;164:12:164:18:0;:22::41:1;:12;:4::72;165:23:165:29:0;;:40::42;:23::43:1;;:36::38:0;:23::43:1;;166:21:166:27:0;;:38::40;:21::41:1;;:34::36:0;:21::41:1;;168:18:168:29:0;;:33::34;:18:::1;169:22:169:23:0;170:21:170:22;171:17:171:27:1;:30::36:0;;:46::47;:30::48:1;;:43::44:0;:30::48:1;;:17;:65::75;:77::78:0;:51::79:1;:17;:82::86:0;:17:::1;:103::104:0;:106::107;:89::108:1;:17;172:24:172:25:0;:27::28;:10::29:1;171:17;172:32::40:0;;171:17:::1;172:43::53:0;;171:17:::1;173:9:173:15:0;;:8:184:5;174:22:174:25;;:28::44:1;:22;:47::50;:22;:8::51;;;175:12:175:23:0;;:26::40:1;:12;:42:177:9:0;176:26:176:27;:12::28:1;;;175:42:177:9;178:21:178:24:0;;:27::33;;:21:::1;:36::39;:21;:8::40;;::179:22:0;179:25::39:1;:12;:41:181:9:0;180:25:180:26;:12::27:1;;;179:41:181:9;182:15:182:25;:28::34:0;;:44::45;:28::46:1;;:41::42:0;:28::46:1;;:15;:63::76;:78::79:0;:49::80:1;:15;:97::103:0;;:105::106;:83::107:1;:15;183:28:183:31:0;;:34::45;;:28:::1;:48::58:0;;:28:::1;:60::61:0;:14::62:1;182:15;183:79::90:0;;:92::93;:65::94:1;182:15;183:97::105:0;;182:15:::1;183:108::118:0;;182:15:::1;:8::119;173:17:184:5;185:21:185:22:0;186:8:186:19;;:22::23;:8:::1;:25:188:5:0;187:8:187:23:1;;186:25:188:5;189:8:189:18:0;;:21::22;:8:::1;:24:191:5:0;190:8:190:36:1;189:24:191:5;192:31:192:32:0;:21::47:1;:54::56:0;:21::57:1;:::60;193:23:193:24:0;:12::41:1;:45::65:0;;:4::108:1;194:23:194:24:0;:12::39:1;:43::51:0;:54::58;:43:::1;:4::96;195:23:195:24:0;:12::37:1;:41::42:0;:4::80:1;196:23:196:24:0;:12::39:1;:43::47:0;:4::88:1;198:19:198:20:0;:8::27:1;:41::42:0;:31::49:1;:52::62:0;:65::75:1;:52;:31;:78::88;:31;:91::99;:31;197:4:200:6;202:23:202:24:0;:26::45;;:47::61;;:73::74;:63::87:1;:90::101:0;;:63:::1;:104::114:0;;:63:::1;:8::115;;;;;;;;;;;;;;;;;;201:4:204:6;206:16:206:17:0;207:8:207:19;;:22::23;:8:::1;:25:213:5:0;208:27:208:28;:16::45:1;:49::72:0;;:8::97:1;209:27:209:28:0;:16::43:1;:47::61:0;;:8::97:1;210:27:210:28:0;:16::41:1;:45::56:0;;:8::81:1;211:27:211:28:0;:16::35:1;:39::49;:8::90;212::212:18;;207:25:213:5;214:8:214:18:0;:21::22;:8:::1;:24:220:5:0;215:27:215:32;:16::49:1;:53::105:0;:93::103;;:53::105:1;;;:8::129;216:27:216:32:0;:16::47:1;:51::65:0;;:8::100:1;217:27:217:32:0;:16::45:1;:49::59:0;;:8::83:1;218:27:218:32:0;:16::39:1;:43::53;:8::94;219::219:26;214:24:220:5;221:12:221:29:0;:4::60:1;155:17:223:1;;;;;;",
        "logs": [],
        "requires": [
          {
            "ip": 6,
            "line": 156,
            "message": "input 0 must be a mutable master"
          },
          {
            "ip": 13,
            "line": 157,
            "message": "not a master commitment"
          },
          {
            "ip": 23,
            "line": 158,
            "message": "the round is not locked"
          },
          {
            "ip": 26,
            "line": 159,
            "message": "lifecycle transactions are version 2"
          },
          {
            "ip": 29,
            "line": 160,
            "message": "settlement spends only the master and its pot sidecar"
          },
          {
            "ip": 40,
            "line": 161,
            "message": "input 1 must be the pot sidecar"
          },
          {
            "ip": 45,
            "line": 162,
            "message": "the sidecar's sequence matches the master's"
          },
          {
            "ip": 58,
            "line": 164,
            "message": "creator fee above the cap"
          },
          {
            "ip": 219,
            "line": 193,
            "message": "the round moves to the sweep contract"
          },
          {
            "ip": 225,
            "line": 194,
            "message": "the master keeps its mutable NFT"
          },
          {
            "ip": 229,
            "line": 195,
            "message": "no fungible tokens on the master"
          },
          {
            "ip": 233,
            "line": 196,
            "message": "the settlement record must be exact"
          },
          {
            "ip": 246,
            "line": 197,
            "message": "fixed settle fee, and the fee outputs' dust"
          },
          {
            "ip": 265,
            "line": 202,
            "message": "the sidecar goes back to the sidecar contract"
          },
          {
            "ip": 270,
            "line": 202,
            "message": "a sidecar holds only the dollar token"
          },
          {
            "ip": 273,
            "line": 202,
            "message": "the sidecar's dollars must be exact"
          },
          {
            "ip": 276,
            "line": 202,
            "message": "a sidecar carries the fixed dust"
          },
          {
            "ip": 278,
            "line": 201,
            "message": "the fees leave the pot sidecar"
          },
          {
            "ip": 289,
            "line": 208,
            "message": "protocol fee output"
          },
          {
            "ip": 294,
            "line": 209,
            "message": "the protocol fee is in dollars"
          },
          {
            "ip": 299,
            "line": 210,
            "message": "protocol fee amount"
          },
          {
            "ip": 303,
            "line": 211,
            "message": "a fee output carries the fixed dust"
          },
          {
            "ip": 319,
            "line": 215,
            "message": "creator fee output"
          },
          {
            "ip": 324,
            "line": 216,
            "message": "the creator fee is in dollars"
          },
          {
            "ip": 329,
            "line": 217,
            "message": "creator fee amount"
          },
          {
            "ip": 333,
            "line": 218,
            "message": "a fee output carries the fixed dust"
          },
          {
            "ip": 337,
            "line": 221,
            "message": "no other outputs"
          }
        ],
        "inlineRanges": "12:12:TAG_MASTER;22:22:STATE_LOCKED;25:25:TX_VERSION;31:39:isSide;56:56:MAX_CREATOR_FEE_BPS;81:81:TAG_MASTER;91:91:STATE_VOID;116:116:PROTOCOL_FEE_BPS;118:118:BPS;125:125:MIN_DOLLAR_FEE;138:138:BPS;143:143:MIN_DOLLAR_FEE;151:151:TAG_MASTER;161:161:STATE_SETTLED;239:239:TOKEN_DUST;242:242:SETTLE_FEE;244:244:SIDE_FEE;260:277:requireSideOut;302:302:TOKEN_DUST;332:332:TOKEN_DUST"
      },
      {
        "id": 6,
        "name": "payOutDollar",
        "inputs": [
          {
            "name": "master",
            "type": "bytes"
          },
          {
            "name": "strikePrice",
            "type": "int"
          },
          {
            "name": "closePrice",
            "type": "int"
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
            "name": "sideLockingBytecode",
            "type": "bytes"
          },
          {
            "name": "dollarCategory",
            "type": "bytes32"
          }
        ],
        "bytecode": "c5009d00cb05ffffffff009d5679587f75577f77817660974f577959799e6352796096009c63755157795979a0637500686775000133555379959300657654798c9f766b6359795c795379545479959354937f75537954547995937f7781a2637b8b7b7b688b686c91666d6868007800a2635a79013855547995937f75013355547995937f778177685a797b7b5b7a01307f75012a7f7781597a597a597a597a558a77777777",
        "sourceMap": "114:12:114:23;:27::28;:4::60:1;115:22:115:23:0;:12::39:1;:43::57;:4::77;116:30:116:36:0;;:46::47;:30::48:1;;:43::44:0;:30::48:1;;:26::49;117:19:117:34:0;:37::43:1;:19;118:17:118:19:0;120:8:120:18;;:22::33;;:8:::1;:35:135:5:0;121:12:121:27;;:30::36:1;:12;:40::51;:12;:53:126:9:0;122:12:122:23:1;;123:16:123:26:0;;:29::40;;:16:::1;:42:125:13:0;124:16:124:27:1;;123:42:125:13;126:15:134:9:0;127:12:127:23:1;;128:29:128:31:0;:34::35;:38::46;;:34:::1;:29;129:25:129:26:0;:12:133:13;:28:129:29;:32::40;;:::44:1;:28;;;:51:133:13:0;130:20:130:30;;:38::44;;:71::81;;:84::85;:88::89;;:84:::1;:71;:92::93:0;:71:::1;:38::94;;:51::61:0;;:64::65;:68::69;;:64:::1;:51;:38::94;;:34::95;:20;:97:132:17:0;131:20:131:40:1;;;;130:97:132:17;129:46:129:49;:51:133:13;;:12;;126:15:134:9;;120:35:135:5;136:22:136:23:0;137:8:137:14;:18::19;:8:::1;:21:139:5:0;138:26:138:32;;:56::58;:61::62;:65::71;;:61:::1;:56;:26::72;;:39::41:0;:44::45;:48::54;;:44:::1;:39;:26::72;;:22::73;:8::74;137:21:139:5;140:33:140:39:0;;:41::47;:49::60;:66::72;;:83::85;:66::86:1;;:79::81:0;:66::86:1;;:62::87;:89::109:0;;:111::134;;:136::155;;:157::171;;:11::172:1;;113:0:141:1;;;",
        "sourceTags": "95:95:fu;96:99:lc;100:100:sc;152:155:sc",
        "logs": [],
        "requires": [
          {
            "ip": 2,
            "line": 114,
            "message": "settle carries no locktime"
          },
          {
            "ip": 6,
            "line": 115,
            "message": "fixed sequence"
          }
        ],
        "inlineRanges": "5:5:FINAL_SEQUENCE;17:17:NIBBLE;28:28:NIBBLE;30:30:MODE_UPDOWN"
      },
      {
        "id": 7,
        "name": "goldPrice",
        "inputs": [
          {
            "name": "usdPerBch",
            "type": "int"
          },
          {
            "name": "xauPerBch",
            "type": "int"
          }
        ],
        "bytecode": "7c0480969800957c96",
        "sourceMap": "100:11:100:20;:23::34:1;:11;:37::46:0;:11:::1",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": [],
        "inlineRanges": "1:1:GOLD_FACTOR"
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
        "name": "MODE_UPDOWN",
        "kind": "constant",
        "inputs": [],
        "bytecode": "00",
        "sourceMap": "26:27:26:28",
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
        "name": "MAX_CREATOR_FEE_BPS",
        "kind": "constant",
        "inputs": [],
        "bytecode": "022c01",
        "sourceMap": "66:35:66:38",
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
        "name": "PROTOCOL_FEE_BPS",
        "kind": "constant",
        "inputs": [],
        "bytecode": "02c800",
        "sourceMap": "65:32:65:35",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "BPS",
        "kind": "constant",
        "inputs": [],
        "bytecode": "021027",
        "sourceMap": "67:19:67:24",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "MIN_DOLLAR_FEE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "51",
        "sourceMap": "27:30:27:31",
        "sourceFile": "dollar.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "STATE_SETTLED",
        "kind": "constant",
        "inputs": [],
        "bytecode": "52",
        "sourceMap": "14:29:14:30",
        "sourceFile": "rules.cash",
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
        "name": "SETTLE_FEE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "029808",
        "sourceMap": "60:26:60:30",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "SIDE_FEE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "022c01",
        "sourceMap": "25:24:25:27",
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
        "name": "GOLD_FACTOR",
        "kind": "constant",
        "inputs": [],
        "bytecode": "0480969800",
        "sourceMap": "23:27:23:35",
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
      "dollar.cash": "pragma cashscript ^0.14.0;\n\nimport \"./rules.cash\";\n\n// Dollar events (F11): stakes and payouts in a dollar token (ParyonUSD on mainnet, 2 decimals) instead of satoshis.\n// A coin carries one token category, and gates and masters are NFTs of category K, so a round's dollars sit beside\n// them in sidecars (TokenSide.cash): one per gate, merged into one beside the master at the lock. Every number here is\n// mirrored in packages/sdk/src/round/dollar.ts; change both together.\n\n// The dollar stake class (high nibble of the gate's class byte) and its bounds, in token units (cents).\nint constant CLASS_DOLLAR = 3;\nint constant DOLLAR_MIN_STAKE = 10;\nint constant DOLLAR_MAX_STAKE = 5000;\nint constant DOLLAR_GATE_CAP = 100000;\n// A token output cannot be empty, so every sidecar is made holding this much; the lock counts the rest as pot, and\n// the seeds go back to the creator after the last payout (like gate dust).\nint constant SIDE_SEED = 1;\n// Satoshis every sidecar, and every dollar fee output, carries.\nint constant TOKEN_DUST = 1000;\n// A dollar lock spends a sidecar per gate as well as the gate: measured ~2,160 bytes plus ~920 per gate (2 gates:\n// ~4,000 bytes), and gold adds ~300; these fees keep every lock above 1 sat/byte.\nint constant DOLLAR_LOCK_FEE_BASE = 2800;\nint constant DOLLAR_LOCK_FEE_PER_GATE = 1100;\n// Settle and sweep spend the pot sidecar too.\nint constant SIDE_FEE = 300;\n// Dollar fees are paid from one cent (an output's dust is paid from the round's budget, not from the pot).\nint constant MIN_DOLLAR_FEE = 1;\n\n// Input `index` is a sidecar: at the sidecar contract, holding only the dollar token (no NFT).\nfunction isSide(int index, bytes sideLockingBytecode, bytes32 dollarCategory) returns (bool) {\n    return tx.inputs[index].lockingBytecode == sideLockingBytecode && tx.inputs[index].tokenCategory == dollarCategory;\n}\n\n// Output `index` is a sidecar holding exactly `amount` of the dollar token and TOKEN_DUST satoshis.\nfunction requireSideOut(int index, bytes sideLockingBytecode, bytes32 dollarCategory, int amount) returns (bool) {\n    require(tx.outputs[index].lockingBytecode == sideLockingBytecode, \"the sidecar goes back to the sidecar contract\");\n    require(tx.outputs[index].tokenCategory == dollarCategory, \"a sidecar holds only the dollar token\");\n    require(tx.outputs[index].tokenAmount == amount, \"the sidecar's dollars must be exact\");\n    require(tx.outputs[index].value == TOKEN_DUST, \"a sidecar carries the fixed dust\");\n    return true;\n}\n\n// No input from `from` on, and no output from `fromOutput` on, may sit at the sidecar contract. Right after a round\n// is made all its sidecars share the creating transaction, so without this an entry could pass a sibling sidecar as\n// \"funding\" and drain it, or leave a fake sidecar as \"change\" to swap in at the lock; either would freeze the round.\nfunction requireNoOtherSides(int from, int fromOutput, bytes sideLockingBytecode) returns (bool) {\n    for (int i = from; i < tx.inputs.length; i++) {\n        require(tx.inputs[i].lockingBytecode != sideLockingBytecode, \"no other sidecar may be spent here\");\n    }\n    for (int o = fromOutput; o < tx.outputs.length; o++) {\n        require(tx.outputs[o].lockingBytecode != sideLockingBytecode, \"no other sidecar may be made here\");\n    }\n    return true;\n}\n",
      "rules.cash": "pragma cashscript ^0.14.0;\n\n// Jōge's shared rules: NFT tags, round states, stake classes and fixed lifecycle fees.\n// Every number here is mirrored in packages/sdk/src/round/constants.ts; change both together.\n\n// First byte of every commitment of category K.\nbytes constant TAG_MASTER = 0x01;\nbytes constant TAG_GATE = 0x02;\nbytes constant TAG_TICKET = 0x03;\n\n// Master state byte (offset 5).\nbytes constant STATE_OPEN = 0x00;\nbytes constant STATE_LOCKED = 0x01;\nint constant STATE_SETTLED = 2;\nint constant STATE_VOID = 3;\n\n// Assets: index into the oracle table. Gold needs two feeds (USD/BCH and XAU/BCH).\nint constant ASSET_BTC = 0;\nint constant ASSET_ETH = 1;\nint constant ASSET_BCH = 2;\nint constant ASSET_GOLD = 3;\n// USD/BCH is in cents, XAU/BCH in ounces × 100000, so usd × 10^7 ÷ xau is dollars per ounce × 10^4.\nint constant GOLD_FACTOR = 10000000;\n\n// Modes (high nibble of the mode byte); outcomes are the low nibble.\nint constant MODE_UPDOWN = 0;\nint constant MODE_RANGES = 1;\nint constant NIBBLE = 16;\nint constant MAX_OUTCOMES = 6;\n\n// Stake classes (high nibble of the gate's class byte): satoshi bounds per entry and per gate.\nint constant CLASS_SHORT = 0;\nint constant CLASS_HOURLY = 1;\nint constant CLASS_EVENT = 2;\nint constant MIN_STAKE = 5000;\nint constant SHORT_MAX_STAKE = 500000;\nint constant HOURLY_MAX_STAKE = 5000000;\nint constant EVENT_MAX_STAKE = 25000000;\nint constant SHORT_GATE_CAP = 10000000;\nint constant HOURLY_GATE_CAP = 100000000;\nint constant EVENT_GATE_CAP = 500000000;\n\n// Fees and dust (satoshis). Lifecycle fees are fixed so every client builds the same bytes; calibrated in S00 from\n// measured sizes (gold settle ~1,840 B, gold lock with one gate ~1,940 B, ~190 B per swept P2SH32 ticket) with headroom.\n// P2S tickets carry their ~112-byte script in the output: dust is 444 + 3 × ~188 B ≈ 1,008 sats, so 1,200.\nint constant TICKET_DUST = 1200;\n// Every gate is created holding exactly this; the lock counts anything beyond it as pot.\nint constant GATE_DUST = 1000;\n// An event entrant may leave before the lock; this share of the stake stays in the gate and joins the winners' pot.\nint constant EVENT_EXIT_FEE_BPS = 300;\n// P2PKH unlocking bytecode: 0x41 push, 64-byte Schnorr signature, then the sighash byte.\nbytes constant SIGNATURE_PUSH = 0x41;\nint constant SIGHASH_BYTE = 65;\nint constant MIN_FEE_OUTPUT = 1000;\nint constant LOCK_FEE_BASE = 1600;\nint constant LOCK_FEE_PER_GATE = 700;\n// An event gate's script is nearly twice a lane gate's (~690 bytes per merged gate, measured 2026-11-17: a 2-gate event\n// lock is ~3,090 bytes, which 1,600 + 2 × 700 could not pay), so events pay more per gate.\nint constant EVENT_LOCK_FEE_PER_GATE = 1100;\nint constant SETTLE_FEE = 2200;\nint constant SWEEP_FEE_BASE = 1000;\nint constant SWEEP_FEE_PER_TICKET = 250;\n// Each swept ticket costs ~20,000 operation-cost units; 32 padding bytes buy 25,600 (measured in S00).\nint constant SWEEP_PAD_PER_TICKET = 32;\nint constant PROTOCOL_FEE_BPS = 200;\nint constant MAX_CREATOR_FEE_BPS = 300;\nint constant BPS = 10000;\n\n// Lifecycle transactions take every input at this sequence; the SDK default (0xfffffffe) would allow a second variant.\nint constant FINAL_SEQUENCE = 4294967295;\n// Timeout paths need a non-final sequence so the node enforces their locktime.\nint constant TIMEOUT_SEQUENCE = 4294967294;\nint constant TX_VERSION = 2;\n// After T_close, how long settlement has before anyone may void the round (MTP lags about an hour on mainnet).\nint constant SETTLE_TIMEOUT = 21600;\n\nfunction maxStake(int stakeClass) returns (int) {\n    require(stakeClass >= CLASS_SHORT && stakeClass <= CLASS_EVENT, \"unknown stake class\");\n    int limit = SHORT_MAX_STAKE;\n    if (stakeClass == CLASS_HOURLY) {\n        limit = HOURLY_MAX_STAKE;\n    } else if (stakeClass == CLASS_EVENT) {\n        limit = EVENT_MAX_STAKE;\n    }\n    return limit;\n}\n\nfunction gateCap(int stakeClass) returns (int) {\n    int cap = SHORT_GATE_CAP;\n    if (stakeClass == CLASS_HOURLY) {\n        cap = HOURLY_GATE_CAP;\n    } else if (stakeClass == CLASS_EVENT) {\n        cap = EVENT_GATE_CAP;\n    }\n    return cap;\n}\n\n// Gold in ten-thousandths of a US dollar per ounce, from the USD/BCH and XAU/BCH prices of the same minute.\nfunction goldPrice(int usdPerBch, int xauPerBch) returns (int) {\n    return usdPerBch * GOLD_FACTOR / xauPerBch;\n}\n",
      "oracle.cash": "pragma cashscript ^0.14.0;\n\n// General Protocols price messages, as verified by AnyHedge v0.12 (contract.cash l.73-94).\n// A message is 16 bytes of little-endian script numbers:\n//   [0,4) message timestamp · [4,8) message sequence · [8,12) data sequence · [12,16) price.\n// A data sequence <= 0 marks a metadata message, which is never a price.\n\nint constant MESSAGE_BYTES = 16;\nint constant DATASIG_BYTES = 64;\n\nfunction messageTimestamp(bytes message) returns (int) {\n    return int(message.slice(0, 4));\n}\n\nfunction dataSequence(bytes message) returns (int) {\n    return int(message.slice(8, 12));\n}\n\nfunction messagePrice(bytes message) returns (int) {\n    return int(message.slice(12, 16));\n}\n\n// Proves `message` is a signed price message from `oracle`. Fixed lengths keep every proof byte-identical.\nfunction requireSignedPrice(bytes message, datasig signature, pubkey oracle) {\n    require(message.length == MESSAGE_BYTES, \"oracle message must be 16 bytes\");\n    require(bytes(signature).length == DATASIG_BYTES, \"oracle signature must be 64 bytes\");\n    require(checkDataSig(signature, message, oracle), \"oracle signature does not verify\");\n    require(dataSequence(message) > 0, \"metadata message is not a price\");\n    require(messagePrice(message) > 0, \"oracle price must be positive\");\n}\n\n// Proves `first` is the oracle's first price message at or after `boundary`: the previous message (consecutive data\n// sequence) is strictly before the boundary. Returns the first message's data sequence.\nfunction firstAtOrAfter(\n    bytes previous,\n    datasig previousSignature,\n    bytes first,\n    datasig firstSignature,\n    pubkey oracle,\n    int boundary\n) returns (int) {\n    requireSignedPrice(previous, previousSignature, oracle);\n    requireSignedPrice(first, firstSignature, oracle);\n    require(dataSequence(first) == dataSequence(previous) + 1, \"oracle messages must be consecutive\");\n    require(messageTimestamp(previous) < boundary, \"previous message must be before the boundary\");\n    require(messageTimestamp(first) >= boundary, \"first message must be at or after the boundary\");\n    return dataSequence(first);\n}\n\n// Proves `message` is the oracle's price with data sequence `sequence` and returns its price.\nfunction priceAtSequence(bytes message, datasig signature, pubkey oracle, int sequence) returns (int) {\n    requireSignedPrice(message, signature, oracle);\n    require(dataSequence(message) == sequence, \"strike must be the message after the lock message\");\n    return messagePrice(message);\n}\n"
    },
    "inlineRanges": "55:55:ASSET_GOLD;61:61:ASSET_BTC;69:69:ASSET_ETH;160:160:ASSET_GOLD;295:295:SETTLE_TIMEOUT;304:304:TIMEOUT_SEQUENCE"
  },
  "compiler": {
    "name": "cashc",
    "version": "0.14.0",
    "options": {
      "enforceFunctionParameterTypes": true,
      "enforceLocktimeGuard": false
    }
  },
  "updatedAt": "2026-11-18T11:07:36.525Z"
} as const;
