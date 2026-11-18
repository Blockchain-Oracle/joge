export default {
  "contractName": "EventGate",
  "constructorInputs": [
    {
      "name": "category",
      "type": "bytes32"
    },
    {
      "name": "ticketLockingBytecode",
      "type": "bytes"
    }
  ],
  "abi": [
    {
      "name": "enter",
      "inputs": [
        {
          "name": "outcome",
          "type": "int"
        },
        {
          "name": "stake",
          "type": "int"
        },
        {
          "name": "payoutPkh",
          "type": "bytes20"
        }
      ]
    },
    {
      "name": "merge",
      "inputs": []
    },
    {
      "name": "exit",
      "inputs": []
    }
  ],
  "bytecode": "OP_2 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_5 OP_ROLL OP_SIZE 14 OP_EQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_SWAP OP_ROT OP_2ROT OP_SWAP OP_4 OP_ROLL OP_0 OP_UTXOTOKENCATEGORY OP_5 OP_PICK OP_2 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_1 OP_SPLIT OP_DROP OP_2 OP_EQUALVERIFY OP_DUP OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_DUP OP_16 OP_DIV OP_SWAP OP_16 OP_MOD OP_5 OP_PICK OP_0 OP_ROT OP_WITHIN OP_VERIFY OP_3 OP_PICK 8813 OP_2 OP_PICK OP_DUP OP_0 OP_GREATERTHANOREQUAL OP_OVER OP_2 OP_LESSTHANOREQUAL OP_BOOLAND OP_VERIFY 20a107 OP_OVER OP_1 OP_NUMEQUAL OP_IF 404b4c OP_NIP OP_ELSE OP_OVER OP_2 OP_NUMEQUAL OP_IF 40787d01 OP_NIP OP_ENDIF OP_ENDIF OP_NIP OP_1ADD OP_WITHIN OP_VERIFY OP_10 OP_5 OP_PICK OP_5 OP_MUL OP_ADD OP_2 OP_PICK OP_OVER OP_5 OP_ADD OP_SPLIT OP_DROP OP_OVER OP_SPLIT OP_NIP OP_BIN2NUM OP_3 OP_PICK OP_10 OP_SPLIT OP_DROP OP_7 OP_SPLIT OP_NIP OP_BIN2NUM OP_4 OP_PICK OP_7 OP_SPLIT OP_DROP OP_SWAP OP_1ADD OP_3 OP_NUM2BIN OP_CAT OP_4 OP_PICK OP_3 OP_PICK OP_SPLIT OP_DROP OP_10 OP_SPLIT OP_NIP OP_CAT OP_SWAP OP_6 OP_PICK OP_ADD OP_5 OP_NUM2BIN OP_CAT OP_3 OP_PICK OP_4 OP_PICK OP_SIZE OP_NIP OP_SPLIT OP_DROP OP_ROT OP_5 OP_ADD OP_SPLIT OP_NIP OP_CAT OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_8 OP_PICK OP_2 OP_CAT OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_5 OP_PICK OP_ADD OP_NUMEQUALVERIFY OP_0 OP_OUTPUTVALUE OP_SWAP 80969800 OP_OVER OP_1 OP_NUMEQUAL OP_IF 00e1f505 OP_NIP OP_ELSE OP_OVER OP_2 OP_NUMEQUAL OP_IF 0065cd1d OP_NIP OP_ENDIF OP_ENDIF OP_NIP OP_LESSTHANOREQUAL OP_VERIFY OP_3 OP_SWAP OP_6 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_CAT OP_3 OP_ROLL OP_1 OP_NUM2BIN OP_CAT OP_ROT OP_5 OP_NUM2BIN OP_CAT OP_SWAP OP_CAT OP_1 OP_OUTPUTBYTECODE OP_ROT OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENCATEGORY OP_ROT OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_1 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE b004 OP_NUMEQUALVERIFY OP_TXOUTPUTCOUNT OP_3 OP_LESSTHANOREQUAL OP_VERIFY OP_1 OP_TXOUTPUTCOUNT OP_3 OP_NUMEQUAL OP_IF OP_2 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUAL OP_NIP OP_ENDIF OP_1 OP_BEGIN OP_DUP OP_TXINPUTCOUNT OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_DUP OP_UTXOTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_1ADD OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_VERIFY OP_DROP OP_1 OP_ELSE OP_2 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_INPUTINDEX OP_UTXOTOKENCOMMITMENT OP_0 OP_UTXOTOKENCOMMITMENT OP_0 OP_UTXOTOKENCATEGORY OP_3 OP_ROLL OP_1 OP_CAT OP_EQUALVERIFY OP_DUP OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUALVERIFY OP_DUP OP_6 OP_SPLIT OP_DROP OP_5 OP_SPLIT OP_NIP 00 OP_EQUALVERIFY OP_5 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_SWAP OP_5 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_EQUALVERIFY OP_2DROP OP_1 OP_ELSE OP_ROT OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_2 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_1 OP_SPLIT OP_DROP OP_2 OP_EQUALVERIFY OP_DUP OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_16 OP_DIV OP_2 OP_NUMEQUALVERIFY OP_1 OP_UTXOTOKENCOMMITMENT OP_1 OP_UTXOTOKENCATEGORY OP_3 OP_PICK OP_EQUALVERIFY OP_1 OP_UTXOBYTECODE OP_4 OP_ROLL OP_EQUALVERIFY OP_DUP OP_1 OP_SPLIT OP_DROP OP_3 OP_EQUALVERIFY OP_DUP OP_6 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_2 OP_PICK OP_6 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_EQUALVERIFY 76a914 OP_OVER 20 OP_SPLIT OP_DROP OP_12 OP_SPLIT OP_NIP OP_CAT 88ac OP_CAT OP_2 OP_INPUTBYTECODE OP_2 OP_UTXOBYTECODE OP_2 OP_PICK OP_EQUALVERIFY OP_2 OP_UTXOTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_DUP OP_1 OP_SPLIT OP_DROP 41 OP_EQUALVERIFY 41 OP_1ADD OP_SPLIT OP_DROP 41 OP_SPLIT OP_NIP OP_DUP 41 OP_EQUAL OP_SWAP 61 OP_EQUAL OP_BOOLOR OP_VERIFY OP_TXINPUTCOUNT OP_3 OP_NUMEQUALVERIFY OP_OVER OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_ROT OP_12 OP_SPLIT OP_DROP OP_7 OP_SPLIT OP_NIP OP_BIN2NUM OP_10 OP_ROT OP_5 OP_MUL OP_ADD OP_3 OP_PICK OP_OVER OP_5 OP_ADD OP_SPLIT OP_DROP OP_OVER OP_SPLIT OP_NIP OP_BIN2NUM OP_4 OP_PICK OP_10 OP_SPLIT OP_DROP OP_7 OP_SPLIT OP_NIP OP_BIN2NUM OP_OVER OP_4 OP_PICK OP_GREATERTHANOREQUAL OP_OVER OP_0 OP_GREATERTHAN OP_BOOLAND OP_VERIFY OP_5 OP_PICK OP_7 OP_SPLIT OP_DROP OP_SWAP OP_1SUB OP_3 OP_NUM2BIN OP_CAT OP_5 OP_PICK OP_3 OP_PICK OP_SPLIT OP_DROP OP_10 OP_SPLIT OP_NIP OP_CAT OP_SWAP OP_3 OP_PICK OP_SUB OP_5 OP_NUM2BIN OP_CAT OP_4 OP_PICK OP_5 OP_ROLL OP_SIZE OP_NIP OP_SPLIT OP_DROP OP_ROT OP_5 OP_ADD OP_SPLIT OP_NIP OP_CAT OP_OVER 2c01 OP_MUL 1027 OP_DIV OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_5 OP_ROLL OP_2 OP_CAT OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTTOKENCOMMITMENT OP_ROT OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_3 OP_PICK OP_SUB OP_2 OP_PICK OP_ADD OP_NUMEQUALVERIFY OP_1 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_ROT OP_ROT OP_SUB OP_1 OP_UTXOVALUE OP_ADD OP_NUMEQUALVERIFY OP_1 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_1 OP_TXOUTPUTCOUNT OP_3 OP_NUMEQUAL OP_IF OP_2 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUAL OP_NIP OP_ENDIF OP_TXOUTPUTCOUNT OP_3 OP_LESSTHANOREQUAL OP_BOOLAND OP_ENDIF OP_ENDIF",
  "source": "pragma cashscript ^0.14.0;\n\nimport \"./entry.cash\";\n\n// An event's entry gate: the same as Gate, plus `exit` — an entrant may leave before the lock (event stake class only).\ncontract EventGate(bytes32 category, bytes ticketLockingBytecode) {\n    function enter(int outcome, int stake, bytes20 payoutPkh) {\n        require(this.activeInputIndex == 0, \"the gate must be input 0\");\n        require(requireEntry(category, ticketLockingBytecode, outcome, stake, payoutPkh), \"entry must be exact\");\n    }\n\n    function merge() {\n        require(requireMerge(category, tx.inputs[this.activeInputIndex].nftCommitment), \"only the round's own lock merges a gate\");\n    }\n\n    // An event entrant leaves before the lock: input 1 is their ticket from this gate, input 2 a coin from the ticket's\n    // payout address signed with SIGHASH_ALL (so no old, partial signature can be replayed into an exit). Output 0 is\n    // the gate without that stake (the exit fee stays behind for the winners), output 1 the refund to the owner.\n    function exit() {\n        require(this.activeInputIndex == 0, \"the gate must be input 0\");\n        require(tx.inputs[0].tokenCategory == category + 0x02, \"input 0 must be a gate\");\n        bytes state = tx.inputs[0].nftCommitment;\n        require(state.slice(0, 1) == TAG_GATE, \"not a gate commitment\");\n        require(int(state.slice(6, 7)) / NIBBLE == CLASS_EVENT, \"only events allow leaving before the lock\");\n\n        bytes ticket = tx.inputs[1].nftCommitment;\n        require(tx.inputs[1].tokenCategory == category, \"input 1 must be a ticket of this category\");\n        require(tx.inputs[1].lockingBytecode == ticketLockingBytecode, \"input 1 must sit at the ticket contract\");\n        require(ticket.slice(0, 1) == TAG_TICKET, \"not a ticket commitment\");\n        require(ticket.slice(1, 6) == state.slice(1, 6), \"the ticket belongs to another round or gate\");\n        bytes owner = new LockingBytecodeP2PKH(unsafe_bytes20(ticket.slice(12, 32)));\n\n        bytes ownerUnlock = tx.inputs[2].unlockingBytecode;\n        require(tx.inputs[2].lockingBytecode == owner, \"the ticket's owner must co-sign\");\n        require(tx.inputs[2].tokenCategory == 0x, \"the owner's coin carries no tokens\");\n        require(ownerUnlock.slice(0, 1) == SIGNATURE_PUSH, \"the owner signs with Schnorr\");\n        bytes sighash = ownerUnlock.slice(SIGHASH_BYTE, SIGHASH_BYTE + 1);\n        require(sighash == 0x41 || sighash == 0x61, \"the owner's signature must cover every output\");\n        require(tx.inputs.length == 3, \"gate, ticket and the owner's coin only\");\n\n        int outcome = int(ticket.slice(6, 7));\n        int stake = int(ticket.slice(7, 12));\n        int start = 10 + outcome * 5;\n        int total = int(state.slice(start, start + 5));\n        int entrants = int(state.slice(7, 10));\n        require(total >= stake && entrants > 0, \"the gate holds this entry\");\n        bytes next = state.slice(0, 7) + toPaddedBytes(entrants - 1, 3) + state.slice(10, start)\n            + toPaddedBytes(total - stake, 5) + state.slice(start + 5, state.length);\n        int fee = stake * EVENT_EXIT_FEE_BPS / BPS;\n\n        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, \"gate must come back to itself\");\n        require(tx.outputs[0].tokenCategory == category + 0x02, \"gate keeps its minting NFT\");\n        require(tx.outputs[0].tokenAmount == 0, \"no fungible tokens\");\n        require(tx.outputs[0].nftCommitment == next, \"gate totals must drop this stake\");\n        require(tx.outputs[0].value == tx.inputs[0].value - stake + fee, \"the exit fee stays in the gate\");\n        require(tx.outputs[1].lockingBytecode == owner, \"the refund goes to the ticket's owner\");\n        require(tx.outputs[1].value == stake - fee + tx.inputs[1].value, \"refund: stake minus the exit fee, plus the ticket's dust\");\n        require(tx.outputs[1].tokenCategory == 0x, \"the refund carries no tokens\");\n        bool changeIsPlain = true;\n        if (tx.outputs.length == 3) {\n            changeIsPlain = tx.outputs[2].tokenCategory == 0x;\n        }\n        require(tx.outputs.length <= 3 && changeIsPlain, \"at most gate, refund and the owner's change\");\n    }\n}\n",
  "fingerprint": "23c7e78c8234a00357af2971da739ef24a1a679fd70daa181be1ad4b456a03f8",
  "debug": {
    "bytecode": "5279009c63557a82011488c0009d7c7b717c547a00ce5579527e8800cf76517f75528876577f75567f77817660967c60975579007ba569537902881352797600a27852a19a690320a10778519c6303404b4c776778529c630440787d01776868778ba5695a557955959352797855937f75787f778153795a7f75577f77815479577f757c8b53807e547953797f755a7f777e7c56799355807e5379547982777f757b55937f777e00cd00c78800d15879527e8800d3009d00d28800cc00c65579939d00cc7c048096980078519c630400e1f505776778529c63040065cd1d77686877a169537c567f75517f777e537a51807e7b55807e7c7e51cd7b8851d17b8851d3009d51d28851cc02b0049dc453a16951c4539c6352d100877768516576c39f766b6376ce00888b686c916675697551675279519c63c0cf00cf00ce537a517e8876517f75518876567f75557f77010088557f75517f777c557f75517f77886d51677b529dc0009d00ce78527e8800cf76517f75528876577f75567f77816096529d51cf51ce53798851c7547a8876517f75538876567f75517f775279567f75517f77880376a9147801207f755c7f777e0288ac7e52ca52c752798852ce008876517f7501418801418b7f7501417f77760141877c0161879b69c3539d78577f75567f77817b5c7f75577f77815a7b55959353797855937f75787f778154795a7f75577f7781785479a27800a09a695579577f757c8c53807e557953797f755a7f777e7c53799455807e5479557a82777f757b55937f777e78022c01950210279600cd00c78800d1557a527e8800d3009d00d27b8800cc00c65379945279939d51cd537a8851cc7b7b9451c6939d51d1008851c4539c6352d100877768c453a19a6868",
    "sourceMap": "7:4:10:5;;;;;:43:7:60;;;;;8:16:8:37;:41::42;:8::72:1;9:29:9:37:0;:39::60;:62::76;;:78::87;;:16::88:1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;7:62:10:5;;:4;12::14::0;;;;;13:49:13:70;:39::85:1;:16::86;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;12:21:14:5;;:4;19::64::0;;;20:16:20:37;:41::42;:8::72:1;21:26:21:27:0;:16::42:1;:46::54:0;:57::61;:46:::1;:8::89;22:32:22:33:0;:22::48:1;23:16:23:21:0;:31::32;:16::33:1;;:37::45;:8::72;24:20:24:25:0;:35::36;:20::37:1;;:32::33:0;:20::37:1;;:16::38;:41::47;:16;:51::62;:8::109;26:33:26:34:0;:23::49:1;27:26:27:27:0;:16::42:1;:46::54:0;;:8::101:1;28:26:28:27:0;:16::44:1;:48::69:0;;:8::114:1;29:16:29:22:0;:32::33;:16::34:1;;:38::48;:8::77;30:16:30:22:0;:32::33;:16::34:1;;:29::30:0;:16::34:1;;:38::43:0;;:53::54;:38::55:1;;:50::51:0;:38::55:1;;:8::104;31:22:31:84:0;:62::68;:79::81;:62::82:1;;:75::77:0;:62::82:1;;:22::84;;;33:38:33:39:0;:28::58:1;34:26:34:27:0;:16::44:1;:48::53:0;;:8::90:1;35:26:35:27:0;:16::42:1;:46::48:0;:8::88:1;36:16:36:27:0;:37::38;:16::39:1;;:43::57;:8::91;37:56:37:68;:::72;:24::73;;:42::54;:24::73;;38:16:38:23:0;:27::31;:16:::1;:35::42:0;:46::50;:35:::1;:16;:8::101;39:16:39:32:0;:36::37;:8::81:1;41:26:41:32:0;:42::43;:26::44:1;;:39::40:0;:26::44:1;;:22::45;42:24:42:30:0;:40::42;:24::43:1;;:37::38:0;:24::43:1;;:20::44;43::43:22:0;:25::32;:35::36;:25:::1;:20;44:24:44:29:0;;:43::48;:51::52;:43:::1;:24::53;;:36::41:0;:24::53:1;;:20::54;45:27:45:32:0;;:42::44;:27::45:1;;:39::40:0;:27::45:1;;:23::46;46:16:46:21:0;:25::30;;:16:::1;:34::42:0;:45::46;:34:::1;:16;:8::77;47:21:47:26:0;;:36::37;:21::38:1;;:55::63:0;:::67:1;:69::70:0;:41::71:1;:21;:74::79:0;;:90::95;;:74::96:1;;:86::88:0;:74::96:1;;:21;48:28:48:33:0;:36::41;;:28:::1;:43::44:0;:14::45:1;47:21;48:48::53:0;;:71::76;;:::83:1;;:48::84;;:60::65:0;:68::69;:60:::1;:48::84;;47:21;49:18:49:23:0;:26::44:1;:18;:47::50;:18;51:27:51:28:0;:16::45:1;:59::60:0;:49::77:1;:8::112;52:27:52:28:0;:16::43:1;:47::55:0;;:58::62;:47:::1;:8::94;53:27:53:28:0;:16::41:1;:45::46:0;:8::70:1;54:27:54:28:0;:16::43:1;:47::51:0;:8::89:1;55:27:55:28:0;:16::35:1;:49::50:0;:39::57:1;:60::65:0;;:39:::1;:68::71:0;;:39:::1;:8::107;56:27:56:28:0;:16::45:1;:49::54:0;;:8::97:1;57:27:57:28:0;:16::35:1;:39::44:0;:47::50;:39:::1;:63::64:0;:53::71:1;:39;:8::133;58:27:58:28:0;:16::43:1;:47::49:0;:8::83:1;59:29:59:33:0;60:12:60:29;:33::34;:12:::1;:36:62:9:0;61:39:61:40;:28::55:1;:59::61:0;:28:::1;:12::62;60:36:62:9;63:16:63:33:0;:37::38;:16:::1;:8::104;6:0:65:1;",
    "logs": [],
    "requires": [
      {
        "ip": 14,
        "line": 8,
        "message": "the gate must be input 0"
      },
      {
        "ip": 27,
        "line": 9,
        "message": "input 0 must be a gate"
      },
      {
        "ip": 35,
        "line": 9,
        "message": "not a gate commitment"
      },
      {
        "ip": 55,
        "line": 9,
        "message": "no such outcome"
      },
      {
        "ip": 68,
        "line": 9,
        "message": "unknown stake class"
      },
      {
        "ip": 88,
        "line": 9,
        "message": "stake outside this round's bounds"
      },
      {
        "ip": 160,
        "line": 9,
        "message": "gate must come back to itself"
      },
      {
        "ip": 167,
        "line": 9,
        "message": "gate keeps its minting NFT"
      },
      {
        "ip": 171,
        "line": 9,
        "message": "no fungible tokens"
      },
      {
        "ip": 174,
        "line": 9,
        "message": "gate totals must add this stake"
      },
      {
        "ip": 182,
        "line": 9,
        "message": "gate must hold the stake"
      },
      {
        "ip": 204,
        "line": 9,
        "message": "gate is full"
      },
      {
        "ip": 228,
        "line": 9,
        "message": "output 1 must be the ticket"
      },
      {
        "ip": 232,
        "line": 9,
        "message": "ticket is an immutable NFT of the round's category"
      },
      {
        "ip": 236,
        "line": 9,
        "message": "no fungible tokens"
      },
      {
        "ip": 239,
        "line": 9,
        "message": "ticket must record round, gate, outcome, stake and payee"
      },
      {
        "ip": 243,
        "line": 9,
        "message": "ticket carries the fixed dust"
      },
      {
        "ip": 247,
        "line": 9,
        "message": "at most gate, ticket and change"
      },
      {
        "ip": 270,
        "line": 9,
        "message": "funding inputs carry no tokens"
      },
      {
        "ip": 277,
        "line": 9,
        "message": "change carries no tokens"
      },
      {
        "ip": 279,
        "line": 9,
        "message": "entry must be exact"
      },
      {
        "ip": 296,
        "line": 13,
        "message": "input 0 must be the round master"
      },
      {
        "ip": 302,
        "line": 13,
        "message": "not a master commitment"
      },
      {
        "ip": 311,
        "line": 13,
        "message": "the round is not open"
      },
      {
        "ip": 325,
        "line": 13,
        "message": "the master belongs to another round"
      },
      {
        "ip": 326,
        "line": 13,
        "message": "only the round's own lock merges a gate"
      },
      {
        "ip": 334,
        "line": 20,
        "message": "the gate must be input 0"
      },
      {
        "ip": 340,
        "line": 21,
        "message": "input 0 must be a gate"
      },
      {
        "ip": 348,
        "line": 23,
        "message": "not a gate commitment"
      },
      {
        "ip": 360,
        "line": 24,
        "message": "only events allow leaving before the lock"
      },
      {
        "ip": 367,
        "line": 27,
        "message": "input 1 must be a ticket of this category"
      },
      {
        "ip": 372,
        "line": 28,
        "message": "input 1 must sit at the ticket contract"
      },
      {
        "ip": 378,
        "line": 29,
        "message": "not a ticket commitment"
      },
      {
        "ip": 394,
        "line": 30,
        "message": "the ticket belongs to another round or gate"
      },
      {
        "ip": 412,
        "line": 34,
        "message": "the ticket's owner must co-sign"
      },
      {
        "ip": 416,
        "line": 35,
        "message": "the owner's coin carries no tokens"
      },
      {
        "ip": 422,
        "line": 36,
        "message": "the owner signs with Schnorr"
      },
      {
        "ip": 437,
        "line": 38,
        "message": "the owner's signature must cover every output"
      },
      {
        "ip": 440,
        "line": 39,
        "message": "gate, ticket and the owner's coin only"
      },
      {
        "ip": 490,
        "line": 46,
        "message": "the gate holds this entry"
      },
      {
        "ip": 541,
        "line": 51,
        "message": "gate must come back to itself"
      },
      {
        "ip": 548,
        "line": 52,
        "message": "gate keeps its minting NFT"
      },
      {
        "ip": 552,
        "line": 53,
        "message": "no fungible tokens"
      },
      {
        "ip": 556,
        "line": 54,
        "message": "gate totals must drop this stake"
      },
      {
        "ip": 567,
        "line": 55,
        "message": "the exit fee stays in the gate"
      },
      {
        "ip": 572,
        "line": 56,
        "message": "the refund goes to the ticket's owner"
      },
      {
        "ip": 581,
        "line": 57,
        "message": "refund: stake minus the exit fee, plus the ticket's dust"
      },
      {
        "ip": 585,
        "line": 58,
        "message": "the refund carries no tokens"
      },
      {
        "ip": 601,
        "line": 63,
        "message": "at most gate, refund and the owner's change"
      }
    ],
    "sourceTags": "5:9:pv;83:83:sc;200:200:sc;269:269:fu;270:273:lc;274:274:sc",
    "functions": [
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
        "name": "MIN_STAKE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "028813",
        "sourceMap": "35:25:35:29",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "CLASS_SHORT",
        "kind": "constant",
        "inputs": [],
        "bytecode": "00",
        "sourceMap": "32:27:32:28",
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
        "name": "SHORT_MAX_STAKE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "0320a107",
        "sourceMap": "36:31:36:37",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "CLASS_HOURLY",
        "kind": "constant",
        "inputs": [],
        "bytecode": "51",
        "sourceMap": "33:28:33:29",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "HOURLY_MAX_STAKE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "03404b4c",
        "sourceMap": "37:32:37:39",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "EVENT_MAX_STAKE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "0440787d01",
        "sourceMap": "38:31:38:39",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "maxStake",
        "inputs": [
          {
            "name": "stakeClass",
            "type": "int"
          }
        ],
        "bytecode": "7600a27852a19a690320a10778519c6303404b4c776778529c630440787d0177686877",
        "sourceMap": "78:12:78:22;:26::37:1;:12;:41::51:0;:55::66:1;:41;:12;:4::91;79:16:79:31;80:8:80:18:0;:22::34:1;:8;:36:82:5:0;81:16:81:32:1;:8::33;82:11:84:5:0;:15:82:25;:29::40:1;:15;:42:84:5:0;83:16:83:31:1;:8::32;82:42:84:5;:11;77:48:86:1",
        "sourceTags": "24:24:sc",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": [
          {
            "ip": 7,
            "line": 78,
            "message": "unknown stake class"
          }
        ],
        "inlineRanges": "1:1:CLASS_SHORT;4:4:CLASS_EVENT;8:8:SHORT_MAX_STAKE;10:10:CLASS_HOURLY;13:13:HOURLY_MAX_STAKE;17:17:CLASS_EVENT;20:20:EVENT_MAX_STAKE"
      },
      {
        "name": "SHORT_GATE_CAP",
        "kind": "constant",
        "inputs": [],
        "bytecode": "0480969800",
        "sourceMap": "39:30:39:38",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "HOURLY_GATE_CAP",
        "kind": "constant",
        "inputs": [],
        "bytecode": "0400e1f505",
        "sourceMap": "40:31:40:40",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "EVENT_GATE_CAP",
        "kind": "constant",
        "inputs": [],
        "bytecode": "040065cd1d",
        "sourceMap": "41:30:41:39",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "gateCap",
        "inputs": [
          {
            "name": "stakeClass",
            "type": "int"
          }
        ],
        "bytecode": "048096980078519c630400e1f505776778529c63040065cd1d77686877",
        "sourceMap": "89:14:89:28:1;90:8:90:18:0;:22::34:1;:8;:36:92:5:0;91:14:91:29:1;:8::30;92:11:94:5:0;:15:92:25;:29::40:1;:15;:42:94:5:0;93:14:93:28:1;:8::29;92:42:94:5;:11;88:47:96:1",
        "sourceTags": "16:16:sc",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": [],
        "inlineRanges": "0:0:SHORT_GATE_CAP;2:2:CLASS_HOURLY;5:5:HOURLY_GATE_CAP;9:9:CLASS_EVENT;12:12:EVENT_GATE_CAP"
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
        "name": "TICKET_DUST",
        "kind": "constant",
        "inputs": [],
        "bytecode": "02b004",
        "sourceMap": "46:27:46:31",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "requireEntry",
        "inputs": [
          {
            "name": "category",
            "type": "bytes32"
          },
          {
            "name": "ticketLockingBytecode",
            "type": "bytes"
          },
          {
            "name": "outcome",
            "type": "int"
          },
          {
            "name": "stake",
            "type": "int"
          },
          {
            "name": "payoutPkh",
            "type": "bytes20"
          }
        ],
        "bytecode": "00ce5579527e8800cf76517f75528876577f75567f77817660967c60975579007ba569537902881352797600a27852a19a690320a10778519c6303404b4c776778529c630440787d01776868778ba5695a557955959352797855937f75787f778153795a7f75577f77815479577f757c8b53807e547953797f755a7f777e7c56799355807e5379547982777f757b55937f777e00cd00c78800d15879527e8800d3009d00d28800cc00c65579939d00cc7c048096980078519c630400e1f505776778529c63040065cd1d77686877a169537c567f75517f777e537a51807e7b55807e7c7e51cd7b8851d17b8851d3009d51d28851cc02b0049dc453a16951c4539c6352d100877768516576c39f766b6376ce00888b686c9166756951",
        "sourceMap": "8:22:8:23;:12::38:1;:42::50:0;;:53::57;:42:::1;:4::85;9:28:9:29:0;:18::44:1;10:12:10:17:0;:27::28;:12::29:1;;:33::41;:4::68;12:31:12:36:0;:46::47;:31::48:1;;:43::44:0;:31::48:1;;:27::49;13:21:13:37:0;:40::46:1;:21;14:19:14:35:0;:38::44:1;:19;15::15:26:0;;:28::29;:31::39;:12::40:1;:4::61;16:19:16:24:0;;:26::35:1;:46::56:0;;:37::57:1;;;;;;;;;;;;;;;;;;;;;;;;;:::61;:12::62;:4::101;19:16:19:18:0;:21::28;;:31::32;:21:::1;:16;20:20:20:25:0;;:39::44;:47::48;:39:::1;:20::49;;:32::37:0;:20::49:1;;:16::50;21:23:21:28:0;;:38::40;:23::41:1;;:35::36:0;:23::41:1;;:19::42;22:17:22:22:0;;:32::33;:17::34:1;;:51::59:0;:::63:1;:65::66:0;:37::67:1;:17;:70::75:0;;:86::91;;:70::92:1;;:82::84:0;:70::92:1;;:17;23:24:23:29:0;:32::37;;:24:::1;:39::40:0;:10::41:1;22:17;23:44::49:0;;:67::72;;:::79:1;;:44::80;;:56::61:0;:64::65;:56:::1;:44::80;;22:17;25:23:25:24:0;:12::41:1;:55::56:0;:45::73:1;:4::108;26:23:26:24:0;:12::39:1;:43::51:0;;:54::58;:43:::1;:4::90;27:23:27:24:0;:12::37:1;:41::42:0;:4::66:1;28:23:28:24:0;:12::39:1;:4::84;29:23:29:24:0;:12::31:1;:45::46:0;:35::53:1;:56::61:0;;:35:::1;:4::91;30:23:30:24:0;:12::31:1;:43::53:0;:35::54:1;;;;;;;;;;;;;;;;;:12;:4::72;32:19:32:29;:32::37:0;:47::48;:32::49:1;;:44::45:0;:32::49:1;;:19;:66::73:0;;:75::76;:52::77:1;:19;:94::99:0;:101::102;:80::103:1;:19;:106::115:0;:19:::1;33:23:33:24:0;:12::41:1;:45::66:0;:4::99:1;34:23:34:24:0;:12::39:1;:43::51:0;:4::107:1;35:23:35:24:0;:12::37:1;:41::42:0;:4::66:1;36:23:36:24:0;:12::39:1;:4::111;37:23:37:24:0;:12::31:1;:35::46;:4::81;40:12:40:29:0;:33::34;:12:::1;:4::71;41:25:41:29:0;42:8:42:25;:29::30;:8:::1;:32:44:5:0;43:35:43:36;:24::51:1;:55::57:0;:24:::1;:8::58;42:32:44:5;45:17:45:18:0;:4:47:5;:20:45:21;:24::40;:20:::1;;;:47:47:5:0;46:26:46:27;:16::42:1;:46::48:0;:8::84:1;45:42:45:45;:47:47:5;;:4;;;48::48:55;49:11:49:15:0",
        "sourceTags": "64:64:sc;181:181:sc;250:250:fu;251:254:lc;255:255:sc",
        "sourceFile": "entry.cash",
        "logs": [],
        "requires": [
          {
            "ip": 6,
            "line": 8,
            "message": "input 0 must be a gate"
          },
          {
            "ip": 14,
            "line": 10,
            "message": "not a gate commitment"
          },
          {
            "ip": 34,
            "line": 15,
            "message": "no such outcome"
          },
          {
            "ip": 47,
            "line": 16,
            "message": "unknown stake class"
          },
          {
            "ip": 67,
            "line": 16,
            "message": "stake outside this round's bounds"
          },
          {
            "ip": 139,
            "line": 25,
            "message": "gate must come back to itself"
          },
          {
            "ip": 146,
            "line": 26,
            "message": "gate keeps its minting NFT"
          },
          {
            "ip": 150,
            "line": 27,
            "message": "no fungible tokens"
          },
          {
            "ip": 153,
            "line": 28,
            "message": "gate totals must add this stake"
          },
          {
            "ip": 161,
            "line": 29,
            "message": "gate must hold the stake"
          },
          {
            "ip": 183,
            "line": 30,
            "message": "gate is full"
          },
          {
            "ip": 207,
            "line": 33,
            "message": "output 1 must be the ticket"
          },
          {
            "ip": 211,
            "line": 34,
            "message": "ticket is an immutable NFT of the round's category"
          },
          {
            "ip": 215,
            "line": 35,
            "message": "no fungible tokens"
          },
          {
            "ip": 218,
            "line": 36,
            "message": "ticket must record round, gate, outcome, stake and payee"
          },
          {
            "ip": 222,
            "line": 37,
            "message": "ticket carries the fixed dust"
          },
          {
            "ip": 226,
            "line": 40,
            "message": "at most gate, ticket and change"
          },
          {
            "ip": 249,
            "line": 46,
            "message": "funding inputs carry no tokens"
          },
          {
            "ip": 256,
            "line": 48,
            "message": "change carries no tokens"
          }
        ],
        "inlineRanges": "13:13:TAG_GATE;24:24:NIBBLE;27:27:NIBBLE;37:37:MIN_STAKE;40:64:maxStake;165:181:gateCap;184:184:TAG_TICKET;221:221:TICKET_DUST"
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
        "name": "requireMerge",
        "inputs": [
          {
            "name": "category",
            "type": "bytes32"
          },
          {
            "name": "own",
            "type": "bytes"
          }
        ],
        "bytecode": "00cf00ce537a517e8876517f75518876567f75557f77010088557f75517f777c557f75517f778851",
        "sourceMap": "54:29:54:30;:19::45:1;55:22:55:23:0;:12::38:1;:42::50:0;;:53::57;:42:::1;:4::95;56:12:56:18:0;:28::29;:12::30:1;;:34::44;:4::73;57:12:57:18:0;:28::29;:12::30:1;;:25::26:0;:12::30:1;;:34::44;:4::71;58:28:58:29:0;:12::30:1;;:25::26:0;:12::30:1;;:34::37:0;:47::48;:34::49:1;;:44::45:0;:34::49:1;;:4::90;59:11:59:15:0",
        "sourceFile": "entry.cash",
        "logs": [],
        "requires": [
          {
            "ip": 8,
            "line": 55,
            "message": "input 0 must be the round master"
          },
          {
            "ip": 14,
            "line": 56,
            "message": "not a master commitment"
          },
          {
            "ip": 23,
            "line": 57,
            "message": "the round is not open"
          },
          {
            "ip": 37,
            "line": 58,
            "message": "the master belongs to another round"
          }
        ],
        "inlineRanges": "13:13:TAG_MASTER;22:22:STATE_OPEN"
      },
      {
        "name": "SIGNATURE_PUSH",
        "kind": "constant",
        "inputs": [],
        "bytecode": "0141",
        "sourceMap": "52:32:52:36",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "SIGHASH_BYTE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "0141",
        "sourceMap": "53:28:53:30",
        "sourceFile": "rules.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "EVENT_EXIT_FEE_BPS",
        "kind": "constant",
        "inputs": [],
        "bytecode": "022c01",
        "sourceMap": "50:34:50:37",
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
      }
    ],
    "sources": {
      "entry.cash": "pragma cashscript ^0.14.0;\n\nimport \"./rules.cash\";\n\n// Shared by Gate (lane rounds) and EventGate (events): a player's entry. Gate at input 0, the player's coins after.\n// The player's authority is their own coin (signed by their wallet); the ticket records where winnings go.\nfunction requireEntry(bytes32 category, bytes ticketLockingBytecode, int outcome, int stake, bytes20 payoutPkh) returns (bool) {\n    require(tx.inputs[0].tokenCategory == category + 0x02, \"input 0 must be a gate\");\n    bytes state = tx.inputs[0].nftCommitment;\n    require(state.slice(0, 1) == TAG_GATE, \"not a gate commitment\");\n\n    int classAndOutcomes = int(state.slice(6, 7));\n    int stakeClass = classAndOutcomes / NIBBLE;\n    int outcomes = classAndOutcomes % NIBBLE;\n    require(within(outcome, 0, outcomes), \"no such outcome\");\n    require(within(stake, MIN_STAKE, maxStake(stakeClass) + 1), \"stake outside this round's bounds\");\n\n    // New totals: one more entrant, the stake added to its outcome.\n    int start = 10 + outcome * 5;\n    int total = int(state.slice(start, start + 5));\n    int entrants = int(state.slice(7, 10));\n    bytes next = state.slice(0, 7) + toPaddedBytes(entrants + 1, 3) + state.slice(10, start)\n        + toPaddedBytes(total + stake, 5) + state.slice(start + 5, state.length);\n\n    require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, \"gate must come back to itself\");\n    require(tx.outputs[0].tokenCategory == category + 0x02, \"gate keeps its minting NFT\");\n    require(tx.outputs[0].tokenAmount == 0, \"no fungible tokens\");\n    require(tx.outputs[0].nftCommitment == next, \"gate totals must add this stake\");\n    require(tx.outputs[0].value == tx.inputs[0].value + stake, \"gate must hold the stake\");\n    require(tx.outputs[0].value <= gateCap(stakeClass), \"gate is full\");\n\n    bytes ticket = TAG_TICKET + state.slice(1, 6) + toPaddedBytes(outcome, 1) + toPaddedBytes(stake, 5) + payoutPkh;\n    require(tx.outputs[1].lockingBytecode == ticketLockingBytecode, \"output 1 must be the ticket\");\n    require(tx.outputs[1].tokenCategory == category, \"ticket is an immutable NFT of the round's category\");\n    require(tx.outputs[1].tokenAmount == 0, \"no fungible tokens\");\n    require(tx.outputs[1].nftCommitment == ticket, \"ticket must record round, gate, outcome, stake and payee\");\n    require(tx.outputs[1].value == TICKET_DUST, \"ticket carries the fixed dust\");\n\n    // Nothing else may carry tokens in or out (stops smuggling another ticket or leaking minting K).\n    require(tx.outputs.length <= 3, \"at most gate, ticket and change\");\n    bool changeIsPlain = true;\n    if (tx.outputs.length == 3) {\n        changeIsPlain = tx.outputs[2].tokenCategory == 0x;\n    }\n    for (int i = 1; i < tx.inputs.length; i++) {\n        require(tx.inputs[i].tokenCategory == 0x, \"funding inputs carry no tokens\");\n    }\n    require(changeIsPlain, \"change carries no tokens\");\n    return true;\n}\n\n// The round's lock spends every gate together with its master; the master's lock function checks everything else.\nfunction requireMerge(bytes32 category, bytes own) returns (bool) {\n    bytes master = tx.inputs[0].nftCommitment;\n    require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be the round master\");\n    require(master.slice(0, 1) == TAG_MASTER, \"not a master commitment\");\n    require(master.slice(5, 6) == STATE_OPEN, \"the round is not open\");\n    require(master.slice(1, 5) == own.slice(1, 5), \"the master belongs to another round\");\n    return true;\n}\n",
      "rules.cash": "pragma cashscript ^0.14.0;\n\n// Jōge's shared rules: NFT tags, round states, stake classes and fixed lifecycle fees.\n// Every number here is mirrored in packages/sdk/src/round/constants.ts; change both together.\n\n// First byte of every commitment of category K.\nbytes constant TAG_MASTER = 0x01;\nbytes constant TAG_GATE = 0x02;\nbytes constant TAG_TICKET = 0x03;\n\n// Master state byte (offset 5).\nbytes constant STATE_OPEN = 0x00;\nbytes constant STATE_LOCKED = 0x01;\nint constant STATE_SETTLED = 2;\nint constant STATE_VOID = 3;\n\n// Assets: index into the oracle table. Gold needs two feeds (USD/BCH and XAU/BCH).\nint constant ASSET_BTC = 0;\nint constant ASSET_ETH = 1;\nint constant ASSET_BCH = 2;\nint constant ASSET_GOLD = 3;\n// USD/BCH is in cents, XAU/BCH in ounces × 100000, so usd × 10^7 ÷ xau is dollars per ounce × 10^4.\nint constant GOLD_FACTOR = 10000000;\n\n// Modes (high nibble of the mode byte); outcomes are the low nibble.\nint constant MODE_UPDOWN = 0;\nint constant MODE_RANGES = 1;\nint constant NIBBLE = 16;\nint constant MAX_OUTCOMES = 6;\n\n// Stake classes (high nibble of the gate's class byte): satoshi bounds per entry and per gate.\nint constant CLASS_SHORT = 0;\nint constant CLASS_HOURLY = 1;\nint constant CLASS_EVENT = 2;\nint constant MIN_STAKE = 5000;\nint constant SHORT_MAX_STAKE = 500000;\nint constant HOURLY_MAX_STAKE = 5000000;\nint constant EVENT_MAX_STAKE = 25000000;\nint constant SHORT_GATE_CAP = 10000000;\nint constant HOURLY_GATE_CAP = 100000000;\nint constant EVENT_GATE_CAP = 500000000;\n\n// Fees and dust (satoshis). Lifecycle fees are fixed so every client builds the same bytes; calibrated in S00 from\n// measured sizes (gold settle ~1,840 B, gold lock with one gate ~1,940 B, ~190 B per swept P2SH32 ticket) with headroom.\n// P2S tickets carry their ~112-byte script in the output: dust is 444 + 3 × ~188 B ≈ 1,008 sats, so 1,200.\nint constant TICKET_DUST = 1200;\n// Every gate is created holding exactly this; the lock counts anything beyond it as pot.\nint constant GATE_DUST = 1000;\n// An event entrant may leave before the lock; this share of the stake stays in the gate and joins the winners' pot.\nint constant EVENT_EXIT_FEE_BPS = 300;\n// P2PKH unlocking bytecode: 0x41 push, 64-byte Schnorr signature, then the sighash byte.\nbytes constant SIGNATURE_PUSH = 0x41;\nint constant SIGHASH_BYTE = 65;\nint constant MIN_FEE_OUTPUT = 1000;\nint constant LOCK_FEE_BASE = 1600;\nint constant LOCK_FEE_PER_GATE = 700;\n// An event gate's script is nearly twice a lane gate's (~690 bytes per merged gate, measured 2026-11-17: a 2-gate event\n// lock is ~3,090 bytes, which 1,600 + 2 × 700 could not pay), so events pay more per gate.\nint constant EVENT_LOCK_FEE_PER_GATE = 1100;\nint constant SETTLE_FEE = 2200;\nint constant SWEEP_FEE_BASE = 1000;\nint constant SWEEP_FEE_PER_TICKET = 250;\n// Each swept ticket costs ~20,000 operation-cost units; 32 padding bytes buy 25,600 (measured in S00).\nint constant SWEEP_PAD_PER_TICKET = 32;\nint constant PROTOCOL_FEE_BPS = 200;\nint constant MAX_CREATOR_FEE_BPS = 300;\nint constant BPS = 10000;\n\n// Lifecycle transactions take every input at this sequence; the SDK default (0xfffffffe) would allow a second variant.\nint constant FINAL_SEQUENCE = 4294967295;\n// Timeout paths need a non-final sequence so the node enforces their locktime.\nint constant TIMEOUT_SEQUENCE = 4294967294;\nint constant TX_VERSION = 2;\n// After T_close, how long settlement has before anyone may void the round (MTP lags about an hour on mainnet).\nint constant SETTLE_TIMEOUT = 21600;\n\nfunction maxStake(int stakeClass) returns (int) {\n    require(stakeClass >= CLASS_SHORT && stakeClass <= CLASS_EVENT, \"unknown stake class\");\n    int limit = SHORT_MAX_STAKE;\n    if (stakeClass == CLASS_HOURLY) {\n        limit = HOURLY_MAX_STAKE;\n    } else if (stakeClass == CLASS_EVENT) {\n        limit = EVENT_MAX_STAKE;\n    }\n    return limit;\n}\n\nfunction gateCap(int stakeClass) returns (int) {\n    int cap = SHORT_GATE_CAP;\n    if (stakeClass == CLASS_HOURLY) {\n        cap = HOURLY_GATE_CAP;\n    } else if (stakeClass == CLASS_EVENT) {\n        cap = EVENT_GATE_CAP;\n    }\n    return cap;\n}\n\n// Gold in ten-thousandths of a US dollar per ounce, from the USD/BCH and XAU/BCH prices of the same minute.\nfunction goldPrice(int usdPerBch, int xauPerBch) returns (int) {\n    return usdPerBch * GOLD_FACTOR / xauPerBch;\n}\n"
    },
    "inlineRanges": "21:278:requireEntry;288:326:requireMerge;347:347:TAG_GATE;357:357:NIBBLE;359:359:CLASS_EVENT;377:377:TAG_TICKET;421:421:SIGNATURE_PUSH;423:423:SIGHASH_BYTE;427:427:SIGHASH_BYTE;533:533:EVENT_EXIT_FEE_BPS;535:535:BPS"
  },
  "compiler": {
    "name": "cashc",
    "version": "0.14.0",
    "options": {
      "enforceFunctionParameterTypes": true,
      "enforceLocktimeGuard": false
    }
  },
  "updatedAt": "2026-11-18T19:51:45.234Z"
} as const;
