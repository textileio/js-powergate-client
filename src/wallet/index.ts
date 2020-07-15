import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/wallet/rpc/rpc_pb_service"
import { Config, walletTypes } from "../types"
import { promise } from "../util"

/**
 * Creates the Wallet API client
 * @param config A config object that changes the behavior of the client
 * @returns The Wallet API client
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createWallet = (config: Config) => {
  const client = new RPCServiceClient(config.host, config)
  return {
    /**
     * Create a new wallet address
     * @param type The type of address to create, bls or secp256k1
     * @returns The new address
     */
    newAddress: (type: "bls" | "secp256k1" = "bls") => {
      const req = new walletTypes.NewAddressRequest()
      req.setType(type)
      return promise(
        (cb) => client.newAddress(req, cb),
        (resp: walletTypes.NewAddressResponse) => resp.toObject().address,
      )
    },

    /**
     * List all wallet addresses
     * @returns The list of wallet addresses
     */
    list: () =>
      promise(
        (cb) => client.list(new walletTypes.ListRequest(), cb),
        (resp: walletTypes.ListResponse) => resp.toObject().addressesList,
      ),

    /**
     * Get the balance for a wallet address
     * @param address The address to get the balance for
     * @returns The address balance
     */
    balance: (address: string) => {
      const req = new walletTypes.BalanceRequest()
      req.setAddress(address)
      return promise(
        (cb) => client.balance(req, cb),
        (resp: walletTypes.BalanceResponse) => resp.toObject().balance,
      )
    },

    /**
     * Send Fil from one address to another
     * @param from The address to send from
     * @param to The address to send to
     * @param amount The amount of Fil to send
     */
    sendFil: (from: string, to: string, amount: number) => {
      const req = new walletTypes.SendFilRequest()
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
