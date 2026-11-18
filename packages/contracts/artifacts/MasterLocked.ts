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
  "bytecode": "5c7f75587f7781 OP_0 OP_DEFINE 607f755c7f7781 OP_1 OP_DEFINE 52798277609d78827701409d7c52797bbb76008a00a069518a00a069 OP_2 OP_DEFINE 537972528a78008a9d518a OP_3 OP_DEFINE 5579557a5379528a537972528a78008a5379008a8b9d7b547f7581789f6978547f7581a169008a OP_4 OP_DEFINE 00ce01207f7751885579517f7551885579567f75557f775188c2529dc3519d55795e7f755c7f778176022c01a169567901227f755e7f77577901337f7501307f775679009c0000515c79557f75517f777e5351807e01ff7e0056807e0056807e54797e55797e537a64587902c800950210279672777b527902e8039f630072777b685879567995021027967b757d02e8039f63007b757c68515c79557f75517f777e5251807e5b7951807e597954799453799456807e5a7956807e54797e55797e776800ce01207f7500cd597a8800d17c517e8800d3009d00d28800cc00c6537994527994029808949d51527900a06351cd57798851cc53799d51d100887552687800a06376cd0376a91456797e0288ac7e8876cc52799d76d100888b68c49d6d6d6d6d6d51 OP_5 OP_DEFINE c5009d00cb05ffffffff009d5479587f75577f77817660974f557957799e6352796096009c63755155795779a0637500686775000133555379959300657654798c9f766b6357795a795379545479959354937f75537954547995937f7781a2637b8b7b7b688b686c91666d6868007800a2635879013855547995937f75013355547995937f7781776858797b7b597a01307f75012a7f7781577a577a558a77777777 OP_6 OP_DEFINE 7c0480969800957c96 OP_7 OP_DEFINE OP_7 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_0 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_DUP OP_3 OP_NUMNOTEQUAL OP_VERIFY OP_6 OP_ROLL OP_OVER OP_0 OP_NUMEQUAL OP_IF OP_5 OP_PICK OP_NIP OP_ELSE OP_OVER OP_1 OP_NUMEQUAL OP_IF OP_6 OP_PICK OP_NIP OP_ENDIF OP_ENDIF OP_2 OP_PICK 26 OP_SPLIT OP_DROP 22 OP_SPLIT OP_NIP OP_BIN2NUM OP_10 OP_ROLL OP_11 OP_ROLL OP_2OVER OP_1ADD OP_3 OP_INVOKE OP_11 OP_ROLL OP_12 OP_ROLL OP_13 OP_PICK OP_15 OP_ROLL OP_6 OP_ROLL OP_8 OP_PICK OP_12 OP_SPLIT OP_DROP OP_8 OP_SPLIT OP_NIP OP_BIN2NUM OP_4 OP_INVOKE OP_ROT OP_1ADD OP_GREATERTHAN OP_VERIFY OP_ROT OP_SWAP OP_9 OP_ROLL OP_1 OP_INVOKE OP_2ROT OP_SWAP OP_6 OP_INVOKE OP_VERIFY OP_2DROP OP_2DROP OP_DROP OP_1 OP_ELSE OP_7 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_0 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_3 OP_NUMEQUALVERIFY OP_DUP OP_12 OP_SPLIT OP_DROP OP_8 OP_SPLIT OP_NIP OP_BIN2NUM OP_OVER 26 OP_SPLIT OP_DROP 22 OP_SPLIT OP_NIP OP_BIN2NUM OP_2 OP_PICK 2a OP_SPLIT OP_DROP 26 OP_SPLIT OP_NIP OP_BIN2NUM OP_11 OP_ROLL OP_12 OP_ROLL OP_10 OP_PICK OP_4 OP_PICK OP_1ADD OP_3 OP_INVOKE OP_12 OP_ROLL OP_13 OP_ROLL OP_12 OP_PICK OP_4 OP_PICK OP_1ADD OP_3 OP_INVOKE OP_7 OP_INVOKE OP_12 OP_ROLL OP_13 OP_ROLL OP_14 OP_PICK OP_16 OP_ROLL OP_13 OP_ROLL OP_8 OP_PICK OP_4 OP_INVOKE OP_13 OP_ROLL OP_14 OP_ROLL OP_15 OP_PICK 11 OP_ROLL OP_14 OP_ROLL OP_9 OP_ROLL OP_4 OP_INVOKE OP_SWAP OP_4 OP_ROLL OP_1ADD OP_GREATERTHAN OP_SWAP OP_3 OP_ROLL OP_1ADD OP_GREATERTHAN OP_BOOLAND OP_VERIFY OP_7 OP_ROLL OP_1 OP_INVOKE OP_8 OP_ROLL OP_1 OP_INVOKE OP_7 OP_INVOKE OP_ROT OP_ROT OP_2SWAP OP_SWAP OP_4 OP_ROLL OP_6 OP_INVOKE OP_NIP OP_NIP OP_NIP OP_ELSE OP_7 OP_ROLL OP_2 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_SWAP OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_12 OP_SPLIT OP_DROP OP_8 OP_SPLIT OP_NIP OP_BIN2NUM 6054 OP_ADD OP_DUP OP_CHECKLOCKTIMEVERIFY OP_DROP OP_TXLOCKTIME OP_NUMEQUALVERIFY OP_0 OP_INPUTSEQUENCENUMBER feffffff00 OP_NUMEQUALVERIFY OP_1NEGATE OP_0 OP_0 OP_2ROT OP_SWAP OP_5 OP_INVOKE OP_VERIFY OP_2DROP OP_2DROP OP_1 OP_ENDIF OP_ENDIF",
  "source": "pragma cashscript ^0.14.0;\n\nimport \"./rules.cash\";\nimport \"./oracle.cash\";\n\n// A locked round waiting for its close. Commitment (written by MasterOpen's lock):\n//   [0] tag 0x01 · [1,5) round id · [5] state 0x01 · [6] asset · [7] mode << 4 | outcomes · [8,12) T_close\n//   [12,14) creator fee bps · [14,34) creator pubkey hash · [34,38) lock data sequence S (USD/BCH for gold)\n//   [38,42) XAU/BCH lock sequence (gold only) · [42,48) pot · [48,51) entrants · [51, 51 + 5·N) totals per outcome\n//   [51 + 5·N, …) range boundaries (4 bytes each, RANGES mode)\n//\n// Settle: anyone, with the strike (the oracle's message S + 1) and the canonical pair at T_close. It pays the fees,\n// freezes the winning outcome, the pot after fees and the winning total, and hands the round to the sweep contract.\ncontract MasterLocked(\n    bytes32 category,\n    bytes sweepLockingBytecode,\n    bytes protocolLockingBytecode,\n    pubkey oracleBtc,\n    pubkey oracleEth,\n    pubkey oracleBch,\n    pubkey oracleXau\n) {\n    function settle(\n        bytes strike,\n        datasig strikeSignature,\n        bytes previous,\n        datasig previousSignature,\n        bytes close,\n        datasig closeSignature\n    ) {\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be a round master of this category\");\n        bytes master = tx.inputs[0].nftCommitment;\n        int asset = int(master.slice(6, 7));\n        require(asset != ASSET_GOLD, \"gold settles with settleGold\");\n        pubkey oracle = oracleBch;\n        if (asset == ASSET_BTC) {\n            oracle = oracleBtc;\n        } else if (asset == ASSET_ETH) {\n            oracle = oracleEth;\n        }\n        int lockSequence = int(master.slice(34, 38));\n        int strikePrice = priceAtSequence(strike, strikeSignature, oracle, lockSequence + 1);\n        int closeSequence = firstAtOrAfter(previous, previousSignature, close, closeSignature, oracle, int(master.slice(8, 12)));\n        require(closeSequence > lockSequence + 1, \"the close must come after the strike\");\n        require(\n            payOut(master, strikePrice, messagePrice(close), sweepLockingBytecode, protocolLockingBytecode),\n            \"settlement must be exact\"\n        );\n    }\n\n    function settleGold(\n        bytes strikeUsd,\n        datasig strikeUsdSignature,\n        bytes strikeXau,\n        datasig strikeXauSignature,\n        bytes previousUsd,\n        datasig previousUsdSignature,\n        bytes closeUsd,\n        datasig closeUsdSignature,\n        bytes previousXau,\n        datasig previousXauSignature,\n        bytes closeXau,\n        datasig closeXauSignature\n    ) {\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be a round master of this category\");\n        bytes master = tx.inputs[0].nftCommitment;\n        require(int(master.slice(6, 7)) == ASSET_GOLD, \"only gold settles with two feeds\");\n        int closeTime = int(master.slice(8, 12));\n        int usdLock = int(master.slice(34, 38));\n        int xauLock = int(master.slice(38, 42));\n        int strikePrice = goldPrice(\n            priceAtSequence(strikeUsd, strikeUsdSignature, oracleBch, usdLock + 1),\n            priceAtSequence(strikeXau, strikeXauSignature, oracleXau, xauLock + 1)\n        );\n        int usdClose = firstAtOrAfter(previousUsd, previousUsdSignature, closeUsd, closeUsdSignature, oracleBch, closeTime);\n        int xauClose = firstAtOrAfter(previousXau, previousXauSignature, closeXau, closeXauSignature, oracleXau, closeTime);\n        require(usdClose > usdLock + 1 && xauClose > xauLock + 1, \"the close must come after the strike\");\n        int closePrice = goldPrice(messagePrice(closeUsd), messagePrice(closeXau));\n        require(\n            payOut(master, strikePrice, closePrice, sweepLockingBytecode, protocolLockingBytecode),\n            \"settlement must be exact\"\n        );\n    }\n\n    // If nobody can settle (an oracle gap breaks every pair), anyone voids the round once T_close + timeout has\n    // passed; everyone is refunded. The locktime is exactly the deadline so this transaction is unique too.\n    function timeoutVoid() {\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be a round master of this category\");\n        bytes master = tx.inputs[0].nftCommitment;\n        int deadline = int(master.slice(8, 12)) + SETTLE_TIMEOUT;\n        require(tx.time >= deadline, \"too early to void\");\n        require(tx.locktime == deadline, \"locktime is exactly the deadline\");\n        require(tx.inputs[0].sequenceNumber == TIMEOUT_SEQUENCE, \"fixed sequence that enforces the locktime\");\n        require(writeSettlement(master, -1, 0, 0, sweepLockingBytecode, protocolLockingBytecode), \"void must be exact\");\n    }\n}\n\n// Decides the outcome from the strike and close prices, then writes the settlement.\nfunction payOut(bytes master, int strikePrice, int closePrice, bytes sweepLockingBytecode, bytes protocolLockingBytecode)\n    returns (bool)\n{\n    require(tx.locktime == 0, \"settle carries no locktime\");\n    require(tx.inputs[0].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n    int modeAndOutcomes = int(master.slice(7, 8));\n    int outcomes = modeAndOutcomes % NIBBLE;\n    int winner = -1;\n    // A tie, or a frozen feed (strike equals close), voids the round in either mode.\n    if (closePrice != strikePrice) {\n        if (modeAndOutcomes / NIBBLE == MODE_UPDOWN) {\n            winner = 1;\n            if (closePrice > strikePrice) {\n                winner = 0;\n            }\n        } else {\n            winner = 0;\n            int boundaries = 51 + 5 * outcomes;\n            for (int j = 0; j < outcomes - 1; j++) {\n                if (closePrice >= int(master.slice(boundaries + 4 * j, boundaries + 4 * j + 4))) {\n                    winner = winner + 1;\n                }\n            }\n        }\n    }\n    int winnerTotal = 0;\n    if (winner >= 0) {\n        winnerTotal = int(master.slice(51 + 5 * winner, 56 + 5 * winner));\n    }\n    return writeSettlement(master, winner, winnerTotal, int(master.slice(42, 48)), sweepLockingBytecode, protocolLockingBytecode);\n}\n\n// Writes the sweep record and pays the protocol and creator fees (each only if at least MIN_FEE_OUTPUT; a smaller\n// fee stays in the pot). No winning stake, or winner -1, means void: no fees, every stake refunded.\nfunction writeSettlement(\n    bytes master,\n    int winner,\n    int winnerTotal,\n    int pot,\n    bytes sweepLockingBytecode,\n    bytes protocolLockingBytecode\n) returns (bool) {\n    require(tx.inputs[0].tokenCategory.split(32)[1] == 0x01, \"input 0 must be a mutable master\");\n    require(master.slice(0, 1) == TAG_MASTER, \"not a master commitment\");\n    require(master.slice(5, 6) == STATE_LOCKED, \"the round is not locked\");\n    require(tx.version == TX_VERSION, \"lifecycle transactions are version 2\");\n    require(tx.inputs.length == 1, \"settlement spends only the master\");\n    int feeBps = int(master.slice(12, 14));\n    require(feeBps <= MAX_CREATOR_FEE_BPS, \"creator fee above the cap\");\n    bytes creatorPkh = master.slice(14, 34);\n    bytes entrants = master.slice(48, 51);\n\n    bool isVoid = winnerTotal == 0;\n    int protocolFee = 0;\n    int creatorFee = 0;\n    bytes next = TAG_MASTER + master.slice(1, 5) + toPaddedBytes(STATE_VOID, 1) + 0xff + toPaddedBytes(0, 6)\n        + toPaddedBytes(0, 6) + entrants + creatorPkh;\n    if (!isVoid) {\n        protocolFee = pot * PROTOCOL_FEE_BPS / BPS;\n        if (protocolFee < MIN_FEE_OUTPUT) {\n            protocolFee = 0;\n        }\n        creatorFee = pot * feeBps / BPS;\n        if (creatorFee < MIN_FEE_OUTPUT) {\n            creatorFee = 0;\n        }\n        next = TAG_MASTER + master.slice(1, 5) + toPaddedBytes(STATE_SETTLED, 1) + toPaddedBytes(winner, 1)\n            + toPaddedBytes(pot - protocolFee - creatorFee, 6) + toPaddedBytes(winnerTotal, 6) + entrants + creatorPkh;\n    }\n    bytes category = tx.inputs[0].tokenCategory.split(32)[0];\n    require(tx.outputs[0].lockingBytecode == sweepLockingBytecode, \"the round moves to the sweep contract\");\n    require(tx.outputs[0].tokenCategory == category + 0x01, \"the master keeps its mutable NFT\");\n    require(tx.outputs[0].tokenAmount == 0, \"no fungible tokens\");\n    require(tx.outputs[0].nftCommitment == next, \"the settlement record must be exact\");\n    require(tx.outputs[0].value == tx.inputs[0].value - protocolFee - creatorFee - SETTLE_FEE, \"fixed settle fee\");\n\n    int index = 1;\n    if (protocolFee > 0) {\n        require(tx.outputs[1].lockingBytecode == protocolLockingBytecode, \"protocol fee output\");\n        require(tx.outputs[1].value == protocolFee, \"protocol fee amount\");\n        require(tx.outputs[1].tokenCategory == 0x, \"fee carries no tokens\");\n        index = 2;\n    }\n    if (creatorFee > 0) {\n        require(tx.outputs[index].lockingBytecode == new LockingBytecodeP2PKH(unsafe_bytes20(creatorPkh)), \"creator fee output\");\n        require(tx.outputs[index].value == creatorFee, \"creator fee amount\");\n        require(tx.outputs[index].tokenCategory == 0x, \"fee carries no tokens\");\n        index = index + 1;\n    }\n    require(tx.outputs.length == index, \"no other outputs\");\n    return true;\n}\n",
  "fingerprint": "763925a670eb85dc3183ea0314aa5d687abd0b7828341522e3914a1044658f81",
  "debug": {
    "bytecode": "075c7f75587f7781008907607f755c7f778151891c52798277609d78827701409d7c52797bbb76008a00a069518a00a06952890b537972528a78008a9d518a5389275579557a5379528a537972528a78008a5379008a8b9d7b547f7581789f6978547f7581a169008a54894d260100ce01207f7751885579517f7551885579567f75557f775188c2529dc3519d55795e7f755c7f778176022c01a169567901227f755e7f77577901337f7501307f775679009c0000515c79557f75517f777e5351807e01ff7e0056807e0056807e54797e55797e537a64587902c800950210279672777b527902e8039f630072777b685879567995021027967b757d02e8039f63007b757c68515c79557f75517f777e5251807e5b7951807e597954799453799456807e5a7956807e54797e55797e776800ce01207f7500cd597a8800d17c517e8800d3009d00d28800cc00c6537994527994029808949d51527900a06351cd57798851cc53799d51d100887552687800a06376cd0376a91456797e0288ac7e8876cc52799d76d100888b68c49d6d6d6d6d6d5155894ca2c5009d00cb05ffffffff009d5479587f75577f77817660974f557957799e6352796096009c63755155795779a0637500686775000133555379959300657654798c9f766b6357795a795379545479959354937f75537954547995937f7781a2637b8b7b7b688b686c91666d6868007800a2635879013855547995937f75013355547995937f7781776858797b7b597a01307f75012a7f7781577a577a558a777777775689097c0480969800957c9657895779009c6300ce7c517e8800cf76577f75567f778176539e69567a78009c635579776778519c635679776868527901267f7501227f77815a7a5b7a708b538a5b7a5c7a5d795f7a567a58795c7f75587f7781548a7b8ba0697b7c597a518a717c568a696d6d7551675779519c6300ce7c517e8800cf76577f75567f7781539d765c7f75587f77817801267f7501227f77815279012a7f7501267f77815b7a5c7a5a7954798b538a5c7a5d7a5c7954798b538a578a5c7a5d7a5e79607a5d7a5879548a5d7a5e7a5f7901117a5e7a597a548a7c547a8ba07c537a8ba09a69577a518a587a518a578a7b7b727c547a568a77777767577a529d00ce7c517e8800cf765c7f75587f77810260549376b175c59d00cb05feffffff009d4f0000717c558a696d6d516868",
    "sourceMap": "15::17:1;;::::1;19::21::0;;::::1;24::30::0;;::::1;51::55::0;;::::1;34::48::0;;::::1;133::190::0;;::::1;99::129::0;;::::1;::101::0;;::::1;23:4:49:5:0;;;;;31:26:31:27;:16::42:1;:46::54:0;:57::61;:46:::1;:8::114;32:33:32:34:0;:23::49:1;33:24:33:30:0;:40::41;:24::42:1;;:37::38:0;:24::42:1;;:20::43;34:16:34:21:0;:25::35:1;:16;:8::69;35:24:35:33:0;;36:12:36:17;:21::30:1;:12;:32:38:9:0;37:21:37:30;;:12::31:1;38:15:40:9:0;:19:38:24;:28::37:1;:19;:39:40:9:0;39:21:39:30;;:12::31:1;38:39:40:9;:15;41:31:41:37:0;;:48::50;:31::51:1;;:44::46:0;:31::51:1;;:27::52;42:42:42:48:0;;:50::65;;:67::87;:75::91:1;:26::92;;43:43:43:51:0;;:53::70;;:72::77;;:79::93;;:95::101;;:107::113;;:123::125;:107::126:1;;:120::121:0;:107::126:1;;:103::127;:28::128;;44:32:44:44:0;:::48:1;:16;:8::90;46:19:46:25:0;:27::38;:53::58;;:40::59:1;;:61::106:0;;:12::107:1;;45:8:48:10;30:6:49:5;;;;23:4;51::83::0;;;;;65:26:65:27;:16::42:1;:46::54:0;:57::61;:46:::1;:8::114;66:33:66:34:0;:23::49:1;67:20:67:26:0;:36::37;:20::38:1;;:33::34:0;:20::38:1;;:16::39;:43::53;:8::91;68:28:68:34:0;:44::46;:28::47:1;;:41::42:0;:28::47:1;;:24::48;69:26:69:32:0;:43::45;:26::46:1;;:39::41:0;:26::46:1;;:22::47;70:26:70:32:0;;:43::45;:26::46:1;;:39::41:0;:26::46:1;;:22::47;72:28:72:37:0;;:39::57;;:59::68;;:70::77;;:::81:1;:12::82;;73:28:73:37:0;;:39::57;;:59::68;;:70::77;;:::81:1;:12::82;;71:26:74:9;;75:38:75:49:0;;:51::71;;:73::81;;:83::100;;:102::111;;:113::122;;:23::123:1;;76:38:76:49:0;;:51::71;;:73::81;;:83::100;;:102::111;;:113::122;;:23::123:1;;77:16:77:24:0;:27::34;;:::38:1;:16;:42::50:0;:53::60;;:::64:1;:42;:16;:8::106;78:48:78:56:0;;:35::57:1;;:72::80:0;;:59::81:1;;:25::82;;80:19:80:25:0;:27::38;:40::72;;:74::97;;:12::98:1;79:8:82:10;64:6:83:5;;;51:4;87::95::0;;;;88:26:88:27;:16::42:1;:46::54:0;:57::61;:46:::1;:8::114;89:33:89:34:0;:23::49:1;90:27:90:33:0;:43::45;:27::46:1;;:40::41:0;:27::46:1;;:23::47;:50::64;:23;91:27:91:35:0;:8::58:1;;92:16:92:27:0;:8::77:1;93:26:93:27:0;:16::43:1;:47::63;:8::110;94:40:94:42:0;:44::45;:47::48;:50::95;;:16::96:1;;:8::120;87:27:95:5;;;14:0:96:1;",
    "logs": [],
    "requires": [
      {
        "ip": 41,
        "line": 31,
        "message": "input 0 must be a round master of this category"
      },
      {
        "ip": 55,
        "line": 34,
        "message": "gold settles with settleGold"
      },
      {
        "ip": 116,
        "line": 44,
        "message": "the close must come after the strike"
      },
      {
        "ip": 127,
        "line": 45,
        "message": "settlement must be exact"
      },
      {
        "ip": 143,
        "line": 65,
        "message": "input 0 must be a round master of this category"
      },
      {
        "ip": 155,
        "line": 67,
        "message": "only gold settles with two feeds"
      },
      {
        "ip": 244,
        "line": 77,
        "message": "the close must come after the strike"
      },
      {
        "ip": 263,
        "line": 79,
        "message": "settlement must be exact"
      },
      {
        "ip": 276,
        "line": 88,
        "message": "input 0 must be a round master of this category"
      },
      {
        "ip": 290,
        "line": 91,
        "message": "too early to void"
      },
      {
        "ip": 293,
        "line": 92,
        "message": "locktime is exactly the deadline"
      },
      {
        "ip": 297,
        "line": 93,
        "message": "fixed sequence that enforces the locktime"
      },
      {
        "ip": 305,
        "line": 94,
        "message": "void must be exact"
      }
    ],
    "sourceTags": "256:258:sc",
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
        "name": "writeSettlement",
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
          }
        ],
        "bytecode": "00ce01207f7751885579517f7551885579567f75557f775188c2529dc3519d55795e7f755c7f778176022c01a169567901227f755e7f77577901337f7501307f775679009c0000515c79557f75517f777e5351807e01ff7e0056807e0056807e54797e55797e537a64587902c800950210279672777b527902e8039f630072777b685879567995021027967b757d02e8039f63007b757c68515c79557f75517f777e5251807e5b7951807e597954799453799456807e5a7956807e54797e55797e776800ce01207f7500cd597a8800d17c517e8800d3009d00d28800cc00c6537994527994029808949d51527900a06351cd57798851cc53799d51d100887552687800a06376cd0376a91456797e0288ac7e8876cc52799d76d100888b68c49d6d6d6d6d6d51",
        "sourceMap": "141:22:141:23;:12::38:1;:45::47:0;:12::48:1;:::51;:55::59:0;:4::97:1;142:12:142:18:0;;:28::29;:12::30:1;;:34::44;:4::73;143:12:143:18:0;;:28::29;:12::30:1;;:25::26:0;:12::30:1;;:34::46;:4::75;144:12:144:22:0;:26::36:1;:4::78;145:12:145:28:0;:32::33;:4::72:1;146:21:146:27:0;;:38::40;:21::41:1;;:34::36:0;:21::41:1;;:17::42;147:12:147:18:0;:22::41:1;:12;:4::72;148:23:148:29:0;;:40::42;:23::43:1;;:36::38:0;:23::43:1;;149:21:149:27:0;;:38::40;:21::41:1;;:34::36:0;:21::41:1;;151:18:151:29:0;;:33::34;:18:::1;152:22:152:23:0;153:21:153:22;154:17:154:27:1;:30::36:0;;:46::47;:30::48:1;;:43::44:0;:30::48:1;;:17;:65::75;:77::78:0;:51::79:1;:17;:82::86:0;:17:::1;:103::104:0;:106::107;:89::108:1;:17;155:24:155:25:0;:27::28;:10::29:1;154:17;155:32::40:0;;154:17:::1;155:43::53:0;;154:17:::1;156:9:156:15:0;;:8:167:5;157:22:157:25;;:28::44:1;:22;:47::50;:22;:8::51;;;158:12:158:23:0;;:26::40:1;:12;:42:160:9:0;159:26:159:27;:12::28:1;;;158:42:160:9;161:21:161:24:0;;:27::33;;:21:::1;:36::39;:21;:8::40;;::162:22:0;162:25::39:1;:12;:41:164:9:0;163:25:163:26;:12::27:1;;;162:41:164:9;165:15:165:25;:28::34:0;;:44::45;:28::46:1;;:41::42:0;:28::46:1;;:15;:63::76;:78::79:0;:49::80:1;:15;:97::103:0;;:105::106;:83::107:1;:15;166:28:166:31:0;;:34::45;;:28:::1;:48::58:0;;:28:::1;:60::61:0;:14::62:1;165:15;166:79::90:0;;:92::93;:65::94:1;165:15;166:97::105:0;;165:15:::1;166:108::118:0;;165:15:::1;:8::119;156:17:167:5;168:31:168:32:0;:21::47:1;:54::56:0;:21::57:1;:::60;169:23:169:24:0;:12::41:1;:45::65:0;;:4::108:1;170:23:170:24:0;:12::39:1;:43::51:0;:54::58;:43:::1;:4::96;171:23:171:24:0;:12::37:1;:41::42:0;:4::66:1;172:23:172:24:0;:12::39:1;:4::88;173:23:173:24:0;:12::31:1;:45::46:0;:35::53:1;:56::67:0;;:35:::1;:70::80:0;;:35:::1;:83::93;:35;:4::115;175:16:175:17:0;176:8:176:19;;:22::23;:8:::1;:25:181:5:0;177:27:177:28;:16::45:1;:49::72:0;;:8::97:1;178:27:178:28:0;:16::35:1;:39::50:0;;:8::75:1;179:27:179:28:0;:16::43:1;:47::49:0;:8::76:1;180::180:18;;176:25:181:5;182:8:182:18:0;:21::22;:8:::1;:24:187:5:0;183:27:183:32;:16::49:1;:53::105:0;:93::103;;:53::105:1;;;:8::129;184:27:184:32:0;:16::39:1;:43::53:0;;:8::77:1;185:27:185:32:0;:16::47:1;:51::53:0;:8::80:1;186::186:26;182:24:187:5;188:12:188:29:0;:4::60:1;140:17:190:1;;;;;",
        "logs": [],
        "requires": [
          {
            "ip": 6,
            "line": 141,
            "message": "input 0 must be a mutable master"
          },
          {
            "ip": 13,
            "line": 142,
            "message": "not a master commitment"
          },
          {
            "ip": 23,
            "line": 143,
            "message": "the round is not locked"
          },
          {
            "ip": 26,
            "line": 144,
            "message": "lifecycle transactions are version 2"
          },
          {
            "ip": 29,
            "line": 145,
            "message": "settlement spends only the master"
          },
          {
            "ip": 42,
            "line": 147,
            "message": "creator fee above the cap"
          },
          {
            "ip": 187,
            "line": 169,
            "message": "the round moves to the sweep contract"
          },
          {
            "ip": 193,
            "line": 170,
            "message": "the master keeps its mutable NFT"
          },
          {
            "ip": 197,
            "line": 171,
            "message": "no fungible tokens"
          },
          {
            "ip": 200,
            "line": 172,
            "message": "the settlement record must be exact"
          },
          {
            "ip": 213,
            "line": 173,
            "message": "fixed settle fee"
          },
          {
            "ip": 224,
            "line": 177,
            "message": "protocol fee output"
          },
          {
            "ip": 229,
            "line": 178,
            "message": "protocol fee amount"
          },
          {
            "ip": 233,
            "line": 179,
            "message": "fee carries no tokens"
          },
          {
            "ip": 249,
            "line": 183,
            "message": "creator fee output"
          },
          {
            "ip": 254,
            "line": 184,
            "message": "creator fee amount"
          },
          {
            "ip": 258,
            "line": 185,
            "message": "fee carries no tokens"
          },
          {
            "ip": 262,
            "line": 188,
            "message": "no other outputs"
          }
        ],
        "inlineRanges": "12:12:TAG_MASTER;22:22:STATE_LOCKED;25:25:TX_VERSION;40:40:MAX_CREATOR_FEE_BPS;65:65:TAG_MASTER;75:75:STATE_VOID;100:100:PROTOCOL_FEE_BPS;102:102:BPS;109:109:MIN_FEE_OUTPUT;122:122:BPS;127:127:MIN_FEE_OUTPUT;135:135:TAG_MASTER;145:145:STATE_SETTLED;211:211:SETTLE_FEE"
      },
      {
        "id": 6,
        "name": "payOut",
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
          }
        ],
        "bytecode": "c5009d00cb05ffffffff009d5479587f75577f77817660974f557957799e6352796096009c63755155795779a0637500686775000133555379959300657654798c9f766b6357795a795379545479959354937f75537954547995937f7781a2637b8b7b7b688b686c91666d6868007800a2635879013855547995937f75013355547995937f7781776858797b7b597a01307f75012a7f7781577a577a558a77777777",
        "sourceMap": "102:12:102:23;:27::28;:4::60:1;103:22:103:23:0;:12::39:1;:43::57;:4::77;104:30:104:36:0;;:46::47;:30::48:1;;:43::44:0;:30::48:1;;:26::49;105:19:105:34:0;:37::43:1;:19;106:17:106:19:0;108:8:108:18;;:22::33;;:8:::1;:35:123:5:0;109:12:109:27;;:30::36:1;:12;:40::51;:12;:53:114:9:0;110:12:110:23:1;;111:16:111:26:0;;:29::40;;:16:::1;:42:113:13:0;112:16:112:27:1;;111:42:113:13;114:15:122:9:0;115:12:115:23:1;;116:29:116:31:0;:34::35;:38::46;;:34:::1;:29;117:25:117:26:0;:12:121:13;:28:117:29;:32::40;;:::44:1;:28;;;:51:121:13:0;118:20:118:30;;:38::44;;:71::81;;:84::85;:88::89;;:84:::1;:71;:92::93:0;:71:::1;:38::94;;:51::61:0;;:64::65;:68::69;;:64:::1;:51;:38::94;;:34::95;:20;:97:120:17:0;119:20:119:40:1;;;;118:97:120:17;117:46:117:49;:51:121:13;;:12;;114:15:122:9;;108:35:123:5;124:22:124:23:0;125:8:125:14;:18::19;:8:::1;:21:127:5:0;126:26:126:32;;:56::58;:61::62;:65::71;;:61:::1;:56;:26::72;;:39::41:0;:44::45;:48::54;;:44:::1;:39;:26::72;;:22::73;:8::74;125:21:127:5;128:27:128:33:0;;:35::41;:43::54;:60::66;;:77::79;:60::80:1;;:73::75:0;:60::80:1;;:56::81;:83::103:0;;:105::128;;:11::129:1;;101:0:129:1;;;",
        "sourceTags": "95:95:fu;96:99:lc;100:100:sc;148:151:sc",
        "logs": [],
        "requires": [
          {
            "ip": 2,
            "line": 102,
            "message": "settle carries no locktime"
          },
          {
            "ip": 6,
            "line": 103,
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
        "name": "MIN_FEE_OUTPUT",
        "kind": "constant",
        "inputs": [],
        "bytecode": "02e803",
        "sourceMap": "54:30:54:34",
        "sourceFile": "rules.cash",
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
      "rules.cash": "pragma cashscript ^0.14.0;\n\n// Jōge's shared rules: NFT tags, round states, stake classes and fixed lifecycle fees.\n// Every number here is mirrored in packages/sdk/src/round/constants.ts; change both together.\n\n// First byte of every commitment of category K.\nbytes constant TAG_MASTER = 0x01;\nbytes constant TAG_GATE = 0x02;\nbytes constant TAG_TICKET = 0x03;\n\n// Master state byte (offset 5).\nbytes constant STATE_OPEN = 0x00;\nbytes constant STATE_LOCKED = 0x01;\nint constant STATE_SETTLED = 2;\nint constant STATE_VOID = 3;\n\n// Assets: index into the oracle table. Gold needs two feeds (USD/BCH and XAU/BCH).\nint constant ASSET_BTC = 0;\nint constant ASSET_ETH = 1;\nint constant ASSET_BCH = 2;\nint constant ASSET_GOLD = 3;\n// USD/BCH is in cents, XAU/BCH in ounces × 100000, so usd × 10^7 ÷ xau is dollars per ounce × 10^4.\nint constant GOLD_FACTOR = 10000000;\n\n// Modes (high nibble of the mode byte); outcomes are the low nibble.\nint constant MODE_UPDOWN = 0;\nint constant MODE_RANGES = 1;\nint constant NIBBLE = 16;\nint constant MAX_OUTCOMES = 6;\n\n// Stake classes (high nibble of the gate's class byte): satoshi bounds per entry and per gate.\nint constant CLASS_SHORT = 0;\nint constant CLASS_HOURLY = 1;\nint constant CLASS_EVENT = 2;\nint constant MIN_STAKE = 5000;\nint constant SHORT_MAX_STAKE = 500000;\nint constant HOURLY_MAX_STAKE = 5000000;\nint constant EVENT_MAX_STAKE = 25000000;\nint constant SHORT_GATE_CAP = 10000000;\nint constant HOURLY_GATE_CAP = 100000000;\nint constant EVENT_GATE_CAP = 500000000;\n\n// Fees and dust (satoshis). Lifecycle fees are fixed so every client builds the same bytes; calibrated in S00 from\n// measured sizes (gold settle ~1,840 B, gold lock with one gate ~1,940 B, ~190 B per swept P2SH32 ticket) with headroom.\n// P2S tickets carry their ~112-byte script in the output: dust is 444 + 3 × ~188 B ≈ 1,008 sats, so 1,200.\nint constant TICKET_DUST = 1200;\n// Every gate is created holding exactly this; the lock counts anything beyond it as pot.\nint constant GATE_DUST = 1000;\n// An event entrant may leave before the lock; this share of the stake stays in the gate and joins the winners' pot.\nint constant EVENT_EXIT_FEE_BPS = 300;\n// P2PKH unlocking bytecode: 0x41 push, 64-byte Schnorr signature, then the sighash byte.\nbytes constant SIGNATURE_PUSH = 0x41;\nint constant SIGHASH_BYTE = 65;\nint constant MIN_FEE_OUTPUT = 1000;\nint constant LOCK_FEE_BASE = 1600;\nint constant LOCK_FEE_PER_GATE = 700;\n// An event gate's script is nearly twice a lane gate's (~690 bytes per merged gate, measured 2026-11-17: a 2-gate event\n// lock is ~3,090 bytes, which 1,600 + 2 × 700 could not pay), so events pay more per gate.\nint constant EVENT_LOCK_FEE_PER_GATE = 1100;\nint constant SETTLE_FEE = 2200;\nint constant SWEEP_FEE_BASE = 1000;\nint constant SWEEP_FEE_PER_TICKET = 250;\n// Each swept ticket costs ~20,000 operation-cost units; 32 padding bytes buy 25,600 (measured in S00).\nint constant SWEEP_PAD_PER_TICKET = 32;\nint constant PROTOCOL_FEE_BPS = 200;\nint constant MAX_CREATOR_FEE_BPS = 300;\nint constant BPS = 10000;\n\n// Lifecycle transactions take every input at this sequence; the SDK default (0xfffffffe) would allow a second variant.\nint constant FINAL_SEQUENCE = 4294967295;\n// Timeout paths need a non-final sequence so the node enforces their locktime.\nint constant TIMEOUT_SEQUENCE = 4294967294;\nint constant TX_VERSION = 2;\n// After T_close, how long settlement has before anyone may void the round (MTP lags about an hour on mainnet).\nint constant SETTLE_TIMEOUT = 21600;\n\nfunction maxStake(int stakeClass) returns (int) {\n    require(stakeClass >= CLASS_SHORT && stakeClass <= CLASS_EVENT, \"unknown stake class\");\n    int limit = SHORT_MAX_STAKE;\n    if (stakeClass == CLASS_HOURLY) {\n        limit = HOURLY_MAX_STAKE;\n    } else if (stakeClass == CLASS_EVENT) {\n        limit = EVENT_MAX_STAKE;\n    }\n    return limit;\n}\n\nfunction gateCap(int stakeClass) returns (int) {\n    int cap = SHORT_GATE_CAP;\n    if (stakeClass == CLASS_HOURLY) {\n        cap = HOURLY_GATE_CAP;\n    } else if (stakeClass == CLASS_EVENT) {\n        cap = EVENT_GATE_CAP;\n    }\n    return cap;\n}\n\n// Gold in ten-thousandths of a US dollar per ounce, from the USD/BCH and XAU/BCH prices of the same minute.\nfunction goldPrice(int usdPerBch, int xauPerBch) returns (int) {\n    return usdPerBch * GOLD_FACTOR / xauPerBch;\n}\n",
      "oracle.cash": "pragma cashscript ^0.14.0;\n\n// General Protocols price messages, as verified by AnyHedge v0.12 (contract.cash l.73-94).\n// A message is 16 bytes of little-endian script numbers:\n//   [0,4) message timestamp · [4,8) message sequence · [8,12) data sequence · [12,16) price.\n// A data sequence <= 0 marks a metadata message, which is never a price.\n\nint constant MESSAGE_BYTES = 16;\nint constant DATASIG_BYTES = 64;\n\nfunction messageTimestamp(bytes message) returns (int) {\n    return int(message.slice(0, 4));\n}\n\nfunction dataSequence(bytes message) returns (int) {\n    return int(message.slice(8, 12));\n}\n\nfunction messagePrice(bytes message) returns (int) {\n    return int(message.slice(12, 16));\n}\n\n// Proves `message` is a signed price message from `oracle`. Fixed lengths keep every proof byte-identical.\nfunction requireSignedPrice(bytes message, datasig signature, pubkey oracle) {\n    require(message.length == MESSAGE_BYTES, \"oracle message must be 16 bytes\");\n    require(bytes(signature).length == DATASIG_BYTES, \"oracle signature must be 64 bytes\");\n    require(checkDataSig(signature, message, oracle), \"oracle signature does not verify\");\n    require(dataSequence(message) > 0, \"metadata message is not a price\");\n    require(messagePrice(message) > 0, \"oracle price must be positive\");\n}\n\n// Proves `first` is the oracle's first price message at or after `boundary`: the previous message (consecutive data\n// sequence) is strictly before the boundary. Returns the first message's data sequence.\nfunction firstAtOrAfter(\n    bytes previous,\n    datasig previousSignature,\n    bytes first,\n    datasig firstSignature,\n    pubkey oracle,\n    int boundary\n) returns (int) {\n    requireSignedPrice(previous, previousSignature, oracle);\n    requireSignedPrice(first, firstSignature, oracle);\n    require(dataSequence(first) == dataSequence(previous) + 1, \"oracle messages must be consecutive\");\n    require(messageTimestamp(previous) < boundary, \"previous message must be before the boundary\");\n    require(messageTimestamp(first) >= boundary, \"first message must be at or after the boundary\");\n    return dataSequence(first);\n}\n\n// Proves `message` is the oracle's price with data sequence `sequence` and returns its price.\nfunction priceAtSequence(bytes message, datasig signature, pubkey oracle, int sequence) returns (int) {\n    requireSignedPrice(message, signature, oracle);\n    require(dataSequence(message) == sequence, \"strike must be the message after the lock message\");\n    return messagePrice(message);\n}\n"
    },
    "inlineRanges": "53:53:ASSET_GOLD;59:59:ASSET_BTC;67:67:ASSET_ETH;154:154:ASSET_GOLD;287:287:SETTLE_TIMEOUT;296:296:TIMEOUT_SEQUENCE"
  },
  "compiler": {
    "name": "cashc",
    "version": "0.14.0",
    "options": {
      "enforceFunctionParameterTypes": true,
      "enforceLocktimeGuard": false
    }
  },
  "updatedAt": "2026-11-18T19:51:45.288Z"
} as const;
