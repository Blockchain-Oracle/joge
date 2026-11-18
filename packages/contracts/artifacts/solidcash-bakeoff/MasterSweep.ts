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
      "selector": "8fa248cd",
      "inputs": [
        {
          "name": "padding",
          "type": "bytes"
        }
      ],
      "sourceEffectOrder": "unsupported-flow"
    }
  ],
  "bytecode": "OP_0 OP_UTXOTOKENCOMMITMENT OP_0 OP_UTXOTOKENCATEGORY OP_2 OP_PICK OP_1 OP_CAT OP_EQUALVERIFY OP_DUP OP_1 OP_SPLIT OP_DROP OP_1 OP_EQUALVERIFY OP_DUP OP_6 OP_SPLIT OP_DROP OP_5 OP_SPLIT OP_NIP OP_BIN2NUM OP_DUP OP_2 OP_NUMEQUAL OP_IF OP_1 OP_ELSE OP_DUP OP_3 OP_NUMEQUAL OP_ENDIF OP_VERIFY OP_TXVERSION OP_2 OP_NUMEQUALVERIFY OP_TXLOCKTIME OP_0 OP_NUMEQUALVERIFY OP_0 OP_INPUTSEQUENCENUMBER ffffffff00 OP_NUMEQUALVERIFY OP_OVER OP_5 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_2 OP_PICK OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_3 OP_PICK OP_13 OP_SPLIT OP_DROP OP_7 OP_SPLIT OP_NIP OP_BIN2NUM OP_4 OP_PICK 13 OP_SPLIT OP_DROP OP_13 OP_SPLIT OP_NIP OP_BIN2NUM OP_5 OP_PICK 16 OP_SPLIT OP_DROP 13 OP_SPLIT OP_NIP OP_BIN2NUM OP_TXINPUTCOUNT OP_1SUB OP_2DUP OP_GREATERTHANOREQUAL OP_VERIFY OP_DUP OP_0 OP_GREATERTHAN OP_IF OP_1 OP_ELSE OP_OVER OP_0 OP_NUMEQUAL OP_ENDIF OP_VERIFY OP_TXOUTPUTCOUNT OP_TXINPUTCOUNT OP_NUMEQUALVERIFY OP_10 OP_ROLL OP_0 OP_2 OP_PICK 20 OP_MUL OP_NUM2BIN OP_EQUALVERIFY OP_0 OP_0 OP_1 OP_BEGIN OP_DUP OP_TXINPUTCOUNT OP_LESSTHAN OP_IF OP_DUP OP_UTXOTOKENCOMMITMENT OP_OVER OP_UTXOTOKENCATEGORY OP_13 OP_PICK OP_EQUALVERIFY OP_OVER OP_UTXOBYTECODE OP_14 OP_PICK OP_EQUALVERIFY OP_OVER OP_INPUTSEQUENCENUMBER ffffffff00 OP_NUMEQUALVERIFY OP_DUP OP_1 OP_SPLIT OP_DROP OP_3 OP_EQUALVERIFY OP_DUP OP_5 OP_SPLIT OP_DROP OP_1 OP_SPLIT OP_NIP OP_10 OP_PICK OP_EQUALVERIFY OP_DUP OP_12 OP_SPLIT OP_DROP OP_7 OP_SPLIT OP_NIP OP_BIN2NUM OP_0 OP_12 OP_PICK OP_3 OP_NUMEQUAL OP_IF OP_OVER OP_NIP OP_ELSE OP_2 OP_PICK OP_7 OP_SPLIT OP_DROP OP_6 OP_SPLIT OP_NIP OP_BIN2NUM OP_11 OP_PICK OP_NUMEQUAL OP_IF OP_OVER OP_10 OP_PICK OP_MUL OP_9 OP_PICK OP_DIV OP_NIP OP_ENDIF OP_ENDIF OP_DUP OP_4 OP_PICK OP_UTXOVALUE OP_ADD fa00 OP_SUB OP_4 OP_PICK OP_OUTPUTBYTECODE 76a914 OP_5 OP_PICK 20 OP_SPLIT OP_DROP OP_12 OP_SPLIT OP_NIP OP_CAT 88ac OP_CAT OP_EQUALVERIFY OP_4 OP_PICK OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY OP_4 OP_PICK OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY OP_6 OP_PICK OP_5 OP_PICK OP_UTXOVALUE OP_ADD OP_7 OP_ROLL OP_DROP OP_6 OP_ROLL OP_6 OP_ROLL OP_6 OP_ROLL OP_6 OP_ROLL OP_6 OP_ROLL OP_6 OP_ROLL OP_5 OP_PICK OP_OVER OP_ADD OP_6 OP_ROLL OP_DROP OP_2ROT OP_2ROT OP_5 OP_ROLL OP_4 OP_PICK OP_1ADD OP_5 OP_ROLL OP_DROP OP_4 OP_ROLL OP_4 OP_ROLL OP_4 OP_ROLL OP_4 OP_ROLL OP_2DROP OP_2DROP OP_0 OP_ELSE OP_1 OP_ENDIF OP_UNTIL OP_0 OP_UTXOVALUE OP_3 OP_ROLL OP_ADD OP_ROT OP_SUB e803 OP_SUB OP_2 OP_PICK fa00 OP_MUL OP_SUB OP_3 OP_PICK OP_3 OP_ROLL OP_SUB OP_DUP OP_0 OP_NUMEQUAL OP_IF OP_0 OP_OUTPUTBYTECODE 76a914 OP_11 OP_PICK 2a OP_SPLIT OP_DROP 16 OP_SPLIT OP_NIP OP_CAT 88ac OP_CAT OP_EQUAL OP_ELSE OP_0 OP_ENDIF OP_IF OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUAL OP_ELSE OP_0 OP_ENDIF OP_OVER OP_0 OP_GREATERTHAN OP_IF OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUAL OP_ELSE OP_0 OP_ENDIF OP_IF OP_0 OP_OUTPUTTOKENCATEGORY OP_12 OP_PICK OP_1 OP_CAT OP_EQUAL OP_ELSE OP_0 OP_ENDIF OP_IF OP_0 OP_OUTPUTTOKENAMOUNT OP_0 OP_NUMEQUAL OP_ELSE OP_0 OP_ENDIF OP_IF OP_0 OP_OUTPUTTOKENCOMMITMENT OP_11 OP_PICK 13 OP_SPLIT OP_DROP OP_3 OP_PICK OP_3 OP_NUM2BIN OP_CAT OP_12 OP_PICK 2a OP_SPLIT OP_DROP 16 OP_SPLIT OP_NIP OP_CAT OP_EQUAL OP_ELSE OP_0 OP_ENDIF OP_0 OP_OUTPUTVALUE OP_4 OP_ROLL OP_NUMEQUALVERIFY OP_SWAP OP_IF OP_1 OP_ELSE OP_DUP OP_ENDIF OP_VERIFY OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_1",
  "source": "pragma solidcash ^0.51.0;\n\n// SolidCash port of cashscript/MasterSweep.cash (S00 bake-off; kept in step for BAKEOFF=1 runs).\n\n// Jōge's shared rules: NFT tags, round states, stake classes and fixed lifecycle fees.\n// Generated from cashscript/rules.cash (same values); mirrored in packages/sdk/src/round/constants.ts.\n\n// First byte of every commitment of category K.\nbytes1 constant TAG_MASTER = 0x01;\nbytes1 constant TAG_GATE = 0x02;\nbytes1 constant TAG_TICKET = 0x03;\n\n// Master state byte (offset 5).\nbytes1 constant STATE_OPEN = 0x00;\nbytes1 constant STATE_LOCKED = 0x01;\nbigint constant STATE_SETTLED = 2;\nbigint constant STATE_VOID = 3;\n\n// Assets: index into the oracle table. Gold needs two feeds (USD/BCH and XAU/BCH).\nbigint constant ASSET_BTC = 0;\nbigint constant ASSET_ETH = 1;\nbigint constant ASSET_BCH = 2;\nbigint constant ASSET_GOLD = 3;\n// USD/BCH is in cents, XAU/BCH in ounces × 100000, so usd × 10^7 ÷ xau is dollars per ounce × 10^4.\nbigint constant GOLD_FACTOR = 10000000;\n\n// Modes (high nibble of the mode byte); outcomes are the low nibble.\nbigint constant MODE_UPDOWN = 0;\nbigint constant MODE_RANGES = 1;\nbigint constant NIBBLE = 16;\nbigint constant MAX_OUTCOMES = 6;\n\n// Stake classes (high nibble of the gate's class byte): satoshi bounds per entry and per gate.\nbigint constant CLASS_SHORT = 0;\nbigint constant CLASS_HOURLY = 1;\nbigint constant CLASS_EVENT = 2;\nbigint constant MIN_STAKE = 5000;\nbigint constant SHORT_MAX_STAKE = 500000;\nbigint constant HOURLY_MAX_STAKE = 5000000;\nbigint constant EVENT_MAX_STAKE = 25000000;\nbigint constant SHORT_GATE_CAP = 10000000;\nbigint constant HOURLY_GATE_CAP = 100000000;\nbigint constant EVENT_GATE_CAP = 500000000;\n\n// Fees and dust (satoshis). Lifecycle fees are fixed so every client builds the same bytes; calibrated in S00 from\n// measured sizes (gold settle ~1,840 B, gold lock with one gate ~1,940 B, ~190 B per swept P2SH32 ticket) with headroom.\n// P2S tickets carry their ~112-byte script in the output: dust is 444 + 3 × ~188 B ≈ 1,008 sats, so 1,200.\nbigint constant TICKET_DUST = 1200;\n// Every gate is created holding exactly this; the lock counts anything beyond it as pot.\nbigint constant GATE_DUST = 1000;\n// An event entrant may leave before the lock; this share of the stake stays in the gate and joins the winners' pot.\nbigint constant EVENT_EXIT_FEE_BPS = 300;\n// P2PKH unlocking bytecode: 0x41 push, 64-byte Schnorr signature, then the sighash byte.\nbytes1 constant SIGNATURE_PUSH = 0x41;\nbigint constant SIGHASH_BYTE = 65;\nbigint constant MIN_FEE_OUTPUT = 1000;\nbigint constant LOCK_FEE_BASE = 1600;\nbigint constant LOCK_FEE_PER_GATE = 700;\nbigint constant SETTLE_FEE = 2200;\nbigint constant SWEEP_FEE_BASE = 1000;\nbigint constant SWEEP_FEE_PER_TICKET = 250;\n// Each swept ticket costs ~20,000 operation-cost units; 32 padding bytes buy 25,600 (measured in S00).\nbigint constant SWEEP_PAD_PER_TICKET = 32;\nbigint constant PROTOCOL_FEE_BPS = 200;\nbigint constant MAX_CREATOR_FEE_BPS = 300;\nbigint constant BPS = 10000;\n\n// Lifecycle transactions take every input at this sequence; the SDK default (0xfffffffe) would allow a second variant.\nbigint constant FINAL_SEQUENCE = 4294967295;\n// Timeout paths need a non-final sequence so the node enforces their locktime.\nbigint constant TIMEOUT_SEQUENCE = 4294967294;\nbigint constant TX_VERSION = 2;\n// After T_close, how long settlement has before anyone may void the round (MTP lags about an hour on mainnet).\nbigint constant SETTLE_TIMEOUT = 21600;\n\nfunction maxStake(bigint stakeClass) returns (int) {\n    require(stakeClass >= CLASS_SHORT && stakeClass <= CLASS_EVENT, \"unknown stake class\");\n    bigint limit = SHORT_MAX_STAKE;\n    if (stakeClass == CLASS_HOURLY) {\n        limit = HOURLY_MAX_STAKE;\n    } else if (stakeClass == CLASS_EVENT) {\n        limit = EVENT_MAX_STAKE;\n    }\n    return limit;\n}\n\nfunction gateCap(bigint stakeClass) returns (int) {\n    bigint cap = SHORT_GATE_CAP;\n    if (stakeClass == CLASS_HOURLY) {\n        cap = HOURLY_GATE_CAP;\n    } else if (stakeClass == CLASS_EVENT) {\n        cap = EVENT_GATE_CAP;\n    }\n    return cap;\n}\n\n// Gold in ten-thousandths of a US dollar per ounce, from the USD/BCH and XAU/BCH prices of the same minute.\nfunction goldPrice(bigint usdPerBch, bigint xauPerBch) returns (int) {\n    return usdPerBch * GOLD_FACTOR / xauPerBch;\n}\n\n\n// A settled or void round paying out. Commitment:\n//   [0] tag 0x01 · [1,5) round id · [5] state 0x02 settled / 0x03 void · [6] winning outcome (0xff when void)\n//   [7,13) pot after fees · [13,19) winning stake total · [19,22) tickets left · [22,42) creator pubkey hash\n//\n// Sweep: anyone, in batches. Input i (i ≥ 1) is a ticket of this round and output i pays its owner:\n//   winner: floor(stake × pot ÷ winning total) + ticket dust − per-ticket fee; void: stake + dust − fee;\n//   loser: dust − fee. Payouts use figures frozen at settlement, so batch order never changes anyone's amount.\n// The batch that takes the last ticket burns the master and returns what is left to the round's creator.\ncontract MasterSweep(bytes32 category, bytes ticketLockingBytecode) {\n    // `padding` buys operation-cost budget (800 per unlocking byte): exactly SWEEP_PAD_PER_TICKET zero bytes per ticket,\n    // so one sweep pays hundreds of tickets and every client still builds the same bytes.\n    function sweep(bytes padding) {\n        bytes master = tx.inputs[0].nftCommitment;\n        require(tx.inputs[0].tokenCategory == category + 0x01, \"input 0 must be a round master\");\n        require(master.slice(0, 1) == TAG_MASTER, \"not a master commitment\");\n        bigint state = bigint(master.slice(5, 6));\n        require(state == STATE_SETTLED || state == STATE_VOID, \"the round has not settled\");\n        require(tx.version == TX_VERSION, \"lifecycle transactions are version 2\");\n        require(tx.locktime == 0, \"sweep carries no locktime\");\n        require(tx.inputs[0].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n\n        bytes roundId = master.slice(1, 5);\n        bigint winner = bigint(master.slice(6, 7));\n        bigint pot = bigint(master.slice(7, 13));\n        bigint winnerTotal = bigint(master.slice(13, 19));\n        bigint remaining = bigint(master.slice(19, 22));\n        bigint tickets = tx.inputs.length - 1;\n        require(tickets <= remaining, \"more tickets than the round has left\");\n        require(tickets > 0 || remaining == 0, \"a sweep takes at least one ticket\");\n        require(tx.outputs.length == tx.inputs.length, \"one payout per ticket, plus the master\");\n        require(padding == toPaddedBytes(0, tickets * SWEEP_PAD_PER_TICKET), \"padding is fixed per ticket\");\n\n        bigint ticketValue = 0;\n        bigint paid = 0;\n        for (bigint i = 1; i < tx.inputs.length; i++) {\n            bytes ticket = tx.inputs[i].nftCommitment;\n            require(tx.inputs[i].tokenCategory == category, \"input must be a ticket of this category\");\n            require(tx.inputs[i].lockingBytecode == ticketLockingBytecode, \"input must sit at the ticket contract\");\n            require(tx.inputs[i].sequenceNumber == FINAL_SEQUENCE, \"fixed sequence\");\n            require(ticket.slice(0, 1) == TAG_TICKET, \"not a ticket commitment\");\n            require(ticket.slice(1, 5) == roundId, \"ticket belongs to another round\");\n            bigint stake = bigint(ticket.slice(7, 12));\n            bigint share = 0;\n            if (state == STATE_VOID) {\n                share = stake;\n            } else if (bigint(ticket.slice(6, 7)) == winner) {\n                share = stake * pot / winnerTotal;\n            }\n            bigint payout = share + tx.inputs[i].value - SWEEP_FEE_PER_TICKET;\n            require(\n                tx.outputs[i].lockingBytecode == new LockingBytecodeP2PKH(unsafe_bytes20(ticket.slice(12, 32))),\n                \"output pays the ticket's owner\"\n            );\n            require(tx.outputs[i].value == payout, \"payout amount\");\n            require(tx.outputs[i].tokenCategory == 0x, \"payout carries no tokens\");\n            ticketValue = ticketValue + tx.inputs[i].value;\n            paid = paid + payout;\n        }\n\n        bigint rest = tx.inputs[0].value + ticketValue - paid - SWEEP_FEE_BASE - tickets * SWEEP_FEE_PER_TICKET;\n        bigint left = remaining - tickets;\n        bool burned = left == 0\n            && tx.outputs[0].lockingBytecode == new LockingBytecodeP2PKH(unsafe_bytes20(master.slice(22, 42)))\n            && tx.outputs[0].tokenCategory == 0x;\n        bool kept = left > 0\n            && tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode\n            && tx.outputs[0].tokenCategory == category + 0x01\n            && tx.outputs[0].tokenAmount == 0\n            && tx.outputs[0].nftCommitment == master.slice(0, 19) + toPaddedBytes(left, 3) + master.slice(22, 42);\n        require(tx.outputs[0].value == rest, \"the master keeps exactly what is left\");\n        require(burned || kept, \"the master carries on, or goes back to its creator after the last ticket\");\n    }\n}\n",
  "debug": {
    "bytecode": "00cf00ce5279517e8876517f75518876567f75557f778176529c63516776539c6869c2529dc5009d00cb05ffffffff009d78557f75517f775279577f75567f778153795d7f75577f7781547901137f755d7f7781557901167f7501137f7781c38c6ea2697600a063516778009c6869c4c39d5a7a00527901209580880000516576c39f6376cf78ce5d798878c75e798878cb05ffffffff009d76517f75538876557f75517f775a7988765c7f75577f7781005c79539c637877675279577f75567f77815b799c63785a7995597996776868765479c69302fa00945479cd0376a914557901207f755c7f777e0288ac7e885479cc789d5479d1008856795579c693577a75567a567a567a567a567a567a55797893567a757171557a54798b557a75547a547a547a547a6d6d006751686600c6537a937b9402e80394527902fa0095945379537a9476009c6300cd0376a9145b79012a7f7501167f777e0288ac7e876700686300d100876700687800a06300cd00c7876700686300d15c79517e876700686300d3009c6700686300d25b7901137f75537953807e5c79012a7f7501167f777e8767006800cc547a9d7c6351677668696d6d6d6d6d6d51",
    "sourceMap": "115:33:115:34;:23::49:1;116:26:116:27:0;:16::42:1;:46::54:0;;:57::61;:46:::1;:8::97;117:16:117:22:0;:32::33;:16::34:1;;9:29:9:33:0;117:8:117:77:1;118:30:118:36:0;:46::47;:30::48:1;;:43::44:0;:30::48:1;;:23::49;119:16:119:21:0;16:32:16:33;119:16:119:38:1;:::61:0;;::::1;:42::47:0;17:29:17:30;119:42:119:61:1;:16;:8::92;120:16:120:26:0;72:29:72:30;120:8:120:82:1;121:16:121:27:0;:31::32;:8::63:1;122:26:122:27:0;:16::43:1;69:33:69::0;122:8:122:81:1;124:24:124:30:0;:40::41;:24::42:1;;:37::38:0;:24::42:1;;125:31:125:37:0;;:47::48;:31::49:1;;:44::45:0;:31::49:1;;:24::50;126:28:126:34:0;;:44::46;:28::47:1;;:41::42:0;:28::47:1;;:21::48;127:36:127:42:0;;:53::55;:36::56:1;;:49::51:0;:36::56:1;;:29::57;128:34:128:40:0;;:51::53;:34::54:1;;:47::49:0;:34::54:1;;:27::55;129:25:129:41:0;:::45:1;130:16:130:36:0;::::1;:8::78;131:16:131:23:0;:26::27;:16:::1;:::45:0;;::::1;:31::40:0;:44::45;:31:::1;:16;:8::84;132:16:132:33:0;:37::53;:8::97:1;133:16:133:23:0;;:41::42;:44::51;;63:39:63:41;133:44:133:74:1;:27::75;:8::108;135:29:135:30:0;136:22:136:23;137:24:137:25;:8:160:9;:27:137:28;:31::47;:27:::1;:8:160:9:0;138:37:138:38;:27::53:1;139:30:139:31:0;:20::46:1;:50::58:0;;:12::103:1;140:30:140:31:0;:20::48:1;:52::73:0;;:12::116:1;141:30:141:31:0;:20::47:1;69:33:69:43:0;141:12:141:85:1;142:20:142:26:0;:36::37;:20::38:1;;11:29:11:33:0;142:12:142:81:1;143:20:143:26:0;:36::37;:20::38:1;;:33::34:0;:20::38:1;;:42::49:0;;:12::86:1;144:34:144:40:0;:50::52;:34::53:1;;:47::48:0;:34::53:1;;:27::54;145::145:28:0;146:16:146:21;;17:29:17:30;146:16:146:35:1;:37:148:13:0;147:24:147:29;:16::30:1;148:19:150:13:0;:30:148:36;;:46::47;:30::48:1;;:43::44:0;:30::48:1;;:23::49;:53::59:0;;:23:::1;:61:150:13:0;149:24:149:29;:32::35;;:24:::1;:38::49:0;;:24:::1;:16::50;148:61:150:13;:19;151:28:151:33:0;:46::47;;:36::54:1;:28;61:39:61:42:0;151:28:151:77:1;153:27:153:28:0;;:16::45:1;:49::111:0;:89::95;;:106::108;:89::109:1;;:102::104:0;:89::109:1;;:49::111;;;152:12:155:14;156:31:156:32:0;;:20::39:1;:43::49:0;:12::68:1;157:31:157:32:0;;:20::47:1;:51::53:0;:12::83:1;158:26:158:37:0;;:50::51;;:40::58:1;:26;:12::59;;;;;;;;;;;;;;;159:19:159:23:0;;:26::32;:19:::1;:12::33;;;;;;;137:49:137:50:0;;:::52:1;;;;;;;;;;;;:54:160:9;;:8;;;;;162:32:162:33:0;:22::40:1;:43::54:0;;:22:::1;:57::61:0;:22:::1;60:33:60:37:0;162:22:162:78:1;:81::88:0;;61:39:61:42;162:81:162:111:1;:22;163::163:31:0;;:34::41;;:22:::1;164::164:26:0;:30::31;:22:::1;::165:110:0;165:26::27;:15::44:1;:48::110:0;:88::94;;:105::107;:88::108:1;;:101::103:0;:88::108:1;;:48::110;;;:15;164:22;;;::166:48:0;166:26::27;:15::42:1;:46::48:0;:15:::1;164:22;;;167:20:167:24:0;:27::28;:20:::1;::168:76:0;168:26::27;:15::44:1;:58::59:0;:48::76:1;:15;167:20;;;::169:61:0;169:26::27;:15::42:1;:46::54:0;;:57::61;:46:::1;:15;167:20;;;::170:45:0;170:26::27;:15::40:1;:44::45:0;:15:::1;167:20;;;::171:113:0;171:26::27;:15::42:1;:46::52:0;;:62::64;:46::65:1;;:82::86:0;;:88::89;:68::90:1;:46;:93::99:0;;:110::112;:93::113:1;;:106::108:0;:93::113:1;;:46;:15;167:20;;;172:27:172:28:0;:16::35:1;:39::43:0;;:8::86:1;173:16:173:22:0;:::30;;::::1;:26:::0;:16:::1;:8::108;114:4:174:5;;;;;;",
    "logs": [],
    "requires": [
      {
        "ip": 10,
        "line": 116,
        "message": "input 0 must be a round master"
      },
      {
        "ip": 16,
        "line": 117,
        "message": "not a master commitment"
      },
      {
        "ip": 35,
        "line": 119,
        "message": "the round has not settled"
      },
      {
        "ip": 38,
        "line": 120,
        "message": "lifecycle transactions are version 2"
      },
      {
        "ip": 41,
        "line": 121,
        "message": "sweep carries no locktime"
      },
      {
        "ip": 45,
        "line": 122,
        "message": "fixed sequence"
      },
      {
        "ip": 93,
        "line": 130,
        "message": "more tickets than the round has left"
      },
      {
        "ip": 104,
        "line": 131,
        "message": "a sweep takes at least one ticket"
      },
      {
        "ip": 107,
        "line": 132,
        "message": "one payout per ticket, plus the master"
      },
      {
        "ip": 116,
        "line": 133,
        "message": "padding is fixed per ticket"
      },
      {
        "ip": 131,
        "line": 139,
        "message": "input must be a ticket of this category"
      },
      {
        "ip": 136,
        "line": 140,
        "message": "input must sit at the ticket contract"
      },
      {
        "ip": 140,
        "line": 141,
        "message": "fixed sequence"
      },
      {
        "ip": 146,
        "line": 142,
        "message": "not a ticket commitment"
      },
      {
        "ip": 156,
        "line": 143,
        "message": "ticket belongs to another round"
      },
      {
        "ip": 219,
        "line": 152,
        "message": "output pays the ticket's owner"
      },
      {
        "ip": 224,
        "line": 156,
        "message": "payout amount"
      },
      {
        "ip": 229,
        "line": 157,
        "message": "payout carries no tokens"
      },
      {
        "ip": 393,
        "line": 172,
        "message": "the master keeps exactly what is left"
      },
      {
        "ip": 400,
        "line": 173,
        "message": "the master carries on, or goes back to its creator after the last ticket"
      }
    ]
  },
  "fingerprint": "8bdfa25bb40ab2a2c89a291e86e9e5a1ada9503ce51839bfa95628198953e504",
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
  "updatedAt": "2026-11-18T11:07:39.275Z",
  "invocationAnalysis": {
    "version": 1,
    "protocolVersions": [
      1
    ],
    "functions": [
      {
        "id": 3,
        "name": "sweep",
        "arity": 1,
        "entryPoint": true,
        "selector": "8fa248cd",
        "calls": [],
        "closure": [
          3
        ],
        "component": 0,
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
          3
        ],
        "recursive": false
      }
    ]
  }
} as const;
