export default {
  "contractName": "MasterSweep",
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
      "name": "sweep",
      "inputs": [
        {
          "name": "padding",
          "type": "bytes"
        }
      ]
    }
  ],
  "bytecode": "OP_0 OP_UTXOTOKENCOMMITMENT OP_0 OP_UTXOTOKENCATEGORY OP_2 OP_PICK OP_1 OP_CAT OP_EQUALVERIFY OP_DUP OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUALVERIFY OP_DUP OP_6 OP_SPLIT OP_DROP OP_5 OP_SPLIT OP_NIP OP_BIN2NUM OP_DUP OP_2 OP_NUMEQUAL OP_OVER OP_3 OP_NUMEQUAL OP_BOOLOR OP_VERIFY OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_TXLOCKTIME OP_0 OP_NUMEQUALVERIFY OP_0 OP_INPUTSEQUENCENUMBER ffffffff00 OP_NUMEQUALVERIFY OP_OVER OP_5 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_2 OP_PICK OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_3 OP_PICK OP_13 OP_SPLIT OP_DROP OP_7 OP_SPLIT OP_NIP OP_BIN2NUM OP_4 OP_PICK 13 OP_SPLIT OP_DROP OP_13 OP_SPLIT OP_NIP OP_BIN2NUM OP_5 OP_PICK 16 OP_SPLIT OP_DROP 13 OP_SPLIT OP_NIP OP_BIN2NUM OP_TXINPUTCOUNT OP_1SUB OP_2DUP OP_GREATERTHANOREQUAL OP_VERIFY OP_DUP OP_0 OP_GREATERTHAN OP_2 OP_PICK OP_0 OP_NUMEQUAL OP_BOOLOR OP_VERIFY OP_TXOUTPUTCOUNT OP_TXINPUTCOUNT OP_NUMEQUALVERIFY OP_10 OP_ROLL OP_0 OP_2 OP_PICK 20 OP_MUL OP_NUM2BIN OP_EQUALVERIFY OP_0 OP_0 OP_1 OP_BEGIN OP_DUP OP_TXINPUTCOUNT OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_DUP OP_UTXOTOKENCOMMITMENT OP_OVER OP_UTXOTOKENCATEGORY OP_13 OP_PICK OP_EQUALVERIFY OP_OVER OP_UTXOBYTECODE OP_14 OP_PICK OP_EQUALVERIFY OP_OVER OP_INPUTSEQUENCENUMBER ffffffff00 OP_NUMEQUALVERIFY OP_DUP OP_1 OP_SPLIT OP_DROP OP_3 OP_EQUALVERIFY OP_DUP OP_5 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_10 OP_PICK OP_EQUALVERIFY OP_DUP OP_12 OP_SPLIT OP_DROP OP_7 OP_SPLIT OP_NIP OP_BIN2NUM OP_0 OP_12 OP_PICK OP_3 OP_NUMEQUAL OP_IF OP_OVER OP_NIP OP_ELSE OP_2 OP_PICK OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_11 OP_PICK OP_NUMEQUAL OP_IF OP_OVER OP_10 OP_PICK OP_MUL OP_9 OP_PICK OP_DIV OP_NIP OP_ENDIF OP_ENDIF OP_DUP OP_4 OP_PICK OP_UTXOVALUE OP_ADD fa00 OP_SUB OP_4 OP_PICK OP_OUTPUTBYTECODE 76a914 OP_5 OP_PICK 20 OP_SPLIT OP_DROP OP_12 OP_SPLIT OP_NIP OP_CAT 88ac OP_CAT OP_EQUALVERIFY OP_4 OP_PICK OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY OP_4 OP_PICK OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_6 OP_PICK OP_5 OP_PICK OP_UTXOVALUE OP_ADD OP_7 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_2SWAP OP_ROT OP_FROMALTSTACK OP_FROMALTSTACK OP_FROMALTSTACK OP_5 OP_PICK OP_OVER OP_ADD OP_6 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_2SWAP OP_ROT OP_FROMALTSTACK OP_FROMALTSTACK OP_4 OP_ROLL OP_1ADD OP_SWAP OP_TOALTSTACK OP_SWAP OP_2SWAP OP_ROT OP_FROMALTSTACK OP_2DROP OP_2DROP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_0 OP_UTXOVALUE OP_ROT OP_ADD OP_SWAP OP_SUB e803 OP_SUB OP_OVER fa00 OP_MUL OP_SUB OP_ROT OP_ROT OP_SUB OP_DUP OP_0 OP_NUMEQUAL OP_0 OP_OUTPUTBYTECODE 76a914 OP_10 OP_PICK 2a OP_SPLIT OP_DROP 16 OP_SPLIT OP_NIP OP_CAT 88ac OP_CAT OP_EQUAL OP_BOOLAND OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUAL OP_BOOLAND OP_OVER OP_0 OP_GREATERTHAN OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUAL OP_BOOLAND OP_0 OP_OUTPUTTOKENCATEGORY OP_11 OP_ROLL OP_1 OP_CAT OP_EQUAL OP_BOOLAND OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUAL OP_BOOLAND OP_0 OP_OUTPUTTOKENCOMMITMENT OP_10 OP_PICK 13 OP_SPLIT OP_DROP OP_4 OP_ROLL OP_3 OP_NUM2BIN OP_CAT OP_10 OP_ROLL 2a OP_SPLIT OP_DROP 16 OP_SPLIT OP_NIP OP_CAT OP_EQUAL OP_BOOLAND OP_0 OP_OUTPUTVALUE OP_3 OP_ROLL OP_NUMEQUALVERIFY OP_BOOLOR OP_VERIFY OP_2DROP OP_2DROP OP_2DROP OP_1",
  "source": "pragma cashscript ^0.14.0;\n\nimport \"./rules.cash\";\n\n// A settled or void round paying out. Commitment:\n//   [0] tag 0x01 · [1,5) round id · [5] state 0x02 settled / 0x03 void · [6] winning outcome (0xff when void)\n//   [7,13) pot after fees · [13,19) winning stake total · [19,22) tickets left · [22,42) creator pubkey hash\n//\n// Sweep: anyone, in batches. Input i (i ≥ 1) is a ticket of this round and output i pays its owner:\n//   winner: floor(stake × pot ÷ winning total) + ticket dust − per-ticket fee; void: stake + dust − fee;\n//   loser: dust − fee. Payouts use figures frozen at settlement, so batch order never changes anyone's amount.\n// The batch that takes the last ticket burns the master and returns what is left to the round's creator.\ncontract MasterSweep(bytes32 category, bytes ticketLockingBytecode) {\n    // `padding` buys operation-cost budget (800 per unlocking byte): exactly SWEEP_PAD_PER_TICKET zero bytes per ticket,\n    // so one sweep pays hundreds of tickets and every client still builds the same bytes.\n    function sweep(bytes padding) {\n        bytes master = tx.inputs[0].nftCommitment;\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be a round master\");\n        require(master.slice(0, 1) == TAG_MASTER, \"not a master commitment\");\n        int state = int(master.slice(5, 6));\n        require(state == STATE_SETTLED || state == STATE_VOID, \"the round has not settled\");\n        require(tx.version == TX_VERSION, \"lifecycle transactions are version 2\");\n        require(tx.locktime == 0, \"sweep carries no locktime\");\n        require(tx.inputs[0].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n\n        bytes roundId = master.slice(1, 5);\n        int winner = int(master.slice(6, 7));\n        int pot = int(master.slice(7, 13));\n        int winnerTotal = int(master.slice(13, 19));\n        int remaining = int(master.slice(19, 22));\n        int tickets = tx.inputs.length - 1;\n        require(tickets <= remaining, \"more tickets than the round has left\");\n        require(tickets > 0 || remaining == 0, \"a sweep takes at least one ticket\");\n        require(tx.outputs.length == tx.inputs.length, \"one payout per ticket, plus the master\");\n        require(padding == toPaddedBytes(0, tickets * SWEEP_PAD_PER_TICKET), \"padding is fixed per ticket\");\n\n        int ticketValue = 0;\n        int paid = 0;\n        for (int i = 1; i < tx.inputs.length; i++) {\n            bytes ticket = tx.inputs[i].nftCommitment;\n            require(tx.inputs[i].tokenCategory == category, \"input must be a ticket of this category\");\n            require(tx.inputs[i].lockingBytecode == ticketLockingBytecode, \"input must sit at the ticket contract\");\n            require(tx.inputs[i].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n            require(ticket.slice(0, 1) == TAG_TICKET, \"not a ticket commitment\");\n            require(ticket.slice(1, 5) == roundId, \"ticket belongs to another round\");\n            int stake = int(ticket.slice(7, 12));\n            int share = 0;\n            if (state == STATE_VOID) {\n                share = stake;\n            } else if (int(ticket.slice(6, 7)) == winner) {\n                share = stake * pot / winnerTotal;\n            }\n            int payout = share + tx.inputs[i].value - SWEEP_FEE_PER_TICKET;\n            require(\n                tx.outputs[i].lockingBytecode == new LockingBytecodeP2PKH(unsafe_bytes20(ticket.slice(12, 32))),\n                \"output pays the ticket's owner\"\n            );\n            require(tx.outputs[i].value == payout, \"payout amount\");\n            require(tx.outputs[i].tokenCategory == 0x, \"payout carries no tokens\");\n            ticketValue = ticketValue + tx.inputs[i].value;\n            paid = paid + payout;\n        }\n\n        int rest = tx.inputs[0].value + ticketValue - paid - SWEEP_FEE_BASE - tickets * SWEEP_FEE_PER_TICKET;\n        int left = remaining - tickets;\n        bool burned = left == 0\n            && tx.outputs[0].lockingBytecode == new LockingBytecodeP2PKH(unsafe_bytes20(master.slice(22, 42)))\n            && tx.outputs[0].tokenCategory == 0x;\n        bool kept = left > 0\n            && tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode\n            && tx.outputs[0].tokenCategory == category + 0x01\n            && tx.outputs[0].tokenAmount == 0\n            && tx.outputs[0].nftCommitment == master.slice(0, 19) + toPaddedBytes(left, 3) + master.slice(22, 42);\n        require(tx.outputs[0].value == rest, \"the master keeps exactly what is left\");\n        require(burned || kept, \"the master carries on, or goes back to its creator after the last ticket\");\n    }\n}\n",
  "fingerprint": "44a5a76008e6ebbfc9949f12467831368ab77f2613c3c190a47847162c03657a",
  "debug": {
    "bytecode": "00cf00ce5279517e8876517f75518876567f75557f778176529c78539c9b69c2529dc5009d00cb05ffffffff009d78557f75517f775279577f75567f778153795d7f75577f7781547901137f755d7f7781557901167f7501137f7781c38c6ea2697600a05279009c9b69c4c39d5a7a00527901209580880000516576c39f766b6376cf78ce5d798878c75e798878cb05ffffffff009d76517f75538876557f75517f775a7988765c7f75577f7781005c79539c637877675279577f75567f77815b799c63785a7995597996776868765479c69302fa00945479cd0376a914557901207f755c7f777e0288ac7e885479cc789d5479d1008856795579c693577a757c6b7c6b7c6b7c727b6c6c6c55797893567a757c6b7c6b7c727b6c6c547a8b7c6b7c727b6c6d6d686c91667500c67b937c9402e803947802fa0095947b7b9476009c00cd0376a9145a79012a7f7501167f777e0288ac7e879a00d100879a7800a000cd00c7879a00d15b7a517e879a00d3009c9a00d25a7901137f75547a53807e5a7a012a7f7501167f777e879a00cc537a9d9b696d6d6d51",
    "sourceMap": "17:33:17:34;:23::49:1;18:26:18:27:0;:16::42:1;:46::54:0;;:57::61;:46:::1;:8::97;19:16:19:22:0;:32::33;:16::34:1;;:38::48;:8::77;20:24:20:30:0;:40::41;:24::42:1;;:37::38:0;:24::42:1;;:20::43;21:16:21:21:0;:25::38:1;:16;:42::47:0;:51::61:1;:42;:16;:8::92;22:16:22:26:0;:30::40:1;:8::82;23:16:23:27:0;:31::32;:8::63:1;24:26:24:27:0;:16::43:1;:47::61;:8::81;26:24:26:30:0;:40::41;:24::42:1;;:37::38:0;:24::42:1;;27:25:27:31:0;;:41::42;:25::43:1;;:38::39:0;:25::43:1;;:21::44;28:22:28:28:0;;:38::40;:22::41:1;;:35::36:0;:22::41:1;;:18::42;29:30:29:36:0;;:47::49;:30::50:1;;:43::45:0;:30::50:1;;:26::51;30:28:30:34:0;;:45::47;:28::48:1;;:41::43:0;:28::48:1;;:24::49;31:22:31:38:0;:::42:1;32:16:32:36:0;::::1;:8::78;33:16:33:23:0;:26::27;:16:::1;:31::40:0;;:44::45;:31:::1;:16;:8::84;34:16:34:33:0;:37::53;:8::97:1;35:16:35:23:0;;:41::42;:44::51;;:54::74:1;:44;:27::75;:8::108;37:26:37:27:0;38:19:38:20;39:21:39:22;:8:62:9;:24:39:25;:28::44;:24:::1;;;:51:62:9:0;40:37:40:38;:27::53:1;41:30:41:31:0;:20::46:1;:50::58:0;;:12::103:1;42:30:42:31:0;:20::48:1;:52::73:0;;:12::116:1;43:30:43:31:0;:20::47:1;:51::65;:12::85;44:20:44:26:0;:36::37;:20::38:1;;:42::52;:12::81;45:20:45:26:0;:36::37;:20::38:1;;:33::34:0;:20::38:1;;:42::49:0;;:12::86:1;46:28:46:34:0;:44::46;:28::47:1;;:41::42:0;:28::47:1;;:24::48;47::47:25:0;48:16:48:21;;:25::35:1;:16;:37:50:13:0;49:24:49:29;:16::30:1;50:19:52:13:0;:27:50:33;;:43::44;:27::45:1;;:40::41:0;:27::45:1;;:23::46;:50::56:0;;:23:::1;:58:52:13:0;51:24:51:29;:32::35;;:24:::1;:38::49:0;;:24:::1;:16::50;50:58:52:13;:19;53:25:53:30:0;:43::44;;:33::51:1;:25;:54::74;:25;55:27:55:28:0;;:16::45:1;:49::111:0;:89::95;;:106::108;:89::109:1;;:102::104:0;:89::109:1;;:49::111;;;54:12:57:14;58:31:58:32:0;;:20::39:1;:43::49:0;:12::68:1;59:31:59:32:0;;:20::47:1;:51::53:0;:12::83:1;60:26:60:37:0;;:50::51;;:40::58:1;:26;:12::59;;;;;;;;;;;;;;;61:19:61:23:0;;:26::32;:19:::1;:12::33;;;;;;;;;;;;39:46:39:49;;;;;;;;;:51:62:9;;;;:8;;;64:29:64:30:0;:19::37:1;:40::51:0;:19:::1;:54::58:0;:19:::1;:61::75;:19;:78::85:0;:88::108:1;:78;:19;65::65:28:0;:31::38;:19:::1;66:22:66:26:0;:30::31;:22:::1;67:26:67:27:0;:15::44:1;:48::110:0;:88::94;;:105::107;:88::108:1;;:101::103:0;:88::108:1;;:48::110;;;:15;66:22;68:26:68:27:0;:15::42:1;:46::48:0;:15:::1;66:22;69:20:69:24:0;:27::28;:20:::1;70:26:70:27:0;:15::44:1;:58::59:0;:48::76:1;:15;69:20;71:26:71:27:0;:15::42:1;:46::54:0;;:57::61;:46:::1;:15;69:20;72:26:72:27:0;:15::40:1;:44::45:0;:15:::1;69:20;73:26:73:27:0;:15::42:1;:46::52:0;;:62::64;:46::65:1;;:82::86:0;;:88::89;:68::90:1;:46;:93::99:0;;:110::112;:93::113:1;;:106::108:0;:93::113:1;;:46;:15;69:20;74:27:74:28:0;:16::35:1;:39::43:0;;:8::86:1;75:16:75:30;:8::108;16:34:76:5;;;",
    "logs": [],
    "requires": [
      {
        "ip": 10,
        "line": 18,
        "message": "input 0 must be a round master"
      },
      {
        "ip": 16,
        "line": 19,
        "message": "not a master commitment"
      },
      {
        "ip": 32,
        "line": 21,
        "message": "the round has not settled"
      },
      {
        "ip": 35,
        "line": 22,
        "message": "lifecycle transactions are version 2"
      },
      {
        "ip": 38,
        "line": 23,
        "message": "sweep carries no locktime"
      },
      {
        "ip": 42,
        "line": 24,
        "message": "fixed sequence"
      },
      {
        "ip": 90,
        "line": 32,
        "message": "more tickets than the round has left"
      },
      {
        "ip": 99,
        "line": 33,
        "message": "a sweep takes at least one ticket"
      },
      {
        "ip": 102,
        "line": 34,
        "message": "one payout per ticket, plus the master"
      },
      {
        "ip": 111,
        "line": 35,
        "message": "padding is fixed per ticket"
      },
      {
        "ip": 128,
        "line": 41,
        "message": "input must be a ticket of this category"
      },
      {
        "ip": 133,
        "line": 42,
        "message": "input must sit at the ticket contract"
      },
      {
        "ip": 137,
        "line": 43,
        "message": "fixed sequence"
      },
      {
        "ip": 143,
        "line": 44,
        "message": "not a ticket commitment"
      },
      {
        "ip": 153,
        "line": 45,
        "message": "ticket belongs to another round"
      },
      {
        "ip": 216,
        "line": 54,
        "message": "output pays the ticket's owner"
      },
      {
        "ip": 221,
        "line": 58,
        "message": "payout amount"
      },
      {
        "ip": 226,
        "line": 59,
        "message": "payout carries no tokens"
      },
      {
        "ip": 368,
        "line": 74,
        "message": "the master keeps exactly what is left"
      },
      {
        "ip": 370,
        "line": 75,
        "message": "the master carries on, or goes back to its creator after the last ticket"
      }
    ],
    "sourceTags": "262:270:fu;271:272:sc;273:276:lc;277:277:sc",
    "functions": [
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
      }
    ],
    "sources": {
      "rules.cash": "pragma cashscript ^0.14.0;\n\n// Jōge's shared rules: NFT tags, round states, stake classes and fixed lifecycle fees.\n// Every number here is mirrored in packages/sdk/src/round/constants.ts; change both together.\n\n// First byte of every commitment of category K.\nbytes constant TAG_MASTER = 0x01;\nbytes constant TAG_GATE = 0x02;\nbytes constant TAG_TICKET = 0x03;\n\n// Master state byte (offset 5).\nbytes constant STATE_OPEN = 0x00;\nbytes constant STATE_LOCKED = 0x01;\nint constant STATE_SETTLED = 2;\nint constant STATE_VOID = 3;\n\n// Assets: index into the oracle table. Gold needs two feeds (USD/BCH and XAU/BCH).\nint constant ASSET_BTC = 0;\nint constant ASSET_ETH = 1;\nint constant ASSET_BCH = 2;\nint constant ASSET_GOLD = 3;\n// USD/BCH is in cents, XAU/BCH in ounces × 100000, so usd × 10^7 ÷ xau is dollars per ounce × 10^4.\nint constant GOLD_FACTOR = 10000000;\n\n// Modes (high nibble of the mode byte); outcomes are the low nibble.\nint constant MODE_UPDOWN = 0;\nint constant MODE_RANGES = 1;\nint constant NIBBLE = 16;\nint constant MAX_OUTCOMES = 6;\n\n// Stake classes (high nibble of the gate's class byte): satoshi bounds per entry and per gate.\nint constant CLASS_SHORT = 0;\nint constant CLASS_HOURLY = 1;\nint constant CLASS_EVENT = 2;\nint constant MIN_STAKE = 5000;\nint constant SHORT_MAX_STAKE = 500000;\nint constant HOURLY_MAX_STAKE = 5000000;\nint constant EVENT_MAX_STAKE = 25000000;\nint constant SHORT_GATE_CAP = 10000000;\nint constant HOURLY_GATE_CAP = 100000000;\nint constant EVENT_GATE_CAP = 500000000;\n\n// Fees and dust (satoshis). Lifecycle fees are fixed so every client builds the same bytes; calibrated on chipnet from\n// measured sizes (gold settle ~1,840 B, gold lock with one gate ~1,940 B, ~190 B per swept P2SH32 ticket) with headroom.\n// P2S tickets carry their ~112-byte script in the output: dust is 444 + 3 × ~188 B ≈ 1,008 sats, so 1,200.\nint constant TICKET_DUST = 1200;\n// Every gate is created holding exactly this; the lock counts anything beyond it as pot.\nint constant GATE_DUST = 1000;\n// An event entrant may leave before the lock; this share of the stake stays in the gate and joins the winners' pot.\nint constant EVENT_EXIT_FEE_BPS = 300;\n// P2PKH unlocking bytecode: 0x41 push, 64-byte Schnorr signature, then the sighash byte.\nbytes constant SIGNATURE_PUSH = 0x41;\nint constant SIGHASH_BYTE = 65;\nint constant MIN_FEE_OUTPUT = 1000;\nint constant LOCK_FEE_BASE = 1600;\nint constant LOCK_FEE_PER_GATE = 700;\n// An event gate's script is nearly twice a lane gate's (~690 bytes per merged gate, measured 2026-11-17: a 2-gate event\n// lock is ~3,090 bytes, which 1,600 + 2 × 700 could not pay), so events pay more per gate.\nint constant EVENT_LOCK_FEE_PER_GATE = 1100;\nint constant SETTLE_FEE = 2200;\nint constant SWEEP_FEE_BASE = 1000;\nint constant SWEEP_FEE_PER_TICKET = 250;\n// Each swept ticket costs ~20,000 operation-cost units; 32 padding bytes buy 25,600 (measured).\nint constant SWEEP_PAD_PER_TICKET = 32;\nint constant PROTOCOL_FEE_BPS = 200;\nint constant MAX_CREATOR_FEE_BPS = 300;\nint constant BPS = 10000;\n\n// Lifecycle transactions take every input at this sequence; the SDK default (0xfffffffe) would allow a second variant.\nint constant FINAL_SEQUENCE = 4294967295;\n// Timeout paths need a non-final sequence so the node enforces their locktime.\nint constant TIMEOUT_SEQUENCE = 4294967294;\nint constant TX_VERSION = 2;\n// After T_close, how long settlement has before anyone may void the round (MTP lags about an hour on mainnet).\nint constant SETTLE_TIMEOUT = 21600;\n\nfunction maxStake(int stakeClass) returns (int) {\n    require(stakeClass >= CLASS_SHORT && stakeClass <= CLASS_EVENT, \"unknown stake class\");\n    int limit = SHORT_MAX_STAKE;\n    if (stakeClass == CLASS_HOURLY) {\n        limit = HOURLY_MAX_STAKE;\n    } else if (stakeClass == CLASS_EVENT) {\n        limit = EVENT_MAX_STAKE;\n    }\n    return limit;\n}\n\nfunction gateCap(int stakeClass) returns (int) {\n    int cap = SHORT_GATE_CAP;\n    if (stakeClass == CLASS_HOURLY) {\n        cap = HOURLY_GATE_CAP;\n    } else if (stakeClass == CLASS_EVENT) {\n        cap = EVENT_GATE_CAP;\n    }\n    return cap;\n}\n\n// Gold in ten-thousandths of a US dollar per ounce, from the USD/BCH and XAU/BCH prices of the same minute.\nfunction goldPrice(int usdPerBch, int xauPerBch) returns (int) {\n    return usdPerBch * GOLD_FACTOR / xauPerBch;\n}\n"
    },
    "inlineRanges": "15:15:TAG_MASTER;26:26:STATE_SETTLED;29:29:STATE_VOID;34:34:TX_VERSION;41:41:FINAL_SEQUENCE;108:108:SWEEP_PAD_PER_TICKET;136:136:FINAL_SEQUENCE;142:142:TAG_TICKET;165:165:STATE_VOID;199:199:SWEEP_FEE_PER_TICKET;286:286:SWEEP_FEE_BASE;289:289:SWEEP_FEE_PER_TICKET"
  },
  "compiler": {
    "name": "cashc",
    "version": "0.14.0",
    "options": {
      "enforceFunctionParameterTypes": true,
      "enforceLocktimeGuard": false
    }
  },
  "updatedAt": "2026-11-19T09:12:36.935Z"
} as const;
