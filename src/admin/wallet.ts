import { grpc } from "@improbable-eng/grpc-web"
import {
  AddressesRequest,
  AddressesResponse,
  NewAddressRequest,
  NewAddressResponse,
  SendFilRequest,
  SendFilResponse,
} from "@textile/grpc-powergate-client/dist/proto/admin/v1/powergate_admin_pb"
import { PowergateAdminServiceClient } from "@textile/grpc-powergate-client/dist/proto/admin/v1/powergate_admin_pb_service"
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
  addresses: () => Promise<AddressesResponse.AsObject>

  /**
   * Send Fil from one address to another.
   * @param from The address to send from.
   * @param to The address to send to.
   * @param amount The amount of Fil to send.
   */
  sendFil: (from: string, to: string, amount: number) => Promise<SendFilResponse.AsObject>
}

/**
 * @ignore
 */
export const createWallet = (config: Config, getMeta: () => grpc.Metadata): Wallet => {
  const client = new PowergateAdminServiceClient(config.host, config)
  return {
    newAddress: (type: "bls" | "secp256k1" = "bls") => {
      const req = new NewAddressRequest()
      req.setType(type)
      return promise(
        (cb) => client.newAddress(req, getMeta(), cb),
        (resp: NewAddressResponse) => resp.toObject(),
      )
    },

    addresses: () =>
      promise(
        (cb) => client.addresses(new AddressesRequest(), getMeta(), cb),
        (resp: AddressesResponse) => resp.toObject(),
      ),

    sendFil: (from: string, to: string, amount: number) => {
      const req = new SendFilRequest()
      req.setFrom(from)
      req.setTo(to)
      req.setAmount(amount)
      return promise(
        (cb) => client.sendFil(req, getMeta(), cb),
        (resp: SendFilResponse) => resp.toObject(),
      )
    },
  }
}
