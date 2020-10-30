import {
  BuildInfoRequest,
  BuildInfoResponse,
  StorageProfileIdentifierRequest,
  StorageProfileIdentifierResponse,
} from "@textile/grpc-powergate-client/dist/proto/powergate/v1/powergate_pb"
import { PowergateServiceClient } from "@textile/grpc-powergate-client/dist/proto/powergate/v1/powergate_pb_service"
import { Admin, createAdmin } from "./admin"
import { createData, Data, GetFolderOptions, WatchLogsOptions } from "./data"
import { createDeals, DealRecordsOptions, Deals } from "./deals"
import { ApplyOptions, createStorageConfig, StorageConfig } from "./storage-config"
import { createStorageJobs, StorageJobs } from "./storage-jobs"
import { Config } from "./types"
import { getTransport, host, promise, useTokens } from "./util"
import { createWallet, Wallet } from "./wallet"

export * as adminTypes from "@textile/grpc-powergate-client/dist/proto/admin/v1/powergate_admin_pb"
export * as powTypes from "@textile/grpc-powergate-client/dist/proto/powergate/v1/powergate_pb"
export { GetFolderOptions, ApplyOptions, WatchLogsOptions, DealRecordsOptions }
export { Config }
export { Admin, Data, Deals, StorageConfig, StorageJobs, Wallet }

const defaultConfig: Config = {
  host,
  transport: getTransport(),
}

export interface Pow {
  /**
   * Set the active storage profile auth token
   * @param t The token to set
   */
  setToken: (t: string) => void

  /**
   * Set the active admin auth token
   * @param t The token to set
   */
  setAdminToken: (t: string) => void

  /**
   * Returns build information about the server
   * @returns An object containing build information about the server
   */
  buildInfo: () => Promise<BuildInfoResponse.AsObject>

  /**
   * Get the storage profile ID.
   * @returns A Promise containing the storage profile ID.
   */
  storageProfileId: () => Promise<StorageProfileIdentifierResponse.AsObject>

  /**
   * The host address the client is using
   */
  host: string

  /**
   * The StorageConfig API
   */
  storageConfig: StorageConfig

  /**
   * The Data API
   */
  data: Data

  /**
   * The Wallet API
   */
  wallet: Wallet

  /**
   * The Deals API
   */
  deals: Deals

  /**
   * The StorageJobs API
   */
  storageJobs: StorageJobs

  /**
   * The Admin API
   */
  admin: Admin
}

/**
 * Creates a new Powergate client
 * @param config A config object that changes the behavior of the client
 * @returns A Powergate client API
 */
export const createPow = (config?: Partial<Config>): Pow => {
  const c: Config = { ...defaultConfig, ...removeEmpty(config) }

  const { getMeta, getHeaders, setToken, setAdminToken } = useTokens(c.authToken, c.adminToken)

  const client = new PowergateServiceClient(c.host, c)

  return {
    host: c.host,

    setToken,

    setAdminToken,

    buildInfo: () =>
      promise(
        (cb) => client.buildInfo(new BuildInfoRequest(), cb),
        (resp: BuildInfoResponse) => resp.toObject(),
      ),

    storageProfileId: () =>
      promise(
        (cb) =>
          client.storageProfileIdentifier(new StorageProfileIdentifierRequest(), getMeta(), cb),
        (res: StorageProfileIdentifierResponse) => res.toObject(),
      ),

    storageConfig: createStorageConfig(c, getMeta),

    data: createData(c, getMeta, getHeaders),

    wallet: createWallet(c, getMeta),

    deals: createDeals(c, getMeta),

    storageJobs: createStorageJobs(c, getMeta),

    admin: createAdmin(c, getMeta),
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
