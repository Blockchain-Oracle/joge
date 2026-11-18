export default {
  "contractName": "OracleProbe",
  "constructorInputs": [
    {
      "name": "oracle",
      "type": "pubkey"
    }
  ],
  "abi": [
    {
      "name": "boundary",
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
          "name": "boundaryTime",
          "type": "int"
        },
        {
          "name": "expectedSequence",
          "type": "int"
        }
      ]
    },
    {
      "name": "strike",
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
          "name": "sequence",
          "type": "int"
        },
        {
          "name": "expectedPrice",
          "type": "int"
        }
      ]
    }
  ],
  "bytecode": "5c7f75587f7781 OP_0 OP_DEFINE 52798277609d78827701409d7c52797bbb76008a00a069607f755c7f778100a069 OP_1 OP_DEFINE OP_OVER OP_0 OP_NUMEQUAL OP_IF OP_2SWAP OP_SWAP OP_2ROT OP_SWAP OP_4 OP_ROLL OP_6 OP_ROLL OP_5 OP_PICK OP_5 OP_ROLL OP_3 OP_PICK OP_1 OP_INVOKE OP_3 OP_PICK OP_2SWAP OP_1 OP_INVOKE OP_OVER OP_0 OP_INVOKE OP_3 OP_PICK OP_0 OP_INVOKE OP_1ADD OP_NUMEQUALVERIFY OP_ROT OP_4 OP_SPLIT OP_DROP OP_BIN2NUM OP_OVER OP_LESSTHAN OP_VERIFY OP_OVER OP_4 OP_SPLIT OP_DROP OP_BIN2NUM OP_LESSTHANOREQUAL OP_VERIFY OP_0 OP_INVOKE OP_ROT OP_NUMEQUAL OP_NIP OP_ELSE OP_SWAP OP_1 OP_NUMEQUALVERIFY OP_SWAP OP_ROT OP_2SWAP OP_SWAP OP_3 OP_PICK OP_2SWAP OP_1 OP_INVOKE OP_OVER OP_0 OP_INVOKE OP_NUMEQUALVERIFY OP_16 OP_SPLIT OP_DROP OP_12 OP_SPLIT OP_NIP OP_BIN2NUM OP_NUMEQUAL OP_ENDIF",
  "source": "pragma cashscript ^0.14.0;\n\nimport \"./oracle.cash\";\n\n// Proof P1 only: exposes the oracle module so it can be run against real General Protocols boundaries.\ncontract OracleProbe(pubkey oracle) {\n    function boundary(\n        bytes previous,\n        datasig previousSignature,\n        bytes first,\n        datasig firstSignature,\n        int boundaryTime,\n        int expectedSequence\n    ) {\n        int sequence = firstAtOrAfter(previous, previousSignature, first, firstSignature, oracle, boundaryTime);\n        require(sequence == expectedSequence);\n    }\n\n    function strike(bytes message, datasig signature, int sequence, int expectedPrice) {\n        require(priceAtSequence(message, signature, oracle, sequence) == expectedPrice);\n    }\n}\n",
  "fingerprint": "54144842a5284bc032a9987ccbae88a4f120f3e02d9b4de919fdc6228d88dd9b",
  "debug": {
    "bytecode": "075c7f75587f778100892152798277609d78827701409d7c52797bbb76008a00a069607f755c7f778100a069518978009c63727c717c547a567a5579557a5379518a537972518a78008a5379008a8b9d7b547f7581789f6978547f7581a169008a7b9c77677c519d7c7b727c537972518a78008a9d607f755c7f77819c68",
    "sourceMap": "15::17:1;;::::1;24::30::0;;::::1;7:4:17:5:0;;;;15:38:15:65;;:67::88;;:90::96;;:98::110;;:23::111:1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;16:28:16:44:0;:8::46:1;14:6:17:5;7:4;19::21::0;;;20:32:20:39;:41::50;:52::68;;:16::69:1;;;;;;;;;;;;;;;;:8::88;6:0:22:1",
    "logs": [],
    "requires": [
      {
        "ip": 40,
        "line": 15,
        "message": "oracle messages must be consecutive"
      },
      {
        "ip": 48,
        "line": 15,
        "message": "previous message must be before the boundary"
      },
      {
        "ip": 55,
        "line": 15,
        "message": "first message must be at or after the boundary"
      },
      {
        "ip": 60,
        "line": 16
      },
      {
        "ip": 77,
        "line": 20,
        "message": "strike must be the message after the lock message"
      },
      {
        "ip": 86,
        "line": 20
      }
    ],
    "sourceTags": "59:59:sc",
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
        "bytecode": "537972518a78008a9d607f755c7f7781",
        "sourceMap": "52:23:52:30;;:32::49;:4::50:1;;53:25:53:32:0;:12::33:1;;:4::100;54:11:54:32;;;;;;",
        "sourceFile": "oracle.cash",
        "logs": [],
        "requires": [
          {
            "ip": 8,
            "line": 53,
            "message": "strike must be the message after the lock message"
          }
        ],
        "inlineRanges": "9:15:messagePrice"
      }
    ],
    "sources": {
      "oracle.cash": "pragma cashscript ^0.14.0;\n\n// General Protocols price messages, as verified by AnyHedge v0.12 (contract.cash l.73-94).\n// A message is 16 bytes of little-endian script numbers:\n//   [0,4) message timestamp · [4,8) message sequence · [8,12) data sequence · [12,16) price.\n// A data sequence <= 0 marks a metadata message, which is never a price.\n\nint constant MESSAGE_BYTES = 16;\nint constant DATASIG_BYTES = 64;\n\nfunction messageTimestamp(bytes message) returns (int) {\n    return int(message.slice(0, 4));\n}\n\nfunction dataSequence(bytes message) returns (int) {\n    return int(message.slice(8, 12));\n}\n\nfunction messagePrice(bytes message) returns (int) {\n    return int(message.slice(12, 16));\n}\n\n// Proves `message` is a signed price message from `oracle`. Fixed lengths keep every proof byte-identical.\nfunction requireSignedPrice(bytes message, datasig signature, pubkey oracle) {\n    require(message.length == MESSAGE_BYTES, \"oracle message must be 16 bytes\");\n    require(bytes(signature).length == DATASIG_BYTES, \"oracle signature must be 64 bytes\");\n    require(checkDataSig(signature, message, oracle), \"oracle signature does not verify\");\n    require(dataSequence(message) > 0, \"metadata message is not a price\");\n    require(messagePrice(message) > 0, \"oracle price must be positive\");\n}\n\n// Proves `first` is the oracle's first price message at or after `boundary`: the previous message (consecutive data\n// sequence) is strictly before the boundary. Returns the first message's data sequence.\nfunction firstAtOrAfter(\n    bytes previous,\n    datasig previousSignature,\n    bytes first,\n    datasig firstSignature,\n    pubkey oracle,\n    int boundary\n) returns (int) {\n    requireSignedPrice(previous, previousSignature, oracle);\n    requireSignedPrice(first, firstSignature, oracle);\n    require(dataSequence(first) == dataSequence(previous) + 1, \"oracle messages must be consecutive\");\n    require(messageTimestamp(previous) < boundary, \"previous message must be before the boundary\");\n    require(messageTimestamp(first) >= boundary, \"first message must be at or after the boundary\");\n    return dataSequence(first);\n}\n\n// Proves `message` is the oracle's price with data sequence `sequence` and returns its price.\nfunction priceAtSequence(bytes message, datasig signature, pubkey oracle, int sequence) returns (int) {\n    requireSignedPrice(message, signature, oracle);\n    require(dataSequence(message) == sequence, \"strike must be the message after the lock message\");\n    return messagePrice(message);\n}\n"
    },
    "inlineRanges": "19:57:firstAtOrAfter;69:84:priceAtSequence"
  },
  "compiler": {
    "name": "cashc",
    "version": "0.14.0",
    "options": {
      "enforceFunctionParameterTypes": true,
      "enforceLocktimeGuard": false
    }
  },
  "updatedAt": "2026-11-18T19:51:45.407Z"
} as const;
