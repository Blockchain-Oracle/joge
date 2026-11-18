export default {
  "contractName": "DollarMasterSweep",
  "constructorInputs": [
    {
      "name": "category",
      "type": "bytes32"
    },
    {
      "name": "ticketLockingBytecode",
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
  "abi": [
    {
      "name": "sweep",
      "inputs": [
        {
          "name": "padding",
          "type": "bytes"
        }
      ]
    }
  ],
  "bytecode": "05ffffffff00 OP_0 OP_DEFINE OP_0 OP_UTXOTOKENCOMMITMENT OP_0 OP_UTXOTOKENCATEGORY OP_2 OP_PICK OP_1 OP_CAT OP_EQUALVERIFY OP_DUP OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUALVERIFY OP_DUP OP_6 OP_SPLIT OP_DROP OP_5 OP_SPLIT OP_NIP OP_BIN2NUM OP_DUP OP_2 OP_NUMEQUAL OP_OVER OP_3 OP_NUMEQUAL OP_BOOLOR OP_VERIFY OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_TXLOCKTIME OP_0 OP_NUMEQUALVERIFY OP_0 OP_INPUTSEQUENCENUMBER OP_0 OP_INVOKE OP_NUMEQUALVERIFY OP_1 OP_5 OP_PICK OP_7 OP_PICK OP_2 OP_PICK OP_UTXOBYTECODE OP_ROT OP_EQUAL OP_ROT OP_UTXOTOKENCATEGORY OP_ROT OP_EQUAL OP_BOOLAND OP_VERIFY OP_1 OP_INPUTSEQUENCENUMBER OP_0 OP_INVOKE OP_NUMEQUALVERIFY OP_OVER OP_5 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_2 OP_PICK OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_3 OP_PICK OP_13 OP_SPLIT OP_DROP OP_7 OP_SPLIT OP_NIP OP_BIN2NUM OP_4 OP_PICK 13 OP_SPLIT OP_DROP OP_13 OP_SPLIT OP_NIP OP_BIN2NUM OP_5 OP_PICK 16 OP_SPLIT OP_DROP 13 OP_SPLIT OP_NIP OP_BIN2NUM OP_TXINPUTCOUNT OP_2 OP_SUB OP_2DUP OP_GREATERTHANOREQUAL OP_VERIFY OP_DUP OP_0 OP_GREATERTHAN OP_VERIFY OP_TXOUTPUTCOUNT OP_TXINPUTCOUNT OP_NUMEQUALVERIFY OP_12 OP_ROLL OP_0 OP_2 OP_PICK 20 OP_MUL OP_NUM2BIN OP_EQUALVERIFY OP_0 OP_0 OP_0 OP_2 OP_BEGIN OP_DUP OP_TXINPUTCOUNT OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_DUP OP_UTXOTOKENCOMMITMENT OP_OVER OP_UTXOTOKENCATEGORY OP_14 OP_PICK OP_EQUALVERIFY OP_OVER OP_UTXOBYTECODE OP_15 OP_PICK OP_EQUALVERIFY OP_OVER OP_INPUTSEQUENCENUMBER OP_0 OP_INVOKE OP_NUMEQUALVERIFY OP_DUP OP_1 OP_SPLIT OP_DROP OP_3 OP_EQUALVERIFY OP_DUP OP_5 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_11 OP_PICK OP_EQUALVERIFY OP_DUP OP_12 OP_SPLIT OP_DROP OP_7 OP_SPLIT OP_NIP OP_BIN2NUM OP_0 OP_13 OP_PICK OP_3 OP_NUMEQUAL OP_IF OP_OVER OP_NIP OP_ELSE OP_2 OP_PICK OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_12 OP_PICK OP_NUMEQUAL OP_IF OP_OVER OP_11 OP_PICK OP_MUL OP_10 OP_PICK OP_DIV OP_NIP OP_ENDIF OP_ENDIF OP_3 OP_PICK OP_UTXOVALUE fa00 OP_SUB OP_4 OP_PICK OP_OUTPUTBYTECODE 76a914 OP_5 OP_PICK 20 OP_SPLIT OP_DROP OP_12 OP_SPLIT OP_NIP OP_CAT 88ac OP_CAT OP_EQUALVERIFY OP_4 OP_PICK OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY OP_OVER OP_0 OP_GREATERTHAN OP_IF OP_4 OP_PICK OP_OUTPUTTOKENCATEGORY 14 OP_PICK OP_EQUALVERIFY OP_4 OP_PICK OP_OUTPUTTOKENAMOUNT OP_2 OP_PICK OP_NUMEQUALVERIFY OP_ELSE OP_4 OP_PICK OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_ENDIF OP_7 OP_PICK OP_5 OP_PICK OP_UTXOVALUE OP_ADD OP_8 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_2SWAP OP_ROT OP_FROMALTSTACK OP_FROMALTSTACK OP_FROMALTSTACK OP_FROMALTSTACK OP_6 OP_PICK OP_OVER OP_ADD OP_7 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_2SWAP OP_ROT OP_FROMALTSTACK OP_FROMALTSTACK OP_FROMALTSTACK OP_5 OP_PICK OP_2 OP_PICK OP_ADD OP_6 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_2SWAP OP_ROT OP_FROMALTSTACK OP_FROMALTSTACK OP_4 OP_ROLL OP_1ADD OP_SWAP OP_TOALTSTACK OP_SWAP OP_2SWAP OP_ROT OP_FROMALTSTACK OP_2DROP OP_2DROP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_0 OP_UTXOVALUE OP_3 OP_ROLL OP_ADD OP_ROT OP_SUB e803 OP_SUB 2c01 OP_SUB OP_2 OP_PICK fa00 OP_MUL OP_SUB OP_1 OP_UTXOTOKENAMOUNT OP_ROT OP_SUB OP_2SWAP OP_SUB OP_0 OP_OUTPUTVALUE OP_3 OP_ROLL OP_NUMEQUALVERIFY OP_DUP OP_0 OP_NUMEQUAL OP_IF 76a914 OP_8 OP_PICK 2a OP_SPLIT OP_DROP 16 OP_SPLIT OP_NIP OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_1 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENCATEGORY OP_13 OP_PICK OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENAMOUNT OP_3 OP_PICK OP_NUMEQUALVERIFY OP_1 OP_OUTPUTVALUE OP_1 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_DROP OP_ELSE OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_9 OP_PICK OP_1 OP_CAT OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTTOKENCOMMITMENT OP_8 OP_PICK 13 OP_SPLIT OP_DROP OP_2 OP_PICK OP_3 OP_NUM2BIN OP_CAT OP_9 OP_PICK 2a OP_SPLIT OP_DROP 16 OP_SPLIT OP_NIP OP_CAT OP_EQUALVERIFY OP_1 OP_11 OP_PICK OP_13 OP_PICK OP_4 OP_PICK OP_3 OP_PICK OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_2 OP_PICK OP_OUTPUTTOKENCATEGORY OP_ROT OP_EQUALVERIFY OP_OVER OP_OUTPUTTOKENAMOUNT OP_NUMEQUALVERIFY OP_OUTPUTVALUE e803 OP_NUMEQUALVERIFY OP_1 OP_VERIFY OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_1",
  "source": "pragma cashscript ^0.14.0;\n\nimport \"./dollar.cash\";\n\n// A settled or void dollar event paying out: MasterSweep, with the dollars in the pot sidecar at input 1. Commitment\n// as MasterSweep's (the pot and winning total are in dollar units).\n//\n// Sweep: anyone, in batches. Input 0 the master, input 1 the pot sidecar, inputs 2.. tickets of this round; output i\n// pays the owner of the ticket at input i: winner floor(stake × pot ÷ winning total) dollars, void the stake back in\n// dollars, loser nothing in dollars; every ticket also gets its dust back less the per-ticket fee. The batch that\n// takes the last ticket returns the master's satoshis (output 0) and what is left in the sidecar (output 1: the seeds\n// and any rounding) to the round's creator.\ncontract DollarMasterSweep(bytes32 category, bytes ticketLockingBytecode, bytes sideLockingBytecode, bytes32 dollarCategory) {\n    function sweep(bytes padding) {\n        bytes master = tx.inputs[0].nftCommitment;\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be a round master\");\n        require(master.slice(0, 1) == TAG_MASTER, \"not a master commitment\");\n        int state = int(master.slice(5, 6));\n        require(state == STATE_SETTLED || state == STATE_VOID, \"the round has not settled\");\n        require(tx.version == TX_VERSION, \"lifecycle transactions are version 2\");\n        require(tx.locktime == 0, \"sweep carries no locktime\");\n        require(tx.inputs[0].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n        require(isSide(1, sideLockingBytecode, dollarCategory), \"input 1 must be the pot sidecar\");\n        require(tx.inputs[1].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n\n        bytes roundId = master.slice(1, 5);\n        int winner = int(master.slice(6, 7));\n        int pot = int(master.slice(7, 13));\n        int winnerTotal = int(master.slice(13, 19));\n        int remaining = int(master.slice(19, 22));\n        int tickets = tx.inputs.length - 2;\n        require(tickets <= remaining, \"more tickets than the round has left\");\n        require(tickets > 0, \"a sweep takes at least one ticket\");\n        require(tx.outputs.length == tx.inputs.length, \"one payout per ticket, plus the master and the sidecar\");\n        require(padding == toPaddedBytes(0, tickets * SWEEP_PAD_PER_TICKET), \"padding is fixed per ticket\");\n\n        int ticketValue = 0;\n        int paidSats = 0;\n        int paidDollars = 0;\n        for (int i = 2; i < tx.inputs.length; i++) {\n            bytes ticket = tx.inputs[i].nftCommitment;\n            require(tx.inputs[i].tokenCategory == category, \"input must be a ticket of this category\");\n            require(tx.inputs[i].lockingBytecode == ticketLockingBytecode, \"input must sit at the ticket contract\");\n            require(tx.inputs[i].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n            require(ticket.slice(0, 1) == TAG_TICKET, \"not a ticket commitment\");\n            require(ticket.slice(1, 5) == roundId, \"ticket belongs to another round\");\n            int stake = int(ticket.slice(7, 12));\n            int share = 0;\n            if (state == STATE_VOID) {\n                share = stake;\n            } else if (int(ticket.slice(6, 7)) == winner) {\n                share = stake * pot / winnerTotal;\n            }\n            int dust = tx.inputs[i].value - SWEEP_FEE_PER_TICKET;\n            require(\n                tx.outputs[i].lockingBytecode == new LockingBytecodeP2PKH(unsafe_bytes20(ticket.slice(12, 32))),\n                \"output pays the ticket's owner\"\n            );\n            require(tx.outputs[i].value == dust, \"the ticket's dust comes back less its share of the fee\");\n            if (share > 0) {\n                require(tx.outputs[i].tokenCategory == dollarCategory, \"the payout is in dollars\");\n                require(tx.outputs[i].tokenAmount == share, \"payout amount\");\n            } else {\n                require(tx.outputs[i].tokenCategory == 0x, \"a miss carries no tokens\");\n            }\n            ticketValue = ticketValue + tx.inputs[i].value;\n            paidSats = paidSats + dust;\n            paidDollars = paidDollars + share;\n        }\n\n        int rest = tx.inputs[0].value + ticketValue - paidSats - SWEEP_FEE_BASE - SIDE_FEE - tickets * SWEEP_FEE_PER_TICKET;\n        int dollarsLeft = tx.inputs[1].tokenAmount - paidDollars;\n        int left = remaining - tickets;\n        require(tx.outputs[0].value == rest, \"the master keeps exactly what is left\");\n        if (left == 0) {\n            bytes creator = new LockingBytecodeP2PKH(unsafe_bytes20(master.slice(22, 42)));\n            require(tx.outputs[0].lockingBytecode == creator, \"after the last ticket the master's satoshis go to the creator\");\n            require(tx.outputs[0].tokenCategory == 0x, \"the master's NFT is burned\");\n            require(tx.outputs[1].lockingBytecode == creator, \"and what is left in the sidecar too\");\n            require(tx.outputs[1].tokenCategory == dollarCategory, \"in dollars\");\n            require(tx.outputs[1].tokenAmount == dollarsLeft, \"every dollar left\");\n            require(tx.outputs[1].value == tx.inputs[1].value, \"with the sidecar's dust\");\n        } else {\n            require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, \"the master carries on\");\n            require(tx.outputs[0].tokenCategory == category + 0x01, \"the master keeps its mutable NFT\");\n            require(tx.outputs[0].tokenAmount == 0, \"no fungible tokens on the master\");\n            require(\n                tx.outputs[0].nftCommitment == master.slice(0, 19) + toPaddedBytes(left, 3) + master.slice(22, 42),\n                \"only the tickets left change\"\n            );\n            require(requireSideOut(1, sideLockingBytecode, dollarCategory, dollarsLeft), \"the sidecar keeps the rest\");\n        }\n    }\n}\n",
  "fingerprint": "59509c2287698d8f7612a22ec6ac9c28aa102db7f525353cfdf708eb2d6b10bc",
  "debug": {
    "bytecode": "0605ffffffff00008900cf00ce5279517e8876517f75518876567f75557f778176529c78539c9b69c2529dc5009d00cb008a9d51557957795279c77b877bce7b879a6951cb008a9d78557f75517f775279577f75567f778153795d7f75577f7781547901137f755d7f7781557901167f7501137f7781c352946ea2697600a069c4c39d5c7a0052790120958088000000526576c39f766b6376cf78ce5e798878c75f798878cb008a9d76517f75538876557f75517f775b7988765c7f75577f7781005d79539c637877675279577f75567f77815c799c63785b79955a79967768685379c602fa00945479cd0376a914557901207f755c7f777e0288ac7e885479cc789d7800a0635479d1011479885479d352799d675479d100886857795579c693587a757c6b7c6b7c6b7c6b7c727b6c6c6c6c56797893577a757c6b7c6b7c6b7c727b6c6c6c5579527993567a757c6b7c6b7c727b6c6c547a8b7c6b7c727b6c6d6d686c91667500c6537a937b9402e80394022c0194527902fa00959451d07b94729400cc537a9d76009c630376a9145879012a7f7501167f777e0288ac7e00cd788800d1008851cd788851d15d798851d353799d51cc51c69d756700cd00c78800d15979517e8800d3009d00d2587901137f75527953807e5979012a7f7501167f777e88515b795d7954795379cd537a885279d17b8878d39dcc02e8039d5169686d6d6d6d6d6d51",
    "sourceMap": "70::70:41;;::::1;15:33:15:34:0;:23::49:1;16:26:16:27:0;:16::42:1;:46::54:0;;:57::61;:46:::1;:8::97;17:16:17:22:0;:32::33;:16::34:1;;:38::48;:8::77;18:24:18:30:0;:40::41;:24::42:1;;:37::38:0;:24::42:1;;:20::43;19:16:19:21:0;:25::38:1;:16;:42::47:0;:51::61:1;:42;:16;:8::92;20:16:20:26:0;:30::40:1;:8::82;21:16:21:27:0;:31::32;:8::63:1;22:26:22:27:0;:16::43:1;:47::61;;:8::81;23:23:23:24:0;:26::45;;:47::61;;:16::62:1;;;;;;;;;;:8::99;24:26:24:27:0;:16::43:1;:47::61;;:8::81;26:24:26:30:0;:40::41;:24::42:1;;:37::38:0;:24::42:1;;27:25:27:31:0;;:41::42;:25::43:1;;:38::39:0;:25::43:1;;:21::44;28:22:28:28:0;;:38::40;:22::41:1;;:35::36:0;:22::41:1;;:18::42;29:30:29:36:0;;:47::49;:30::50:1;;:43::45:0;:30::50:1;;:26::51;30:28:30:34:0;;:45::47;:28::48:1;;:41::43:0;:28::48:1;;:24::49;31:22:31:38:0;:41::42;:22:::1;32:16:32:36:0;::::1;:8::78;33:16:33:23:0;:26::27;:16:::1;:8::66;34:16:34:33:0;:37::53;:8::113:1;35:16:35:23:0;;:41::42;:44::51;;:54::74:1;:44;:27::75;:8::108;37:26:37:27:0;38:23:38:24;39:26:39:27;40:21:40:22;:8:69:9;:24:40:25;:28::44;:24:::1;;;:51:69:9:0;41:37:41:38;:27::53:1;42:30:42:31:0;:20::46:1;:50::58:0;;:12::103:1;43:30:43:31:0;:20::48:1;:52::73:0;;:12::116:1;44:30:44:31:0;:20::47:1;:51::65;;:12::85;45:20:45:26:0;:36::37;:20::38:1;;:42::52;:12::81;46:20:46:26:0;:36::37;:20::38:1;;:33::34:0;:20::38:1;;:42::49:0;;:12::86:1;47:28:47:34:0;:44::46;:28::47:1;;:41::42:0;:28::47:1;;:24::48;48::48:25:0;49:16:49:21;;:25::35:1;:16;:37:51:13:0;50:24:50:29;:16::30:1;51:19:53:13:0;:27:51:33;;:43::44;:27::45:1;;:40::41:0;:27::45:1;;:23::46;:50::56:0;;:23:::1;:58:53:13:0;52:24:52:29;:32::35;;:24:::1;:38::49:0;;:24:::1;:16::50;51:58:53:13;:19;54:33:54:34:0;;:23::41:1;:44::64;:23;56:27:56:28:0;;:16::45:1;:49::111:0;:89::95;;:106::108;:89::109:1;;:102::104:0;:89::109:1;;:49::111;;;55:12:58:14;59:31:59:32:0;;:20::39:1;:43::47:0;:12::107:1;60:16:60:21:0;:24::25;:16:::1;:27:63:13:0;61:35:61:36;;:24::51:1;:55::69:0;;:16::99:1;62:35:62:36:0;;:24::49:1;:53::58:0;;:16::77:1;63:19:65:13:0;64:35:64:36;;:24::51:1;:55::57:0;:16::87:1;63:19:65:13;66:26:66:37:0;;:50::51;;:40::58:1;:26;:12::59;;;;;;;;;;;;;;;;;;67:23:67:31:0;;:34::38;:23:::1;:12::39;;;;;;;;;;;;;;;68:26:68:37:0;;:40::45;;:26:::1;:12::46;;;;;;;;;;;;40:46:40:49;;;;;;;;;:51:69:9;;;;:8;;;71:29:71:30:0;:19::37:1;:40::51:0;;:19:::1;:54::62:0;:19:::1;:65::79;:19;:82::90;:19;:93::100:0;;:103::123:1;:93;:19;72:36:72:37:0;:26::50:1;:53::64:0;:26:::1;73:19:73:38:0;::::1;74:27:74:28:0;:16::35:1;:39::43:0;;:8::86:1;75:12:75:16:0;:20::21;:12:::1;:23:83:9:0;76:28:76:90;:68::74;;:85::87;:68::88:1;;:81::83:0;:68::88:1;;:28::90;;;77:31:77:32:0;:20::49:1;:53::60:0;:12::127:1;78:31:78:32:0;:20::47:1;:51::53:0;:12::85:1;79:31:79:32:0;:20::49:1;:53::60:0;:12::101:1;80:31:80:32:0;:20::47:1;:51::65:0;;:12::81:1;81:31:81:32:0;:20::45:1;:49::60:0;;:12::83:1;82:31:82:32:0;:20::39:1;:53::54:0;:43::61:1;:12::90;75:23:83:9;83:15:92::0;84:31:84:32;:20::49:1;:63::64:0;:53::81:1;:12::108;85:31:85:32:0;:20::47:1;:51::59:0;;:62::66;:51:::1;:12::104;86:31:86:32:0;:20::45:1;:49::50:0;:12::88:1;88:27:88:28:0;:16::43:1;:47::53:0;;:63::65;:47::66:1;;:83::87:0;;:89::90;:69::91:1;:47;:94::100:0;;:111::113;:94::114:1;;:107::109:0;:94::114:1;;:47;87:12:90:14;91:35:91:36:0;:38::57;;:59::73;;:75::86;;:20::87:1;;;;;;;;;;;;;;;;;;:12::119;83:15:92:9;14:34:93:5;;;;;;",
    "logs": [],
    "requires": [
      {
        "ip": 15,
        "line": 16,
        "message": "input 0 must be a round master"
      },
      {
        "ip": 21,
        "line": 17,
        "message": "not a master commitment"
      },
      {
        "ip": 37,
        "line": 19,
        "message": "the round has not settled"
      },
      {
        "ip": 40,
        "line": 20,
        "message": "lifecycle transactions are version 2"
      },
      {
        "ip": 43,
        "line": 21,
        "message": "sweep carries no locktime"
      },
      {
        "ip": 48,
        "line": 22,
        "message": "fixed sequence"
      },
      {
        "ip": 64,
        "line": 23,
        "message": "input 1 must be the pot sidecar"
      },
      {
        "ip": 69,
        "line": 24,
        "message": "fixed sequence"
      },
      {
        "ip": 118,
        "line": 32,
        "message": "more tickets than the round has left"
      },
      {
        "ip": 122,
        "line": 33,
        "message": "a sweep takes at least one ticket"
      },
      {
        "ip": 125,
        "line": 34,
        "message": "one payout per ticket, plus the master and the sidecar"
      },
      {
        "ip": 134,
        "line": 35,
        "message": "padding is fixed per ticket"
      },
      {
        "ip": 152,
        "line": 42,
        "message": "input must be a ticket of this category"
      },
      {
        "ip": 157,
        "line": 43,
        "message": "input must sit at the ticket contract"
      },
      {
        "ip": 162,
        "line": 44,
        "message": "fixed sequence"
      },
      {
        "ip": 168,
        "line": 45,
        "message": "not a ticket commitment"
      },
      {
        "ip": 178,
        "line": 46,
        "message": "ticket belongs to another round"
      },
      {
        "ip": 239,
        "line": 55,
        "message": "output pays the ticket's owner"
      },
      {
        "ip": 244,
        "line": 59,
        "message": "the ticket's dust comes back less its share of the fee"
      },
      {
        "ip": 254,
        "line": 61,
        "message": "the payout is in dollars"
      },
      {
        "ip": 260,
        "line": 62,
        "message": "payout amount"
      },
      {
        "ip": 266,
        "line": 64,
        "message": "a miss carries no tokens"
      },
      {
        "ip": 370,
        "line": 74,
        "message": "the master keeps exactly what is left"
      },
      {
        "ip": 390,
        "line": 77,
        "message": "after the last ticket the master's satoshis go to the creator"
      },
      {
        "ip": 394,
        "line": 78,
        "message": "the master's NFT is burned"
      },
      {
        "ip": 398,
        "line": 79,
        "message": "and what is left in the sidecar too"
      },
      {
        "ip": 403,
        "line": 80,
        "message": "in dollars"
      },
      {
        "ip": 408,
        "line": 81,
        "message": "every dollar left"
      },
      {
        "ip": 413,
        "line": 82,
        "message": "with the sidecar's dust"
      },
      {
        "ip": 420,
        "line": 84,
        "message": "the master carries on"
      },
      {
        "ip": 427,
        "line": 85,
        "message": "the master keeps its mutable NFT"
      },
      {
        "ip": 431,
        "line": 86,
        "message": "no fungible tokens on the master"
      },
      {
        "ip": 453,
        "line": 87,
        "message": "only the tickets left change"
      },
      {
        "ip": 466,
        "line": 91,
        "message": "the sidecar goes back to the sidecar contract"
      },
      {
        "ip": 471,
        "line": 91,
        "message": "a sidecar holds only the dollar token"
      },
      {
        "ip": 474,
        "line": 91,
        "message": "the sidecar's dollars must be exact"
      },
      {
        "ip": 477,
        "line": 91,
        "message": "a sidecar carries the fixed dust"
      },
      {
        "ip": 479,
        "line": 91,
        "message": "the sidecar keeps the rest"
      }
    ],
    "sourceTags": "324:332:fu;333:334:sc;335:338:lc;339:339:sc;410:410:sc",
    "functions": [
      {
        "id": 0,
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
        "name": "SWEEP_PAD_PER_TICKET",
        "kind": "constant",
        "inputs": [],
        "bytecode": "0120",
        "sourceMap": "64:36:64:38",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "TAG_TICKET",
        "kind": "constant",
        "inputs": [],
        "bytecode": "53",
        "sourceMap": "9:28:9:32",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "SWEEP_FEE_PER_TICKET",
        "kind": "constant",
        "inputs": [],
        "bytecode": "02fa00",
        "sourceMap": "62:36:62:39",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "SWEEP_FEE_BASE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "02e803",
        "sourceMap": "61:30:61:34",
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
      }
    ],
    "sources": {
      "dollar.cash": "pragma cashscript ^0.14.0;\n\nimport \"./rules.cash\";\n\n// Dollar events: stakes and payouts in a dollar token (ParyonUSD on mainnet, 2 decimals) instead of satoshis.\n// A coin carries one token category, and gates and masters are NFTs of category K, so a round's dollars sit beside\n// them in sidecars (TokenSide.cash): one per gate, merged into one beside the master at the lock. Every number here is\n// mirrored in packages/sdk/src/round/dollar.ts; change both together.\n\n// The dollar stake class (high nibble of the gate's class byte) and its bounds, in token units (cents).\nint constant CLASS_DOLLAR = 3;\nint constant DOLLAR_MIN_STAKE = 10;\nint constant DOLLAR_MAX_STAKE = 5000;\nint constant DOLLAR_GATE_CAP = 100000;\n// A token output cannot be empty, so every sidecar is made holding this much; the lock counts the rest as pot, and\n// the seeds go back to the creator after the last payout (like gate dust).\nint constant SIDE_SEED = 1;\n// Satoshis every sidecar, and every dollar fee output, carries.\nint constant TOKEN_DUST = 1000;\n// A dollar lock spends a sidecar per gate as well as the gate: measured ~2,160 bytes plus ~920 per gate (2 gates:\n// ~4,000 bytes), and gold adds ~300; these fees keep every lock above 1 sat/byte.\nint constant DOLLAR_LOCK_FEE_BASE = 2800;\nint constant DOLLAR_LOCK_FEE_PER_GATE = 1100;\n// Settle and sweep spend the pot sidecar too.\nint constant SIDE_FEE = 300;\n// Dollar fees are paid from one cent (an output's dust is paid from the round's budget, not from the pot).\nint constant MIN_DOLLAR_FEE = 1;\n\n// Input `index` is a sidecar: at the sidecar contract, holding only the dollar token (no NFT).\nfunction isSide(int index, bytes sideLockingBytecode, bytes32 dollarCategory) returns (bool) {\n    return tx.inputs[index].lockingBytecode == sideLockingBytecode && tx.inputs[index].tokenCategory == dollarCategory;\n}\n\n// Output `index` is a sidecar holding exactly `amount` of the dollar token and TOKEN_DUST satoshis.\nfunction requireSideOut(int index, bytes sideLockingBytecode, bytes32 dollarCategory, int amount) returns (bool) {\n    require(tx.outputs[index].lockingBytecode == sideLockingBytecode, \"the sidecar goes back to the sidecar contract\");\n    require(tx.outputs[index].tokenCategory == dollarCategory, \"a sidecar holds only the dollar token\");\n    require(tx.outputs[index].tokenAmount == amount, \"the sidecar's dollars must be exact\");\n    require(tx.outputs[index].value == TOKEN_DUST, \"a sidecar carries the fixed dust\");\n    return true;\n}\n\n// No input from `from` on, and no output from `fromOutput` on, may sit at the sidecar contract. Right after a round\n// is made all its sidecars share the creating transaction, so without this an entry could pass a sibling sidecar as\n// \"funding\" and drain it, or leave a fake sidecar as \"change\" to swap in at the lock; either would freeze the round.\nfunction requireNoOtherSides(int from, int fromOutput, bytes sideLockingBytecode) returns (bool) {\n    for (int i = from; i < tx.inputs.length; i++) {\n        require(tx.inputs[i].lockingBytecode != sideLockingBytecode, \"no other sidecar may be spent here\");\n    }\n    for (int o = fromOutput; o < tx.outputs.length; o++) {\n        require(tx.outputs[o].lockingBytecode != sideLockingBytecode, \"no other sidecar may be made here\");\n    }\n    return true;\n}\n",
      "rules.cash": "pragma cashscript ^0.14.0;\n\n// Jōge's shared rules: NFT tags, round states, stake classes and fixed lifecycle fees.\n// Every number here is mirrored in packages/sdk/src/round/constants.ts; change both together.\n\n// First byte of every commitment of category K.\nbytes constant TAG_MASTER = 0x01;\nbytes constant TAG_GATE = 0x02;\nbytes constant TAG_TICKET = 0x03;\n\n// Master state byte (offset 5).\nbytes constant STATE_OPEN = 0x00;\nbytes constant STATE_LOCKED = 0x01;\nint constant STATE_SETTLED = 2;\nint constant STATE_VOID = 3;\n\n// Assets: index into the oracle table. Gold needs two feeds (USD/BCH and XAU/BCH).\nint constant ASSET_BTC = 0;\nint constant ASSET_ETH = 1;\nint constant ASSET_BCH = 2;\nint constant ASSET_GOLD = 3;\n// USD/BCH is in cents, XAU/BCH in ounces × 100000, so usd × 10^7 ÷ xau is dollars per ounce × 10^4.\nint constant GOLD_FACTOR = 10000000;\n\n// Modes (high nibble of the mode byte); outcomes are the low nibble.\nint constant MODE_UPDOWN = 0;\nint constant MODE_RANGES = 1;\nint constant NIBBLE = 16;\nint constant MAX_OUTCOMES = 6;\n\n// Stake classes (high nibble of the gate's class byte): satoshi bounds per entry and per gate.\nint constant CLASS_SHORT = 0;\nint constant CLASS_HOURLY = 1;\nint constant CLASS_EVENT = 2;\nint constant MIN_STAKE = 5000;\nint constant SHORT_MAX_STAKE = 500000;\nint constant HOURLY_MAX_STAKE = 5000000;\nint constant EVENT_MAX_STAKE = 25000000;\nint constant SHORT_GATE_CAP = 10000000;\nint constant HOURLY_GATE_CAP = 100000000;\nint constant EVENT_GATE_CAP = 500000000;\n\n// Fees and dust (satoshis). Lifecycle fees are fixed so every client builds the same bytes; calibrated in S00 from\n// measured sizes (gold settle ~1,840 B, gold lock with one gate ~1,940 B, ~190 B per swept P2SH32 ticket) with headroom.\n// P2S tickets carry their ~112-byte script in the output: dust is 444 + 3 × ~188 B ≈ 1,008 sats, so 1,200.\nint constant TICKET_DUST = 1200;\n// Every gate is created holding exactly this; the lock counts anything beyond it as pot.\nint constant GATE_DUST = 1000;\n// An event entrant may leave before the lock; this share of the stake stays in the gate and joins the winners' pot.\nint constant EVENT_EXIT_FEE_BPS = 300;\n// P2PKH unlocking bytecode: 0x41 push, 64-byte Schnorr signature, then the sighash byte.\nbytes constant SIGNATURE_PUSH = 0x41;\nint constant SIGHASH_BYTE = 65;\nint constant MIN_FEE_OUTPUT = 1000;\nint constant LOCK_FEE_BASE = 1600;\nint constant LOCK_FEE_PER_GATE = 700;\n// An event gate's script is nearly twice a lane gate's (~690 bytes per merged gate, measured 2026-11-17: a 2-gate event\n// lock is ~3,090 bytes, which 1,600 + 2 × 700 could not pay), so events pay more per gate.\nint constant EVENT_LOCK_FEE_PER_GATE = 1100;\nint constant SETTLE_FEE = 2200;\nint constant SWEEP_FEE_BASE = 1000;\nint constant SWEEP_FEE_PER_TICKET = 250;\n// Each swept ticket costs ~20,000 operation-cost units; 32 padding bytes buy 25,600 (measured in S00).\nint constant SWEEP_PAD_PER_TICKET = 32;\nint constant PROTOCOL_FEE_BPS = 200;\nint constant MAX_CREATOR_FEE_BPS = 300;\nint constant BPS = 10000;\n\n// Lifecycle transactions take every input at this sequence; the SDK default (0xfffffffe) would allow a second variant.\nint constant FINAL_SEQUENCE = 4294967295;\n// Timeout paths need a non-final sequence so the node enforces their locktime.\nint constant TIMEOUT_SEQUENCE = 4294967294;\nint constant TX_VERSION = 2;\n// After T_close, how long settlement has before anyone may void the round (MTP lags about an hour on mainnet).\nint constant SETTLE_TIMEOUT = 21600;\n\nfunction maxStake(int stakeClass) returns (int) {\n    require(stakeClass >= CLASS_SHORT && stakeClass <= CLASS_EVENT, \"unknown stake class\");\n    int limit = SHORT_MAX_STAKE;\n    if (stakeClass == CLASS_HOURLY) {\n        limit = HOURLY_MAX_STAKE;\n    } else if (stakeClass == CLASS_EVENT) {\n        limit = EVENT_MAX_STAKE;\n    }\n    return limit;\n}\n\nfunction gateCap(int stakeClass) returns (int) {\n    int cap = SHORT_GATE_CAP;\n    if (stakeClass == CLASS_HOURLY) {\n        cap = HOURLY_GATE_CAP;\n    } else if (stakeClass == CLASS_EVENT) {\n        cap = EVENT_GATE_CAP;\n    }\n    return cap;\n}\n\n// Gold in ten-thousandths of a US dollar per ounce, from the USD/BCH and XAU/BCH prices of the same minute.\nfunction goldPrice(int usdPerBch, int xauPerBch) returns (int) {\n    return usdPerBch * GOLD_FACTOR / xauPerBch;\n}\n"
    },
    "inlineRanges": "20:20:TAG_MASTER;31:31:STATE_SETTLED;34:34:STATE_VOID;39:39:TX_VERSION;54:63:isSide;131:131:SWEEP_PAD_PER_TICKET;167:167:TAG_TICKET;190:190:STATE_VOID;222:222:SWEEP_FEE_PER_TICKET;351:351:SWEEP_FEE_BASE;353:353:SIDE_FEE;357:357:SWEEP_FEE_PER_TICKET;461:478:requireSideOut"
  },
  "compiler": {
    "name": "cashc",
    "version": "0.14.0",
    "options": {
      "enforceFunctionParameterTypes": true,
      "enforceLocktimeGuard": false
    }
  },
  "updatedAt": "2026-11-18T19:51:45.207Z"
} as const;
