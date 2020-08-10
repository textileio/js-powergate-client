import {
  BuildInfoRequest,
  BuildInfoResponse,
} from "@textile/grpc-powergate-client/dist/buildinfo/rpc/rpc_pb"
import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/buildinfo/rpc/rpc_pb_service"
import { Asks, createAsks } from "./asks"
import { createFaults, Faults } from "./faults"
import {
  createFFS,
  FFS,
  GetFolderOptions,
  ListDealRecordsOptions,
  PushStorageConfigOptions,
  WatchLogsOptions,
} from "./ffs"
import { createHealth, Health } from "./health"
import { createMiners, Miners } from "./miners"
import { createNet, Net } from "./net"
import { createReputation, Reputation } from "./reputation"
import { Config } from "./types"
import { getTransport, host, promise, useToken } from "./util"
import { createWallet, Wallet } from "./wallet"

export * as ffsTypes from "@textile/grpc-powergate-client/dist/ffs/rpc/rpc_pb"
export * as healthTypes from "@textile/grpc-powergate-client/dist/health/rpc/rpc_pb"
export * as asksTypes from "@textile/grpc-powergate-client/dist/index/ask/rpc/rpc_pb"
export * as faultsTypes from "@textile/grpc-powergate-client/dist/index/faults/rpc/rpc_pb"
export * as minersTypes from "@textile/grpc-powergate-client/dist/index/miner/rpc/rpc_pb"
export * as netTypes from "@textile/grpc-powergate-client/dist/net/rpc/rpc_pb"
export * as reputationTypes from "@textile/grpc-powergate-client/dist/reputation/rpc/rpc_pb"
export * as walletTypes from "@textile/grpc-powergate-client/dist/wallet/rpc/rpc_pb"
export { GetFolderOptions, PushStorageConfigOptions, WatchLogsOptions, ListDealRecordsOptions }
export { Config }
export { Asks, Faults, FFS, Health, Miners, Net, Reputation, Wallet }

const defaultConfig: Config = {
  host,
  transport: getTransport(),
}

export interface Pow {
  /**
   * Set the active auth token
   * @param t The token to set
   */
  setToken: (t: string) => void

  /**
   * Returns build information about the server
   * @returns An object containing build information about the server
   */
  buildInfo: () => Promise<BuildInfoResponse.AsObject>

  /**
   * The host address the client is using
   */
  host: string

  /**
   * The Asks API
   */
  asks: Asks

  /**
   * The Faults API
   */
  faults: Faults

  /**
   * The FFS API
   */
  ffs: FFS

  /**
   * The Health API
   */
  health: Health

  /**
   * The Miners API
   */
  miners: Miners

  /**
   * The Net API
   */
  net: Net

  /**
   * The Reputation API
   */
  reputation: Reputation

  /**
   * The Wallet API
   */
  wallet: Wallet
}

/**
 * Creates a new Powergate client
 * @param config A config object that changes the behavior of the client
 * @returns A Powergate client API
 */
export const createPow = (config?: Partial<Config>): Pow => {
  const c = { ...defaultConfig, ...removeEmpty(config) }

  const { getMeta, getHeaders, setToken } = useToken(c.authToken)

  const buildInfoClient = new RPCServiceClient(c.host, c)

  return {
    host: c.host,

    setToken,

    buildInfo: () =>
      promise(
        (cb) => buildInfoClient.buildInfo(new BuildInfoRequest(), cb),
        (resp: BuildInfoResponse) => resp.toObject(),
      ),

    asks: createAsks(c),

    faults: createFaults(c),

    ffs: createFFS(c, getMeta, getHeaders),

    health: createHealth(c),

    miners: createMiners(c),

    net: createNet(c),

    reputation: createReputation(c),

    wallet: createWallet(c),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const removeEmpty = (obj: any) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === "object") removeEmpty(obj[key])
    else if (obj[key] === undefined) delete obj[key]
  })
  return obj
}
