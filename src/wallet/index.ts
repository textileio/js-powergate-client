import { grpc } from "@improbable-eng/grpc-web"
import {
  AddressesRequest,
  AddressesResponse,
  BalanceRequest,
  BalanceResponse,
  NewAddressRequest,
  NewAddressResponse,
  SendFilRequest,
  SendFilResponse,
  SignMessageRequest,
  SignMessageResponse,
  VerifyMessageRequest,
  VerifyMessageResponse,
} from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb"
import { UserServiceClient } from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb_service"
import { Config } from "../types"
import { promise } from "../util"

export interface Wallet {
  /**
   * Get the balance for a wallet address.
   * @param address The address to get the balance for.
   * @returns The address balance.
   */
  balance: (address: string) => Promise<BalanceResponse.AsObject>

  /**
   * Create a new wallet address associates with the current user.
   * @param name A human readable name for the address.
   * @param type Address type, defaults to bls.
   * @param makeDefault Specify if the new address should become the default address for this user, defaults to false.
   * @returns Information about the newly created address.
   */
  newAddress: (
    name: string,
    type?: "bls" | "secp256k1" | undefined,
    makeDefault?: boolean | undefined,
  ) => Promise<NewAddressResponse.AsObject>

  /**
   * Get all wallet addresses associated with the current user.
   * @returns A list of wallet addresses.
   */
  addresses: () => Promise<AddressesResponse.AsObject>

  /**
   * Send FIL from an address associated with the current user to any other address.
   * @param from The address to send FIL from.
   * @param to The address to send FIL to.
   * @param amount The amount of FIL to send.
   */
  sendFil: (from: string, to: string, amount: bigint) => Promise<SendFilResponse.AsObject>

  /**
   * Sign a message with the specified address.
   * @param address The address used to sign the message.
   * @param message The message to sign.
   * @returns The signature.
   */
  signMessage: (address: string, message: Uint8Array) => Promise<SignMessageResponse.AsObject>

  /**
   * Verify a signed message.
   * @param address The address that should have signed the message.
   * @param message The message to verify.
   * @param signatre The signature to verify.
   * @returns Whether or not the signature is valid for the provided address and message.
   */
  verifyMessage: (
    address: string,
    message: Uint8Array,
    signature: Uint8Array | string,
  ) => Promise<VerifyMessageResponse.AsObject>
}

/**
 * @ignore
 */
export const createWallet = (config: Config, getMeta: () => grpc.Metadata): Wallet => {
  const client = new UserServiceClient(config.host, config)
  return {
    balance: (address: string) => {
      const req = new BalanceRequest()
      req.setAddress(address)
      return promise(
        (cb) => client.balance(req, getMeta(), cb),
        (res: BalanceResponse) => res.toObject(),
      )
    },

    newAddress: (name: string, type?: "bls" | "secp256k1", makeDefault?: boolean) => {
      const req = new NewAddressRequest()
      req.setName(name)
      req.setAddressType(type || "bls")
      req.setMakeDefault(makeDefault || false)
      return promise(
        (cb) => client.newAddress(req, getMeta(), cb),
        (res: NewAddressResponse) => res.toObject(),
      )
    },

    addresses: () =>
      promise(
        (cb) => client.addresses(new AddressesRequest(), getMeta(), cb),
        (res: AddressesResponse) => res.toObject(),
      ),

    sendFil: (from: string, to: string, amount: bigint) => {
      const req = new SendFilRequest()
      req.setFrom(from)
      req.setTo(to)
      req.setAmount(amount.toString())
      return promise(
        (cb) => client.sendFil(req, getMeta(), cb),
        (res: SendFilResponse) => res.toObject(),
      )
    },

    signMessage: (address: string, message: Uint8Array) => {
      const req = new SignMessageRequest()
      req.setAddress(address)
      req.setMessage(message)
      return promise(
        (cb) => client.signMessage(req, getMeta(), cb),
        (res: SignMessageResponse) => res.toObject(),
      )
    },

    verifyMessage: (address: string, message: Uint8Array, signature: Uint8Array | string) => {
      const req = new VerifyMessageRequest()
      req.setAddress(address)
      req.setMessage(message)
      req.setSignature(signature)
      return promise(
        (cb) => client.verifyMessage(req, getMeta(), cb),
        (res: VerifyMessageResponse) => res.toObject(),
      )
    },
  }
}
