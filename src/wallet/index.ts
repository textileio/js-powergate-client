import {
  BalanceRequest,
  BalanceResponse,
  ListRequest,
  ListResponse,
  NewAddressRequest,
  NewAddressResponse,
  SendFilRequest,
} from "@textile/grpc-powergate-client/dist/wallet/rpc/rpc_pb"
import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/wallet/rpc/rpc_pb_service"
import { Config } from "../types"
import { promise } from "../util"

export interface Wallet {
  /**
   * Create a new wallet address.
   * @param type The type of address to create, bls or secp256k1.
   * @returns The new address.
   */
  newAddress: (type?: "bls" | "secp256k1") => Promise<NewAddressResponse.AsObject>

  /**
   * List all wallet addresses.
   * @returns The list of wallet addresses.
   */
  list: () => Promise<ListResponse.AsObject>

  /**
   * Get the balance for a wallet address.
   * @param address The address to get the balance for.
   * @returns The address balance.
   */
  balance: (address: string) => Promise<BalanceResponse.AsObject>

  /**
   * Send Fil from one address to another.
   * @param from The address to send from.
   * @param to The address to send to.
   * @param amount The amount of Fil to send.
   */
  sendFil: (from: string, to: string, amount: number) => Promise<void>
}

/**
 * @ignore
 */
export const createWallet = (config: Config): Wallet => {
  const client = new RPCServiceClient(config.host, config)
  return {
    newAddress: (type: "bls" | "secp256k1" = "bls") => {
      const req = new NewAddressRequest()
      req.setType(type)
      return promise(
        (cb) => client.newAddress(req, cb),
        (resp: NewAddressResponse) => resp.toObject(),
      )
    },

    list: () =>
      promise(
        (cb) => client.list(new ListRequest(), cb),
        (resp: ListResponse) => resp.toObject(),
      ),

    balance: (address: string) => {
      const req = new BalanceRequest()
      req.setAddress(address)
      return promise(
        (cb) => client.balance(req, cb),
        (resp: BalanceResponse) => resp.toObject(),
      )
    },

    sendFil: (from: string, to: string, amount: number) => {
      const req = new SendFilRequest()
      req.setFrom(from)
      req.setTo(to)
      req.setAmount(amount)
      return promise(
        (cb) => client.sendFil(req, cb),
        () => {
          // nothing to return
        },
      )
    },
  }
}
