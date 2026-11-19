export default {
  "contractName": "DollarGate",
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
  "bytecode": "5279c77b877bce7b879a OP_0 OP_DEFINE 5379cd537a885279d17b8878d39dcc02e8039d51 OP_1 OP_DEFINE 7b6576c39f766b6376c752798791698b686c91667b6576c49f766b6376cd53798791698b686c91666d7551 OP_2 OP_DEFINE OP_4 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_7 OP_ROLL OP_SIZE 14 OP_EQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_2 OP_PICK OP_2 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_1 OP_SPLIT OP_DROP OP_2 OP_EQUALVERIFY OP_DUP OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_DUP OP_16 OP_DIV OP_3 OP_NUMEQUALVERIFY OP_16 OP_MOD OP_8 OP_PICK OP_0 OP_ROT OP_WITHIN OP_VERIFY OP_8 OP_PICK OP_10 8813 OP_1ADD OP_WITHIN OP_VERIFY OP_1 OP_5 OP_PICK OP_7 OP_PICK OP_0 OP_INVOKE OP_VERIFY OP_10 OP_8 OP_PICK OP_5 OP_MUL OP_ADD OP_2DUP OP_5 OP_ADD OP_SPLIT OP_DROP OP_OVER OP_SPLIT OP_NIP OP_BIN2NUM OP_2 OP_PICK OP_10 OP_SPLIT OP_DROP OP_7 OP_SPLIT OP_NIP OP_BIN2NUM OP_3 OP_PICK OP_7 OP_SPLIT OP_DROP OP_SWAP OP_1ADD OP_3 OP_NUM2BIN OP_CAT OP_2OVER OP_SPLIT OP_DROP OP_10 OP_SPLIT OP_NIP OP_CAT OP_SWAP OP_11 OP_PICK OP_ADD OP_5 OP_NUM2BIN OP_CAT OP_2 OP_PICK OP_3 OP_PICK OP_SIZE OP_NIP OP_SPLIT OP_DROP OP_ROT OP_5 OP_ADD OP_SPLIT OP_NIP OP_CAT OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_4 OP_PICK OP_2 OP_CAT OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_1 OP_UTXOTOKENAMOUNT OP_9 OP_PICK OP_ADD OP_DUP OP_1SUB a08601 OP_LESSTHANOREQUAL OP_VERIFY OP_1 OP_6 OP_PICK OP_8 OP_PICK OP_3 OP_ROLL OP_1 OP_INVOKE OP_VERIFY OP_1 OP_OUTPUTVALUE OP_1 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_3 OP_SWAP OP_6 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_CAT OP_7 OP_ROLL OP_1 OP_NUM2BIN OP_CAT OP_7 OP_ROLL OP_5 OP_NUM2BIN OP_CAT OP_SWAP OP_CAT OP_2 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCATEGORY OP_ROT OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_2 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_2 OP_OUTPUTVALUE b004 OP_NUMEQUALVERIFY OP_2 OP_BEGIN OP_DUP OP_TXINPUTCOUNT OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_DUP OP_UTXOTOKENCATEGORY OP_DUP OP_0 OP_EQUAL OP_OVER OP_5 OP_PICK OP_EQUAL OP_BOOLOR OP_VERIFY OP_SWAP OP_1ADD OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_TXOUTPUTCOUNT OP_5 OP_LESSTHANOREQUAL OP_VERIFY OP_3 OP_BEGIN OP_DUP OP_TXOUTPUTCOUNT OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_DUP OP_OUTPUTTOKENCATEGORY OP_DUP OP_0 OP_EQUAL OP_OVER OP_5 OP_PICK OP_EQUAL OP_BOOLOR OP_VERIFY OP_SWAP OP_1ADD OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_2 OP_2 OP_ROT OP_2 OP_INVOKE OP_NIP OP_NIP OP_ELSE OP_4 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_INPUTINDEX OP_UTXOTOKENCOMMITMENT OP_0 OP_UTXOTOKENCOMMITMENT OP_0 OP_UTXOTOKENCATEGORY OP_3 OP_ROLL OP_1 OP_CAT OP_EQUALVERIFY OP_DUP OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUALVERIFY OP_DUP OP_6 OP_SPLIT OP_DROP OP_5 OP_SPLIT OP_NIP 00 OP_EQUALVERIFY OP_5 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_SWAP OP_5 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_EQUALVERIFY OP_2DROP OP_2DROP OP_1 OP_ELSE OP_4 OP_ROLL OP_2 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_TXINPUTCOUNT OP_4 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_OVER OP_2 OP_CAT OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_DUP OP_1 OP_SPLIT OP_DROP OP_2 OP_EQUALVERIFY OP_DUP OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_16 OP_DIV OP_3 OP_NUMEQUALVERIFY OP_1 OP_4 OP_PICK OP_6 OP_PICK OP_0 OP_INVOKE OP_VERIFY OP_2 OP_UTXOTOKENCOMMITMENT OP_2 OP_UTXOTOKENCATEGORY OP_3 OP_PICK OP_EQUALVERIFY OP_2 OP_UTXOBYTECODE OP_4 OP_ROLL OP_EQUALVERIFY OP_DUP OP_1 OP_SPLIT OP_DROP OP_3 OP_EQUALVERIFY OP_DUP OP_6 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_2 OP_PICK OP_6 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_EQUALVERIFY 76a914 OP_OVER 20 OP_SPLIT OP_DROP OP_12 OP_SPLIT OP_NIP OP_CAT 88ac OP_CAT OP_3 OP_INPUTBYTECODE OP_3 OP_UTXOBYTECODE OP_2 OP_PICK OP_EQUALVERIFY OP_3 OP_UTXOTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_DUP OP_1 OP_SPLIT OP_DROP 41 OP_EQUALVERIFY 41 OP_1ADD OP_SPLIT OP_DROP 41 OP_SPLIT OP_NIP OP_DUP 41 OP_EQUAL OP_SWAP 61 OP_EQUAL OP_BOOLOR OP_VERIFY OP_OVER OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_ROT OP_12 OP_SPLIT OP_DROP OP_7 OP_SPLIT OP_NIP OP_BIN2NUM OP_10 OP_ROT OP_5 OP_MUL OP_ADD OP_3 OP_PICK OP_OVER OP_5 OP_ADD OP_SPLIT OP_DROP OP_OVER OP_SPLIT OP_NIP OP_BIN2NUM OP_4 OP_PICK OP_10 OP_SPLIT OP_DROP OP_7 OP_SPLIT OP_NIP OP_BIN2NUM OP_OVER OP_4 OP_PICK OP_GREATERTHANOREQUAL OP_OVER OP_0 OP_GREATERTHAN OP_BOOLAND OP_VERIFY OP_5 OP_PICK OP_7 OP_SPLIT OP_DROP OP_SWAP OP_1SUB OP_3 OP_NUM2BIN OP_CAT OP_5 OP_PICK OP_3 OP_PICK OP_SPLIT OP_DROP OP_10 OP_SPLIT OP_NIP OP_CAT OP_SWAP OP_3 OP_PICK OP_SUB OP_5 OP_NUM2BIN OP_CAT OP_4 OP_PICK OP_5 OP_ROLL OP_SIZE OP_NIP OP_SPLIT OP_DROP OP_ROT OP_5 OP_ADD OP_SPLIT OP_NIP OP_CAT OP_OVER 2c01 OP_MUL 1027 OP_DIV OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_5 OP_ROLL OP_2 OP_CAT OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTTOKENCOMMITMENT OP_ROT OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_1 OP_4 OP_PICK OP_6 OP_PICK OP_1 OP_UTXOTOKENAMOUNT OP_5 OP_PICK OP_SUB OP_4 OP_PICK OP_ADD OP_1 OP_INVOKE OP_VERIFY OP_1 OP_OUTPUTVALUE OP_1 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_2 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENCATEGORY OP_4 OP_ROLL OP_EQUALVERIFY OP_2 OP_OUTPUTTOKENAMOUNT OP_ROT OP_ROT OP_SUB OP_NUMEQUALVERIFY OP_2 OP_OUTPUTVALUE OP_2 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_1 OP_TXOUTPUTCOUNT OP_4 OP_NUMEQUAL OP_IF OP_3 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUAL OP_NIP OP_ENDIF OP_TXOUTPUTCOUNT OP_4 OP_LESSTHANOREQUAL OP_BOOLAND OP_VERIFY OP_2 OP_2 OP_ROT OP_2 OP_INVOKE OP_ENDIF OP_ENDIF",
  "source": "pragma cashscript ^0.14.0;\n\nimport \"./dollar.cash\";\n\n// A dollar event's entry gate (stake class CLASS_DOLLAR): the same totals as EventGate, but the stakes are dollar\n// tokens held by the gate's sidecar (input 1) rather than satoshis held by the gate. Players may leave before the lock.\ncontract DollarGate(bytes32 category, bytes ticketLockingBytecode, bytes sideLockingBytecode, bytes32 dollarCategory) {\n    // Gate at input 0, its sidecar at input 1, the player's coins after (satoshis, and dollars for the stake).\n    // Outputs: the gate, the sidecar with the stake added, the ticket, then at most two change outputs.\n    function enter(int outcome, int stake, bytes20 payoutPkh) {\n        require(this.activeInputIndex == 0, \"the gate must be input 0\");\n        require(tx.inputs[0].tokenCategory == category + 0x02, \"input 0 must be a gate\");\n        bytes state = tx.inputs[0].nftCommitment;\n        require(state.slice(0, 1) == TAG_GATE, \"not a gate commitment\");\n        int classAndOutcomes = int(state.slice(6, 7));\n        require(classAndOutcomes / NIBBLE == CLASS_DOLLAR, \"not a dollar gate\");\n        int outcomes = classAndOutcomes % NIBBLE;\n        require(within(outcome, 0, outcomes), \"no such outcome\");\n        require(within(stake, DOLLAR_MIN_STAKE, DOLLAR_MAX_STAKE + 1), \"stake outside a dollar event's bounds\");\n        require(isSide(1, sideLockingBytecode, dollarCategory), \"input 1 must be the gate's sidecar\");\n\n        int start = 10 + outcome * 5;\n        int total = int(state.slice(start, start + 5));\n        int entrants = int(state.slice(7, 10));\n        bytes next = state.slice(0, 7) + toPaddedBytes(entrants + 1, 3) + state.slice(10, start)\n            + toPaddedBytes(total + stake, 5) + state.slice(start + 5, state.length);\n        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, \"gate must come back to itself\");\n        require(tx.outputs[0].tokenCategory == category + 0x02, \"gate keeps its minting NFT\");\n        require(tx.outputs[0].tokenAmount == 0, \"no fungible tokens on the gate\");\n        require(tx.outputs[0].nftCommitment == next, \"gate totals must add this stake\");\n        require(tx.outputs[0].value == tx.inputs[0].value, \"the gate's satoshis do not change\");\n\n        int held = tx.inputs[1].tokenAmount + stake;\n        require(held - SIDE_SEED <= DOLLAR_GATE_CAP, \"gate is full\");\n        require(requireSideOut(1, sideLockingBytecode, dollarCategory, held), \"the sidecar must hold the stake\");\n        require(tx.outputs[1].value == tx.inputs[1].value, \"the sidecar's satoshis do not change\");\n\n        bytes ticket = TAG_TICKET + state.slice(1, 6) + toPaddedBytes(outcome, 1) + toPaddedBytes(stake, 5) + payoutPkh;\n        require(tx.outputs[2].lockingBytecode == ticketLockingBytecode, \"output 2 must be the ticket\");\n        require(tx.outputs[2].tokenCategory == category, \"ticket is an immutable NFT of the round's category\");\n        require(tx.outputs[2].tokenAmount == 0, \"no fungible tokens on the ticket\");\n        require(tx.outputs[2].nftCommitment == ticket, \"ticket must record round, gate, outcome, stake and payee\");\n        require(tx.outputs[2].value == TICKET_DUST, \"ticket carries the fixed dust\");\n\n        // The player's coins and change carry satoshis or dollars only; no NFT of any kind moves in or out.\n        for (int i = 2; i < tx.inputs.length; i++) {\n            bytes funding = tx.inputs[i].tokenCategory;\n            require(funding == 0x || funding == dollarCategory, \"funding carries only satoshis or dollars\");\n        }\n        require(tx.outputs.length <= 5, \"at most gate, sidecar, ticket and two change outputs\");\n        for (int o = 3; o < tx.outputs.length; o++) {\n            bytes change = tx.outputs[o].tokenCategory;\n            require(change == 0x || change == dollarCategory, \"change carries only satoshis or dollars\");\n        }\n        require(requireNoOtherSides(2, 2, sideLockingBytecode), \"only the gate's own sidecar\");\n    }\n\n    // The round's lock spends every gate with its master; DollarMasterOpen checks everything else.\n    function merge() {\n        bytes own = tx.inputs[this.activeInputIndex].nftCommitment;\n        bytes master = tx.inputs[0].nftCommitment;\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be the round master\");\n        require(master.slice(0, 1) == TAG_MASTER, \"not a master commitment\");\n        require(master.slice(5, 6) == STATE_OPEN, \"the round is not open\");\n        require(master.slice(1, 5) == own.slice(1, 5), \"the master belongs to another round\");\n    }\n\n    // An entrant leaves before the lock: input 1 the gate's sidecar, input 2 their ticket from this gate, input 3 a\n    // coin from the ticket's payout address signed with SIGHASH_ALL. The gate drops the stake, the sidecar keeps the\n    // exit fee for the winners, and output 2 refunds the rest in dollars with the ticket's dust.\n    function exit() {\n        require(this.activeInputIndex == 0, \"the gate must be input 0\");\n        require(tx.inputs.length == 4, \"gate, sidecar, ticket and the owner's coin only\");\n        require(tx.inputs[0].tokenCategory == category + 0x02, \"input 0 must be a gate\");\n        bytes state = tx.inputs[0].nftCommitment;\n        require(state.slice(0, 1) == TAG_GATE, \"not a gate commitment\");\n        require(int(state.slice(6, 7)) / NIBBLE == CLASS_DOLLAR, \"not a dollar gate\");\n        require(isSide(1, sideLockingBytecode, dollarCategory), \"input 1 must be the gate's sidecar\");\n\n        bytes ticket = tx.inputs[2].nftCommitment;\n        require(tx.inputs[2].tokenCategory == category, \"input 2 must be a ticket of this category\");\n        require(tx.inputs[2].lockingBytecode == ticketLockingBytecode, \"input 2 must sit at the ticket contract\");\n        require(ticket.slice(0, 1) == TAG_TICKET, \"not a ticket commitment\");\n        require(ticket.slice(1, 6) == state.slice(1, 6), \"the ticket belongs to another round or gate\");\n        bytes owner = new LockingBytecodeP2PKH(unsafe_bytes20(ticket.slice(12, 32)));\n\n        bytes ownerUnlock = tx.inputs[3].unlockingBytecode;\n        require(tx.inputs[3].lockingBytecode == owner, \"the ticket's owner must co-sign\");\n        require(tx.inputs[3].tokenCategory == 0x, \"the owner's coin carries no tokens\");\n        require(ownerUnlock.slice(0, 1) == SIGNATURE_PUSH, \"the owner signs with Schnorr\");\n        bytes sighash = ownerUnlock.slice(SIGHASH_BYTE, SIGHASH_BYTE + 1);\n        require(sighash == 0x41 || sighash == 0x61, \"the owner's signature must cover every output\");\n\n        int outcome = int(ticket.slice(6, 7));\n        int stake = int(ticket.slice(7, 12));\n        int start = 10 + outcome * 5;\n        int total = int(state.slice(start, start + 5));\n        int entrants = int(state.slice(7, 10));\n        require(total >= stake && entrants > 0, \"the gate holds this entry\");\n        bytes next = state.slice(0, 7) + toPaddedBytes(entrants - 1, 3) + state.slice(10, start)\n            + toPaddedBytes(total - stake, 5) + state.slice(start + 5, state.length);\n        int fee = stake * EVENT_EXIT_FEE_BPS / BPS;\n\n        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode, \"gate must come back to itself\");\n        require(tx.outputs[0].tokenCategory == category + 0x02, \"gate keeps its minting NFT\");\n        require(tx.outputs[0].tokenAmount == 0, \"no fungible tokens on the gate\");\n        require(tx.outputs[0].nftCommitment == next, \"gate totals must drop this stake\");\n        require(tx.outputs[0].value == tx.inputs[0].value, \"the gate's satoshis do not change\");\n        require(\n            requireSideOut(1, sideLockingBytecode, dollarCategory, tx.inputs[1].tokenAmount - stake + fee),\n            \"the exit fee stays in the sidecar\"\n        );\n        require(tx.outputs[1].value == tx.inputs[1].value, \"the sidecar's satoshis do not change\");\n        require(tx.outputs[2].lockingBytecode == owner, \"the refund goes to the ticket's owner\");\n        require(tx.outputs[2].tokenCategory == dollarCategory, \"the refund is in dollars\");\n        require(tx.outputs[2].tokenAmount == stake - fee, \"refund: the stake minus the exit fee\");\n        require(tx.outputs[2].value == tx.inputs[2].value, \"the ticket's dust comes back with it\");\n        bool changeIsPlain = true;\n        if (tx.outputs.length == 4) {\n            changeIsPlain = tx.outputs[3].tokenCategory == 0x;\n        }\n        require(tx.outputs.length <= 4 && changeIsPlain, \"at most gate, sidecar, refund and the owner's change\");\n        require(requireNoOtherSides(2, 2, sideLockingBytecode), \"only the gate's own sidecar\");\n    }\n}\n",
  "fingerprint": "d8dc5670f817f4475db210be67dd84557dcae4368a84df214ad749f5b9f565f6",
  "debug": {
    "bytecode": "0a5279c77b877bce7b879a0089145379cd537a885279d17b8878d39dcc02e8039d5151892b7b6576c39f766b6376c752798791698b686c91667b6576c49f766b6376cd53798791698b686c91666d755152895479009c63577a82011488c0009d00ce5279527e8800cf76517f75528876577f75567f7781766096539d60975879007ba56958795a0288138ba5695155795779008a695a58795595936e55937f75787f778152795a7f75577f77815379577f757c8b53807e707f755a7f777e7c5b799355807e5279537982777f757b55937f777e00cd00c78800d15479527e8800d3009d00d28800cc00c69d51d0597993768c03a08601a1695156795879537a518a6951cc51c69d537c567f75517f777e577a51807e577a55807e7c7e52cd537a8852d17b8852d3009d52d28852cc02b0049d526576c39f766b6376ce760087785579879b697c8b77686c916675c455a169536576c49f766b6376d1760087785579879b697c8b77686c91667552527b528a7777675479519c63c0cf00cf00ce537a517e8876517f75518876567f75557f77010088557f75517f777c557f75517f77886d6d5167547a529dc0009dc3549d00ce78527e8800cf76517f75528876577f75567f77816096539d5154795679008a6952cf52ce53798852c7547a8876517f75538876567f75517f775279567f75517f77880376a9147801207f755c7f777e0288ac7e53ca53c752798853ce008876517f7501418801418b7f7501417f77760141877c0161879b6978577f75567f77817b5c7f75577f77815a7b55959353797855937f75787f778154795a7f75577f7781785479a27800a09a695579577f757c8c53807e557953797f755a7f777e7c53799455807e5479557a82777f757b55937f777e78022c01950210279600cd00c78800d1557a527e8800d3009d00d27b8800cc00c69d515479567951d0557994547993518a6951cc51c69d52cd537a8852d1547a8852d37b7b949d52cc52c69d51c4549c6353d100877768c454a19a6952527b528a6868",
    "sourceMap": "30::32:1;;::::1;35::41::0;;::::1;46::54::0;;::::1;10:4:56:5:0;;;;;:43:10:60;;;;;11:16:11:37;:41::42;:8::72:1;12:26:12:27:0;:16::42:1;:46::54:0;;:57::61;:46:::1;:8::89;13:32:13:33:0;:22::48:1;14:16:14:21:0;:31::32;:16::33:1;;:37::45;:8::72;15:35:15:40:0;:50::51;:35::52:1;;:47::48:0;:35::52:1;;:31::53;16:16:16:32:0;:35::41:1;:16;:45::57;:8::80;17:42:17:48;:23;18::18:30:0;;:32::33;:35::43;:16::44:1;:8::65;19:23:19:28:0;;:30::46:1;:48::64;:::68;:16::69;:8::112;20:23:20:24:0;:26::45;;:47::61;;:16::62:1;;:8::102;22:20:22:22:0;:25::32;;:35::36;:25:::1;:20;23:24:23:48:0;:51::52;:43:::1;:24::53;;:36::41:0;:24::53:1;;:20::54;24:27:24:32:0;;:42::44;:27::45:1;;:39::40:0;:27::45:1;;:23::46;25:21:25:26:0;;:36::37;:21::38:1;;:55::63:0;:::67:1;:69::70:0;:41::71:1;:21;:74::95:0;:::96:1;;:86::88:0;:74::96:1;;:21;26:28:26:33:0;:36::41;;:28:::1;:43::44:0;:14::45:1;25:21;26:48::53:0;;:71::76;;:::83:1;;:48::84;;:60::65:0;:68::69;:60:::1;:48::84;;25:21;27:27:27:28:0;:16::45:1;:59::60:0;:49::77:1;:8::112;28:27:28:28:0;:16::43:1;:47::55:0;;:58::62;:47:::1;:8::94;29:27:29:28:0;:16::41:1;:45::46:0;:8::82:1;30:27:30:28:0;:16::43:1;:8::88;31:27:31:28:0;:16::35:1;:49::50:0;:39::57:1;:8::96;33:29:33:30:0;:19::43:1;:46::51:0;;:19:::1;34:16:34:20:0;:::32:1;:36::51;:16;:8::69;35:31:35:32:0;:34::53;;:55::69;;:71::75;;:16::76:1;;:8::113;36:27:36:28:0;:16::35:1;:49::50:0;:39::57:1;:8::99;38:23:38:33;:36::41:0;:51::52;:36::53:1;;:48::49:0;:36::53:1;;:23;:70::77:0;;:79::80;:56::81:1;:23;:98::103:0;;:105::106;:84::107:1;:23;:110::119:0;:23:::1;39:27:39:28:0;:16::45:1;:49::70:0;;:8::103:1;40:27:40:28:0;:16::43:1;:47::55:0;:8::111:1;41:27:41:28:0;:16::41:1;:45::46:0;:8::84:1;42:27:42:28:0;:16::43:1;:8::115;43:27:43:28:0;:16::35:1;:39::50;:8::85;46:21:46:22:0;:8:49:9;:24:46:25;:28::44;:24:::1;;;:51:49:9:0;47:38:47:39;:28::54:1;48:20:48:27:0;:31::33;:20:::1;:37::44:0;:48::62;;:37:::1;:20;:12::108;46:46:46:49;;::49:9;:51;;:8;;;50:16:50:33:0;:37::38;:16:::1;:8::96;51:21:51:22:0;:8:54:9;:24:51:25;:28::45;:24:::1;;;:52:54:9:0;52:38:52:39;:27::54:1;53:20:53:26:0;:30::32;:20:::1;:36::42:0;:46::60;;:36:::1;:20;:12::105;51:47:51:50;;::54:9;:52;;:8;;;55:36:55:37:0;:39::40;:42::61;:16::62:1;:8::95;10:62:56:5;;:4;59::66::0;;;;;60:30:60:51;:20::66:1;61:33:61:34:0;:23::49:1;62:26:62:27:0;:16::42:1;:46::54:0;;:57::61;:46:::1;:8::99;63:16:63:22:0;:32::33;:16::34:1;;:38::48;:8::77;64:16:64:22:0;:32::33;:16::34:1;;:29::30:0;:16::34:1;;:38::48;:8::75;65:32:65:33:0;:16::34:1;;:29::30:0;:16::34:1;;:38::41:0;:51::52;:38::53:1;;:48::49:0;:38::53:1;;:8::94;59:21:66:5;;;:4;71::124::0;;;;72:16:72:37;:41::42;:8::72:1;73:16:73:32:0;:36::37;:8::90:1;74:26:74:27:0;:16::42:1;:46::54:0;:57::61;:46:::1;:8::89;75:32:75:33:0;:22::48:1;76:16:76:21:0;:31::32;:16::33:1;;:37::45;:8::72;77:20:77:25:0;:35::36;:20::37:1;;:32::33:0;:20::37:1;;:16::38;:41::47;:16;:51::63;:8::86;78:23:78:24:0;:26::45;;:47::61;;:16::62:1;;:8::102;80:33:80:34:0;:23::49:1;81:26:81:27:0;:16::42:1;:46::54:0;;:8::101:1;82:26:82:27:0;:16::44:1;:48::69:0;;:8::114:1;83:16:83:22:0;:32::33;:16::34:1;;:38::48;:8::77;84:16:84:22:0;:32::33;:16::34:1;;:29::30:0;:16::34:1;;:38::43:0;;:53::54;:38::55:1;;:50::51:0;:38::55:1;;:8::104;85:22:85:84:0;:62::68;:79::81;:62::82:1;;:75::77:0;:62::82:1;;:22::84;;;87:38:87:39:0;:28::58:1;88:26:88:27:0;:16::44:1;:48::53:0;;:8::90:1;89:26:89:27:0;:16::42:1;:46::48:0;:8::88:1;90:16:90:27:0;:37::38;:16::39:1;;:43::57;:8::91;91:56:91:68;:::72;:24::73;;:42::54;:24::73;;92:16:92:23:0;:27::31;:16:::1;:35::42:0;:46::50;:35:::1;:16;:8::101;94:26:94:32:0;:42::43;:26::44:1;;:39::40:0;:26::44:1;;:22::45;95:24:95:30:0;:40::42;:24::43:1;;:37::38:0;:24::43:1;;:20::44;96::96:22:0;:25::32;:35::36;:25:::1;:20;97:24:97:29:0;;:43::48;:51::52;:43:::1;:24::53;;:36::41:0;:24::53:1;;:20::54;98:27:98:32:0;;:42::44;:27::45:1;;:39::40:0;:27::45:1;;:23::46;99:16:99:21:0;:25::30;;:16:::1;:34::42:0;:45::46;:34:::1;:16;:8::77;100:21:100:26:0;;:36::37;:21::38:1;;:55::63:0;:::67:1;:69::70:0;:41::71:1;:21;:74::79:0;;:90::95;;:74::96:1;;:86::88:0;:74::96:1;;:21;101:28:101:33:0;:36::41;;:28:::1;:43::44:0;:14::45:1;100:21;101:48::53:0;;:71::76;;:::83:1;;:48::84;;:60::65:0;:68::69;:60:::1;:48::84;;100:21;102:18:102:23:0;:26::44:1;:18;:47::50;:18;104:27:104:28:0;:16::45:1;:59::60:0;:49::77:1;:8::112;105:27:105:28:0;:16::43:1;:47::55:0;;:58::62;:47:::1;:8::94;106:27:106:28:0;:16::41:1;:45::46:0;:8::82:1;107:27:107:28:0;:16::43:1;:47::51:0;:8::89:1;108:27:108:28:0;:16::35:1;:49::50:0;:39::57:1;:8::96;110:27:110:28:0;:30::49;;:51::65;;:77::78;:67::91:1;:94::99:0;;:67:::1;:102::105:0;;:67:::1;:12::106;;109:8:112:10;113:27:113:28:0;:16::35:1;:49::50:0;:39::57:1;:8::99;114:27:114:28:0;:16::45:1;:49::54:0;;:8::97:1;115:27:115:28:0;:16::43:1;:47::61:0;;:8::91:1;116:27:116:28:0;:16::41:1;:45::50:0;:53::56;:45:::1;:8::98;117:27:117:28:0;:16::35:1;:49::50:0;:39::57:1;:8::99;118:29:118:33:0;119:12:119:29;:33::34;:12:::1;:36:121:9:0;120:39:120:40;:28::55:1;:59::61:0;:28:::1;:12::62;119:36:121:9;122:16:122:33:0;:37::38;:16:::1;:::55;:8::113;123:36:123:37:0;:39::40;:42::61;:16::62:1;:8::95;7:0:125:1;",
    "logs": [],
    "requires": [
      {
        "ip": 25,
        "line": 11,
        "message": "the gate must be input 0"
      },
      {
        "ip": 32,
        "line": 12,
        "message": "input 0 must be a gate"
      },
      {
        "ip": 40,
        "line": 14,
        "message": "not a gate commitment"
      },
      {
        "ip": 53,
        "line": 16,
        "message": "not a dollar gate"
      },
      {
        "ip": 61,
        "line": 18,
        "message": "no such outcome"
      },
      {
        "ip": 68,
        "line": 19,
        "message": "stake outside a dollar event's bounds"
      },
      {
        "ip": 76,
        "line": 20,
        "message": "input 1 must be the gate's sidecar"
      },
      {
        "ip": 143,
        "line": 27,
        "message": "gate must come back to itself"
      },
      {
        "ip": 150,
        "line": 28,
        "message": "gate keeps its minting NFT"
      },
      {
        "ip": 154,
        "line": 29,
        "message": "no fungible tokens on the gate"
      },
      {
        "ip": 157,
        "line": 30,
        "message": "gate totals must add this stake"
      },
      {
        "ip": 162,
        "line": 31,
        "message": "the gate's satoshis do not change"
      },
      {
        "ip": 172,
        "line": 34,
        "message": "gate is full"
      },
      {
        "ip": 182,
        "line": 35,
        "message": "the sidecar must hold the stake"
      },
      {
        "ip": 187,
        "line": 36,
        "message": "the sidecar's satoshis do not change"
      },
      {
        "ip": 213,
        "line": 39,
        "message": "output 2 must be the ticket"
      },
      {
        "ip": 217,
        "line": 40,
        "message": "ticket is an immutable NFT of the round's category"
      },
      {
        "ip": 221,
        "line": 41,
        "message": "no fungible tokens on the ticket"
      },
      {
        "ip": 224,
        "line": 42,
        "message": "ticket must record round, gate, outcome, stake and payee"
      },
      {
        "ip": 228,
        "line": 43,
        "message": "ticket carries the fixed dust"
      },
      {
        "ip": 247,
        "line": 48,
        "message": "funding carries only satoshis or dollars"
      },
      {
        "ip": 259,
        "line": 50,
        "message": "at most gate, sidecar, ticket and two change outputs"
      },
      {
        "ip": 278,
        "line": 53,
        "message": "change carries only satoshis or dollars"
      },
      {
        "ip": 292,
        "line": 55,
        "message": "only the gate's own sidecar"
      },
      {
        "ip": 310,
        "line": 62,
        "message": "input 0 must be the round master"
      },
      {
        "ip": 316,
        "line": 63,
        "message": "not a master commitment"
      },
      {
        "ip": 325,
        "line": 64,
        "message": "the round is not open"
      },
      {
        "ip": 339,
        "line": 65,
        "message": "the master belongs to another round"
      },
      {
        "ip": 350,
        "line": 72,
        "message": "the gate must be input 0"
      },
      {
        "ip": 353,
        "line": 73,
        "message": "gate, sidecar, ticket and the owner's coin only"
      },
      {
        "ip": 359,
        "line": 74,
        "message": "input 0 must be a gate"
      },
      {
        "ip": 367,
        "line": 76,
        "message": "not a gate commitment"
      },
      {
        "ip": 379,
        "line": 77,
        "message": "not a dollar gate"
      },
      {
        "ip": 387,
        "line": 78,
        "message": "input 1 must be the gate's sidecar"
      },
      {
        "ip": 394,
        "line": 81,
        "message": "input 2 must be a ticket of this category"
      },
      {
        "ip": 399,
        "line": 82,
        "message": "input 2 must sit at the ticket contract"
      },
      {
        "ip": 405,
        "line": 83,
        "message": "not a ticket commitment"
      },
      {
        "ip": 421,
        "line": 84,
        "message": "the ticket belongs to another round or gate"
      },
      {
        "ip": 439,
        "line": 88,
        "message": "the ticket's owner must co-sign"
      },
      {
        "ip": 443,
        "line": 89,
        "message": "the owner's coin carries no tokens"
      },
      {
        "ip": 449,
        "line": 90,
        "message": "the owner signs with Schnorr"
      },
      {
        "ip": 464,
        "line": 92,
        "message": "the owner's signature must cover every output"
      },
      {
        "ip": 514,
        "line": 99,
        "message": "the gate holds this entry"
      },
      {
        "ip": 565,
        "line": 104,
        "message": "gate must come back to itself"
      },
      {
        "ip": 572,
        "line": 105,
        "message": "gate keeps its minting NFT"
      },
      {
        "ip": 576,
        "line": 106,
        "message": "no fungible tokens on the gate"
      },
      {
        "ip": 580,
        "line": 107,
        "message": "gate totals must drop this stake"
      },
      {
        "ip": 585,
        "line": 108,
        "message": "the gate's satoshis do not change"
      },
      {
        "ip": 601,
        "line": 109,
        "message": "the exit fee stays in the sidecar"
      },
      {
        "ip": 606,
        "line": 113,
        "message": "the sidecar's satoshis do not change"
      },
      {
        "ip": 611,
        "line": 114,
        "message": "the refund goes to the ticket's owner"
      },
      {
        "ip": 616,
        "line": 115,
        "message": "the refund is in dollars"
      },
      {
        "ip": 622,
        "line": 116,
        "message": "refund: the stake minus the exit fee"
      },
      {
        "ip": 627,
        "line": 117,
        "message": "the ticket's dust comes back with it"
      },
      {
        "ip": 643,
        "line": 122,
        "message": "at most gate, sidecar, refund and the owner's change"
      },
      {
        "ip": 649,
        "line": 123,
        "message": "only the gate's own sidecar"
      }
    ],
    "sourceTags": "14:18:pv;244:246:fu;247:250:lc;251:251:sc;275:277:fu;278:281:lc;282:282:sc;288:289:sc",
    "functions": [
      {
        "id": 0,
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
        "id": 1,
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
        "id": 2,
        "name": "requireNoOtherSides",
        "inputs": [
          {
            "name": "from",
            "type": "int"
          },
          {
            "name": "fromOutput",
            "type": "int"
          },
          {
            "name": "sideLockingBytecode",
            "type": "bytes"
          }
        ],
        "bytecode": "7b6576c39f766b6376c752798791698b686c91667b6576c49f766b6376cd53798791698b686c91666d7551",
        "sourceMap": "47:17:47:21;:4:49:5;:23:47:24;:27::43;:23:::1;;;:50:49:5:0;48:26:48:27;:16::44:1;:48::67:0;;:16:::1;;:8::107;47:45:47:48;:50:49:5;;:4;;50:17:50:27:0;:4:52:5;:29:50:30;:33::50;:29:::1;;;:57:52:5:0;51:27:51:28;:16::45:1;:49::68:0;;:16:::1;;:8::107;50:52:50:55;:57:52:5;;:4;;46:97:54:1;;",
        "sourceTags": "15:15:fu;16:19:lc;35:35:fu;36:39:lc",
        "sourceFile": "dollar.cash",
        "logs": [],
        "requires": [
          {
            "ip": 14,
            "line": 48,
            "message": "no other sidecar may be spent here"
          },
          {
            "ip": 34,
            "line": 51,
            "message": "no other sidecar may be made here"
          }
        ]
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
        "name": "DOLLAR_MIN_STAKE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "5a",
        "sourceMap": "12:32:12:34",
        "sourceFile": "dollar.cash",
        "logs": [],
        "requires": []
      },
      {
        "name": "DOLLAR_MAX_STAKE",
        "kind": "constant",
        "inputs": [],
        "bytecode": "028813",
        "sourceMap": "13:32:13:36",
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
        "name": "DOLLAR_GATE_CAP",
        "kind": "constant",
        "inputs": [],
        "bytecode": "03a08601",
        "sourceMap": "14:31:14:37",
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
      "dollar.cash": "pragma cashscript ^0.14.0;\n\nimport \"./rules.cash\";\n\n// Dollar events: stakes and payouts in a dollar token (ParyonUSD on mainnet, 2 decimals) instead of satoshis.\n// A coin carries one token category, and gates and masters are NFTs of category K, so a round's dollars sit beside\n// them in sidecars (TokenSide.cash): one per gate, merged into one beside the master at the lock. Every number here is\n// mirrored in packages/sdk/src/round/dollar.ts; change both together.\n\n// The dollar stake class (high nibble of the gate's class byte) and its bounds, in token units (cents).\nint constant CLASS_DOLLAR = 3;\nint constant DOLLAR_MIN_STAKE = 10;\nint constant DOLLAR_MAX_STAKE = 5000;\nint constant DOLLAR_GATE_CAP = 100000;\n// A token output cannot be empty, so every sidecar is made holding this much; the lock counts the rest as pot, and\n// the seeds go back to the creator after the last payout (like gate dust).\nint constant SIDE_SEED = 1;\n// Satoshis every sidecar, and every dollar fee output, carries.\nint constant TOKEN_DUST = 1000;\n// A dollar lock spends a sidecar per gate as well as the gate: measured ~2,160 bytes plus ~920 per gate (2 gates:\n// ~4,000 bytes), and gold adds ~300; these fees keep every lock above 1 sat/byte.\nint constant DOLLAR_LOCK_FEE_BASE = 2800;\nint constant DOLLAR_LOCK_FEE_PER_GATE = 1100;\n// Settle and sweep spend the pot sidecar too.\nint constant SIDE_FEE = 300;\n// Dollar fees are paid from one cent (an output's dust is paid from the round's budget, not from the pot).\nint constant MIN_DOLLAR_FEE = 1;\n\n// Input `index` is a sidecar: at the sidecar contract, holding only the dollar token (no NFT).\nfunction isSide(int index, bytes sideLockingBytecode, bytes32 dollarCategory) returns (bool) {\n    return tx.inputs[index].lockingBytecode == sideLockingBytecode && tx.inputs[index].tokenCategory == dollarCategory;\n}\n\n// Output `index` is a sidecar holding exactly `amount` of the dollar token and TOKEN_DUST satoshis.\nfunction requireSideOut(int index, bytes sideLockingBytecode, bytes32 dollarCategory, int amount) returns (bool) {\n    require(tx.outputs[index].lockingBytecode == sideLockingBytecode, \"the sidecar goes back to the sidecar contract\");\n    require(tx.outputs[index].tokenCategory == dollarCategory, \"a sidecar holds only the dollar token\");\n    require(tx.outputs[index].tokenAmount == amount, \"the sidecar's dollars must be exact\");\n    require(tx.outputs[index].value == TOKEN_DUST, \"a sidecar carries the fixed dust\");\n    return true;\n}\n\n// No input from `from` on, and no output from `fromOutput` on, may sit at the sidecar contract. Right after a round\n// is made all its sidecars share the creating transaction, so without this an entry could pass a sibling sidecar as\n// \"funding\" and drain it, or leave a fake sidecar as \"change\" to swap in at the lock; either would freeze the round.\nfunction requireNoOtherSides(int from, int fromOutput, bytes sideLockingBytecode) returns (bool) {\n    for (int i = from; i < tx.inputs.length; i++) {\n        require(tx.inputs[i].lockingBytecode != sideLockingBytecode, \"no other sidecar may be spent here\");\n    }\n    for (int o = fromOutput; o < tx.outputs.length; o++) {\n        require(tx.outputs[o].lockingBytecode != sideLockingBytecode, \"no other sidecar may be made here\");\n    }\n    return true;\n}\n",
      "rules.cash": "pragma cashscript ^0.14.0;\n\n// Jōge's shared rules: NFT tags, round states, stake classes and fixed lifecycle fees.\n// Every number here is mirrored in packages/sdk/src/round/constants.ts; change both together.\n\n// First byte of every commitment of category K.\nbytes constant TAG_MASTER = 0x01;\nbytes constant TAG_GATE = 0x02;\nbytes constant TAG_TICKET = 0x03;\n\n// Master state byte (offset 5).\nbytes constant STATE_OPEN = 0x00;\nbytes constant STATE_LOCKED = 0x01;\nint constant STATE_SETTLED = 2;\nint constant STATE_VOID = 3;\n\n// Assets: index into the oracle table. Gold needs two feeds (USD/BCH and XAU/BCH).\nint constant ASSET_BTC = 0;\nint constant ASSET_ETH = 1;\nint constant ASSET_BCH = 2;\nint constant ASSET_GOLD = 3;\n// USD/BCH is in cents, XAU/BCH in ounces × 100000, so usd × 10^7 ÷ xau is dollars per ounce × 10^4.\nint constant GOLD_FACTOR = 10000000;\n\n// Modes (high nibble of the mode byte); outcomes are the low nibble.\nint constant MODE_UPDOWN = 0;\nint constant MODE_RANGES = 1;\nint constant NIBBLE = 16;\nint constant MAX_OUTCOMES = 6;\n\n// Stake classes (high nibble of the gate's class byte): satoshi bounds per entry and per gate.\nint constant CLASS_SHORT = 0;\nint constant CLASS_HOURLY = 1;\nint constant CLASS_EVENT = 2;\nint constant MIN_STAKE = 5000;\nint constant SHORT_MAX_STAKE = 500000;\nint constant HOURLY_MAX_STAKE = 5000000;\nint constant EVENT_MAX_STAKE = 25000000;\nint constant SHORT_GATE_CAP = 10000000;\nint constant HOURLY_GATE_CAP = 100000000;\nint constant EVENT_GATE_CAP = 500000000;\n\n// Fees and dust (satoshis). Lifecycle fees are fixed so every client builds the same bytes; calibrated on chipnet from\n// measured sizes (gold settle ~1,840 B, gold lock with one gate ~1,940 B, ~190 B per swept P2SH32 ticket) with headroom.\n// P2S tickets carry their ~112-byte script in the output: dust is 444 + 3 × ~188 B ≈ 1,008 sats, so 1,200.\nint constant TICKET_DUST = 1200;\n// Every gate is created holding exactly this; the lock counts anything beyond it as pot.\nint constant GATE_DUST = 1000;\n// An event entrant may leave before the lock; this share of the stake stays in the gate and joins the winners' pot.\nint constant EVENT_EXIT_FEE_BPS = 300;\n// P2PKH unlocking bytecode: 0x41 push, 64-byte Schnorr signature, then the sighash byte.\nbytes constant SIGNATURE_PUSH = 0x41;\nint constant SIGHASH_BYTE = 65;\nint constant MIN_FEE_OUTPUT = 1000;\nint constant LOCK_FEE_BASE = 1600;\nint constant LOCK_FEE_PER_GATE = 700;\n// An event gate's script is nearly twice a lane gate's (~690 bytes per merged gate, measured 2026-11-17: a 2-gate event\n// lock is ~3,090 bytes, which 1,600 + 2 × 700 could not pay), so events pay more per gate.\nint constant EVENT_LOCK_FEE_PER_GATE = 1100;\nint constant SETTLE_FEE = 2200;\nint constant SWEEP_FEE_BASE = 1000;\nint constant SWEEP_FEE_PER_TICKET = 250;\n// Each swept ticket costs ~20,000 operation-cost units; 32 padding bytes buy 25,600 (measured).\nint constant SWEEP_PAD_PER_TICKET = 32;\nint constant PROTOCOL_FEE_BPS = 200;\nint constant MAX_CREATOR_FEE_BPS = 300;\nint constant BPS = 10000;\n\n// Lifecycle transactions take every input at this sequence; the SDK default (0xfffffffe) would allow a second variant.\nint constant FINAL_SEQUENCE = 4294967295;\n// Timeout paths need a non-final sequence so the node enforces their locktime.\nint constant TIMEOUT_SEQUENCE = 4294967294;\nint constant TX_VERSION = 2;\n// After T_close, how long settlement has before anyone may void the round (MTP lags about an hour on mainnet).\nint constant SETTLE_TIMEOUT = 21600;\n\nfunction maxStake(int stakeClass) returns (int) {\n    require(stakeClass >= CLASS_SHORT && stakeClass <= CLASS_EVENT, \"unknown stake class\");\n    int limit = SHORT_MAX_STAKE;\n    if (stakeClass == CLASS_HOURLY) {\n        limit = HOURLY_MAX_STAKE;\n    } else if (stakeClass == CLASS_EVENT) {\n        limit = EVENT_MAX_STAKE;\n    }\n    return limit;\n}\n\nfunction gateCap(int stakeClass) returns (int) {\n    int cap = SHORT_GATE_CAP;\n    if (stakeClass == CLASS_HOURLY) {\n        cap = HOURLY_GATE_CAP;\n    } else if (stakeClass == CLASS_EVENT) {\n        cap = EVENT_GATE_CAP;\n    }\n    return cap;\n}\n\n// Gold in ten-thousandths of a US dollar per ounce, from the USD/BCH and XAU/BCH prices of the same minute.\nfunction goldPrice(int usdPerBch, int xauPerBch) returns (int) {\n    return usdPerBch * GOLD_FACTOR / xauPerBch;\n}\n"
    },
    "inlineRanges": "39:39:TAG_GATE;50:50:NIBBLE;52:52:CLASS_DOLLAR;54:54:NIBBLE;64:64:DOLLAR_MIN_STAKE;65:65:DOLLAR_MAX_STAKE;169:169:SIDE_SEED;170:170:DOLLAR_GATE_CAP;188:188:TAG_TICKET;227:227:TICKET_DUST;315:315:TAG_MASTER;324:324:STATE_OPEN;366:366:TAG_GATE;376:376:NIBBLE;378:378:CLASS_DOLLAR;404:404:TAG_TICKET;448:448:SIGNATURE_PUSH;450:450:SIGHASH_BYTE;454:454:SIGHASH_BYTE;557:557:EVENT_EXIT_FEE_BPS;559:559:BPS"
  },
  "compiler": {
    "name": "cashc",
    "version": "0.14.0",
    "options": {
      "enforceFunctionParameterTypes": true,
      "enforceLocktimeGuard": false
    }
  },
  "updatedAt": "2026-11-19T09:12:36.309Z"
} as const;
