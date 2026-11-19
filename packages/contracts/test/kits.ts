// The two contract languages of the language bake-off, each with its own SDK's mock chain, signer and UTXO helper.
// SolidCash's SDK is a fork of CashScript's; its types are cast to CashScript's where the shapes match at runtime.
import {
  Contract as SolidContract,
  SignatureTemplate as SolidSignatureTemplate,
  TransactionBuilder as SolidTransactionBuilder,
  randomUtxo as solidRandomUtxo,
} from "@solidcash/solidcash";
import { MockNetworkProvider as SolidMockNetworkProvider } from "@solidcash/solidcash/network/mock";
import { MockNetworkProvider, randomUtxo, SignatureTemplate } from "cashscript";
import solidGate from "../artifacts/solidcash-bakeoff/Gate.ts";
import solidMasterLocked from "../artifacts/solidcash-bakeoff/MasterLocked.ts";
import solidMasterOpen from "../artifacts/solidcash-bakeoff/MasterOpen.ts";
import solidMasterSweep from "../artifacts/solidcash-bakeoff/MasterSweep.ts";
import solidTicket from "../artifacts/solidcash-bakeoff/Ticket.ts";
import { cashscriptKit, type Kit } from "../src/contracts.ts";

export interface TestKit {
  kit: Kit;
  newProvider: () => MockNetworkProvider;
  SignatureTemplate: typeof SignatureTemplate;
  randomUtxo: typeof randomUtxo;
}

export const CASHSCRIPT: TestKit = {
  kit: cashscriptKit,
  newProvider: () => new MockNetworkProvider(),
  SignatureTemplate,
  randomUtxo,
};

export const SOLIDCASH: TestKit = {
  kit: {
    name: "SolidCash",
    Contract: SolidContract as unknown as Kit["Contract"],
    TransactionBuilder: SolidTransactionBuilder as unknown as Kit["TransactionBuilder"],
    artifacts: {
      gate: solidGate,
      // The bake-off kept only the lane gate; event exits are CashScript-only.
      eventGate: solidGate,
      ticket: solidTicket,
      masterOpen: solidMasterOpen,
      masterLocked: solidMasterLocked,
      masterSweep: solidMasterSweep,
    } as unknown as Kit["artifacts"],
  },
  newProvider: () => new SolidMockNetworkProvider() as unknown as MockNetworkProvider,
  SignatureTemplate: SolidSignatureTemplate as unknown as typeof SignatureTemplate,
  randomUtxo: solidRandomUtxo as unknown as typeof randomUtxo,
};

/**
 * Production runs the player contracts in CashScript. `BAKEOFF=1` also runs every round test over the
 * SolidCash ports kept from the language bake-off.
 */
export const KITS = process.env.BAKEOFF ? [CASHSCRIPT, SOLIDCASH] : [CASHSCRIPT];
