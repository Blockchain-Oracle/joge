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
      "selector": "6ca52aec",
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
          "type": "int256"
        },
        {
          "name": "expectedSequence",
          "type": "int256"
        }
      ],
      "sourceEffectOrder": "linear"
    },
    {
      "name": "strike",
      "selector": "2134ef41",
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
          "type": "int256"
        },
        {
          "name": "expectedPrice",
          "type": "int256"
        }
      ],
      "sourceEffectOrder": "linear"
    }
  ],
  "bytecode": "007a547f75007f7781568a OP_0 OP_DEFINE 007a5c7f75587f7781568a OP_1 OP_DEFINE 007a607f755c7f7781568a OP_2 OP_DEFINE 00798277609c695179827701409c69517a5179537aba690079518a00a069007a528a00a069 OP_3 OP_DEFINE 5479527a5279538a537a537a5379538a5179518a5179518a5193568a9c69007a008a52799f690079008a527aa269007a518a OP_4 OP_DEFINE 527a527a5279538a0079518a527a9c69007a528a OP_5 OP_DEFINE 5579568a755679568a75557a7c7171548a9c 6ca52aec OP_DEFINE 5379568a755479568a75537a7c72558a9c 2134ef41 OP_DEFINE 765102ff008d9301218001207f77010088 OP_6 OP_DEFINE OP_DEPTH OP_1SUB OP_ROLL OP_SIZE OP_4 OP_NUMEQUALVERIFY OP_INVOKE",
  "source": "pragma solidcash ^0.51.0;\n\n\n// General Protocols price messages, as verified by AnyHedge v0.12 (contract.cash l.73-94).\n// A message is 16 bytes of little-endian script numbers:\n//   [0,4) message timestamp · [4,8) message sequence · [8,12) data sequence · [12,16) price.\n// Native mode reads them with little-endian VM numbers; evmCompat would read bytesN big-endian (the S00 trap).\n\nbigint constant MESSAGE_BYTES = 16;\nbigint constant DATASIG_BYTES = 64;\n\nfunction messageTimestamp(bytes message) pure returns (int) {\n    return int(message.slice(0, 4));\n}\n\nfunction dataSequence(bytes message) pure returns (int) {\n    return int(message.slice(8, 12));\n}\n\nfunction messagePrice(bytes message) pure returns (int) {\n    return int(message.slice(12, 16));\n}\n\nfunction requireSignedPrice(bytes message, datasig signature, pubkey oracle) pure {\n    require(message.length == MESSAGE_BYTES, \"oracle message must be 16 bytes\");\n    require(bytes(signature).length == DATASIG_BYTES, \"oracle signature must be 64 bytes\");\n    require(checkDataSig(signature, message, oracle), \"oracle signature does not verify\");\n    require(dataSequence(message) > 0, \"metadata message is not a price\");\n    require(messagePrice(message) > 0, \"oracle price must be positive\");\n}\n\nfunction firstAtOrAfter(\n    bytes previous,\n    datasig previousSignature,\n    bytes first,\n    datasig firstSignature,\n    pubkey oracle,\n    int boundary\n) pure returns (int) {\n    requireSignedPrice(previous, previousSignature, oracle);\n    requireSignedPrice(first, firstSignature, oracle);\n    require(dataSequence(first) == dataSequence(previous) + 1, \"oracle messages must be consecutive\");\n    require(messageTimestamp(previous) < boundary, \"previous message must be before the boundary\");\n    require(messageTimestamp(first) >= boundary, \"first message must be at or after the boundary\");\n    return dataSequence(first);\n}\n\nfunction priceAtSequence(bytes message, datasig signature, pubkey oracle, int sequence) pure returns (int) {\n    requireSignedPrice(message, signature, oracle);\n    require(dataSequence(message) == sequence, \"strike must be the message after the lock message\");\n    return messagePrice(message);\n}\n\n\n// Proof P2 only: the oracle module in SolidCash, run against the same real boundaries as the CashScript probe.\ncontract OracleProbe(pubkey oracle) {\n    function boundary(\n        bytes previous,\n        datasig previousSignature,\n        bytes first,\n        datasig firstSignature,\n        int boundaryTime,\n        int expectedSequence\n    ) {\n        int sequence = firstAtOrAfter(previous, previousSignature, first, firstSignature, oracle, boundaryTime);\n        require(sequence == expectedSequence);\n    }\n\n    function strike(bytes message, datasig signature, int sequence, int expectedPrice) {\n        require(priceAtSequence(message, signature, oracle, sequence) == expectedPrice);\n    }\n}\n",
  "debug": {
    "bytecode": "0b007a547f75007f7781568a00890b007a5c7f75587f7781568a51890b007a607f755c7f7781568a52892500798277609c695179827701409c69517a5179537aba690079518a00a069007a528a00a0695389325479527a5279538a537a537a5379538a5179518a5179518a5193568a9c69007a008a52799f690079008a527aa269007a518a548914527a527a5279538a0079518a527a9c69007a528a5589125579568a755679568a75557a7c7171548a9c046ca52aec89115379568a755479568a75537a7c72558a9c042134ef418911765102ff008d9301218001207f770100885689748c7a82549d8a",
    "sourceMap": "12::14:1;;;16::18;;;20::22;;;24::30;;;32::46;;;48::52;;;57:4:67:5;;;69::71;;;56:0:72:1;;;;;;;;;",
    "logs": [],
    "requires": [],
    "functionDebug": {
      "6ca52aec": {
        "requires": [
          {
            "ip": 18,
            "line": 66
          }
        ],
        "logs": [],
        "sourceMap": "62:8:62:24;;;;;63::63:28;;;;;65:98:65:110;;:90::96;:67::88;:38::65;:23::111:1;;66:8:66:46"
      },
      "2134ef41": {
        "requires": [
          {
            "ip": 17,
            "line": 70
          }
        ],
        "logs": [],
        "sourceMap": "69:54:69:66;;;;;:68::85;;;;;70:60:70:68;;:52::58;:32::50;:16::69:1;;:8::88"
      }
    },
    "invokeDebug": {
      "0": {
        "bytecode": "007a547f75007f7781568a",
        "name": "messageTimestamp",
        "requires": [],
        "logs": [],
        "sourceMap": "13:15:13:22;;:32::33;:15::34:1;;:29::30:0;:15::34:1;;:11::35;;"
      },
      "1": {
        "bytecode": "007a5c7f75587f7781568a",
        "name": "dataSequence",
        "requires": [],
        "logs": [],
        "sourceMap": "17:15:17:22;;:32::34;:15::35:1;;:29::30:0;:15::35:1;;:11::36;;"
      },
      "2": {
        "bytecode": "007a607f755c7f7781568a",
        "name": "messagePrice",
        "requires": [],
        "logs": [],
        "sourceMap": "21:15:21:22;;:33::35;:15::36:1;;:29::31:0;:15::36:1;;:11::37;;"
      },
      "3": {
        "bytecode": "00798277609c695179827701409c69517a5179537aba690079518a00a069007a528a00a069",
        "name": "requireSignedPrice",
        "requires": [
          {
            "ip": 6,
            "line": 25,
            "message": "oracle message must be 16 bytes"
          },
          {
            "ip": 13,
            "line": 26,
            "message": "oracle signature must be 64 bytes"
          },
          {
            "ip": 21,
            "line": 27,
            "message": "oracle signature does not verify"
          },
          {
            "ip": 28,
            "line": 28,
            "message": "metadata message is not a price"
          },
          {
            "ip": 35,
            "line": 29,
            "message": "oracle price must be positive"
          }
        ],
        "logs": [],
        "sourceMap": "25:12:25:19;;:::26:1;;9:32:9:34:0;25:12:25:43:1;:4::80;26:18:26:27:0;;:12::35:1;;10:32:10:34:0;26:12:26:52:1;:4::91;27:25:27:34:0;;:36::43;;:45::51;;:12::52:1;:4::90;28:25:28:32:0;;:12::33:1;;:36::37:0;:12:::1;:4::74;29:25:29:32:0;;:12::33:1;;:36::37:0;:12:::1;:4::72"
      },
      "4": {
        "bytecode": "5479527a5279538a537a537a5379538a5179518a5179518a5193568a9c69007a008a52799f690079008a527aa269007a518a",
        "name": "firstAtOrAfter",
        "requires": [
          {
            "ip": 29,
            "line": 42,
            "message": "oracle messages must be consecutive"
          },
          {
            "ip": 37,
            "line": 43,
            "message": "previous message must be before the boundary"
          },
          {
            "ip": 45,
            "line": 44,
            "message": "first message must be at or after the boundary"
          }
        ],
        "logs": [],
        "sourceMap": "40:52:40:58;;:33::50;;:23::31;;:4::59:1;;41:46:41:52:0;;:30::44;;:23::28;;:4::53:1;;42:25:42:30:0;;:12::31:1;;:48::56:0;;:35::57:1;;:60::61:0;:35:::1;;;:12;:4::102;43:29:43:37:0;;:12::38:1;;:41::49:0;;:12:::1;:4::99;44:29:44:34:0;;:12::35:1;;:39::47:0;;:12:::1;:4::99;45:24:45:29:0;;:11::30:1;"
      },
      "5": {
        "bytecode": "527a527a5279538a0079518a527a9c69007a528a",
        "name": "priceAtSequence",
        "requires": [
          {
            "ip": 15,
            "line": 50,
            "message": "strike must be the message after the lock message"
          }
        ],
        "logs": [],
        "sourceMap": "49:43:49:49;;:32::41;;:23::30;;:4::50:1;;50:25:50:32:0;;:12::33:1;;:37::45:0;;:12:::1;:4::100;51:24:51:31:0;;:11::32:1;"
      },
      "6": {
        "bytecode": "765102ff008d9301218001207f77010088",
        "name": "outlined source span 6",
        "requires": [],
        "logs": [],
        "sourceMap": "13:11:13:35:1;;;;;;;;;;;"
      }
    }
  },
  "functionBodies": {
    "6ca52aec": "5579568a755679568a75557a7c7171548a9c",
    "2134ef41": "5379568a755479568a75537a7c72558a9c"
  },
  "fingerprint": "25774100ed5bfae37fb3febf0cf16bd467eb59e34fa87018032e947e4d7a8de6",
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
  "updatedAt": "2026-11-18T11:07:39.337Z",
  "invocationAnalysis": {
    "version": 1,
    "protocolVersions": [
      1
    ],
    "functions": [
      {
        "id": 6,
        "name": "boundary",
        "arity": 6,
        "entryPoint": true,
        "selector": "6ca52aec",
        "calls": [],
        "closure": [
          6
        ],
        "component": 0,
        "recursive": false,
        "reads": [],
        "writes": [],
        "effects": [],
        "unknown": false,
        "bounded": true,
        "maximumDirectInvocations": 0
      },
      {
        "id": 7,
        "name": "strike",
        "arity": 4,
        "entryPoint": true,
        "selector": "2134ef41",
        "calls": [],
        "closure": [
          7
        ],
        "component": 1,
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
          6
        ],
        "recursive": false
      },
      {
        "id": 1,
        "functions": [
          7
        ],
        "recursive": false
      }
    ]
  }
} as const;
