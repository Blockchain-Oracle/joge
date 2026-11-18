import { binToHex, cashAddressToLockingBytecode } from "@bitauth/libauth";
import { buildVaultWithdraw, utxosAt } from "@joge/contracts";
import { agentById } from "@joge/db";
import { placeholderP2PKHUnlocker } from "cashscript";
import { toWire } from "@/lib/wire";
import { vaultOf } from "@/server/agents";
import { serverContracts, serverFulcrum } from "@/server/chain";
import { database, networkOf } from "@/server/db";

const NOT_FOUND = 404;
const BAD_REQUEST = 400;
/** Vault coins one withdrawal takes (each funding adds one; the rest wait for the next withdrawal). */
const MAX_VAULT_COINS = 20;

interface Body {
  /** A coin from the owner's payout address: its SIGHASH_ALL signature is the owner's authority (AgentVault.withdraw). */
  coin: { txid: string; vout: number; satoshis: string; address: string };
}

/**
 * Builds the owner's withdrawal of everything in an agent's vault (the AgentVault covenant is SolidCash, so it is built
 * here; nothing is signed here). Input 0 is the vault's largest coin, input 1 the owner's coin, which their wallet
 * signs, then the vault's other coins; everything goes back to the owner's address. The covenant itself checks the owner signed, so no sign-in is needed.
 */
export async function POST(request: Request, { params }: RouteContext<"/api/agents/[id]/withdraw">) {
  const network = networkOf(request);
  const agent = await agentById(database.db, network, Number((await params).id));
  if (!agent) return Response.json({ error: "No such agent." }, { status: NOT_FOUND });
  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body?.coin) return Response.json({ error: "Send a coin from the owner's address." }, { status: BAD_REQUEST });
  const owned = cashAddressToLockingBytecode(body.coin.address);
  if (typeof owned === "string" || binToHex(owned.bytecode) !== `76a914${agent.ownerPkh}88ac`) {
    return Response.json({ error: "That coin is not at the agent owner's address." }, { status: BAD_REQUEST });
  }
  const { vault } = await vaultOf(network, agent);
  const coins = (await utxosAt(await serverFulcrum(network), agent.vaultLockingBytecode)).filter((coin) => !coin.token);
  const [vaultUtxo, ...moreVaultUtxos] = coins.sort((a, b) => (b.satoshis > a.satoshis ? 1 : -1));
  if (!vaultUtxo) return Response.json({ error: "The vault is empty." }, { status: BAD_REQUEST });
  try {
    const { round } = await serverContracts(network);
    const builder = buildVaultWithdraw({
      round,
      vault,
      vaultUtxo,
      moreVaultUtxos: moreVaultUtxos.slice(0, MAX_VAULT_COINS - 1),
      ownerCoin: {
        utxo: {
          txid: body.coin.txid,
          vout: body.coin.vout,
          satoshis: BigInt(body.coin.satoshis),
          lockingBytecode: binToHex(owned.bytecode),
        } as never,
        unlocker: placeholderP2PKHUnlocker(body.coin.address),
      },
      to: owned.bytecode,
    });
    const transaction = builder.generateWcTransactionObject({
      broadcast: false,
      userPrompt: `Jōge: take everything back from agent ${agent.name}`,
    });
    return Response.json({
      transaction: toWire(transaction),
      amount: [vaultUtxo, ...moreVaultUtxos.slice(0, MAX_VAULT_COINS - 1)]
        .reduce((sum, coin) => sum + coin.satoshis, BigInt(body.coin.satoshis))
        .toString(),
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: BAD_REQUEST });
  }
}
