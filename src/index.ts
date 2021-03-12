import {
  BuildInfoRequest,
  BuildInfoResponse,
  UserIdentifierRequest,
  UserIdentifierResponse,
} from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb"
import { UserServiceClient } from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb_service"
import {
  Admin,
  AdminData,
  AdminGetMinersOptions,
  AdminIndices,
  AdminListOptions,
  AdminRecords,
  AdminStorageInfo,
  AdminStorageJobs,
  AdminUsers,
  AdminWallet,
  createAdmin,
} from "./admin"
import { createData, Data, GetFolderOptions, WatchLogsOptions } from "./data"
import { createDeals, DealRecordsOptions, Deals } from "./deals"
import { ApplyOptions, createStorageConfig, StorageConfig } from "./storage-config"
import { createStorageInfo, StorageInfo } from "./storage-info"
import { createStorageJobs, ListOptions, ListSelect, StorageJobs } from "./storage-jobs"
import { Config } from "./types"
import { getTransport, host, promise, useTokens } from "./util"
import { createWallet, Wallet } from "./wallet"

export * as adminTypes from "@textile/grpc-powergate-client/dist/powergate/admin/v1/admin_pb"
export * as powTypes from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb"
export {
  Admin,
  Config,
  Data,
  Deals,
  StorageConfig,
  StorageJobs,
  Wallet,
  ListOptions,
  ListSelect,
  AdminListOptions,
  AdminGetMinersOptions,
  GetFolderOptions,
  ApplyOptions,
  WatchLogsOptions,
  DealRecordsOptions,
  AdminRecords,
  AdminIndices,
  AdminData,
  AdminStorageInfo,
  AdminStorageJobs,
  AdminUsers,
  AdminWallet,
}

const defaultConfig: Config = {
  host,
  transport: getTransport(),
}

export interface Pow {
  /**
   * Set the active user auth token
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
   * Get the user ID.
   * @returns A Promise containing the user ID.
   */
  userId: () => Promise<UserIdentifierResponse.AsObject>

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
   * The StorageInfo API
   */
  storageInfo: StorageInfo

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

  const client = new UserServiceClient(c.host, c)

  return {
    host: c.host,

    setToken,

    setAdminToken,

    buildInfo: () =>
      promise(
        (cb) => client.buildInfo(new BuildInfoRequest(), cb),
        (resp: BuildInfoResponse) => resp.toObject(),
      ),

    userId: () =>
      promise(
        (cb) => client.userIdentifier(new UserIdentifierRequest(), getMeta(), cb),
        (res: UserIdentifierResponse) => res.toObject(),
      ),

    storageConfig: createStorageConfig(c, getMeta),

    data: createData(c, getMeta, getHeaders),

    wallet: createWallet(c, getMeta),

    deals: createDeals(c, getMeta),

    storageInfo: createStorageInfo(c, getMeta),

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
