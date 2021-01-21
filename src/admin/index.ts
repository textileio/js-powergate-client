import { grpc } from "@improbable-eng/grpc-web"
import { Config } from "../types"
import { createData, Data } from "./data"
import { createStorageInfo, StorageInfo } from "./storage-info"
import { createStorageJobs, StorageJobs } from "./storage-jobs"
import { createUsers, Users } from "./users"
import { createWallet, Wallet } from "./wallet"
export { Users, StorageJobs, Wallet, StorageInfo }

export interface Admin {
  /**
   * The admin Data API.
   */
  data: Data

  /**
   * The admin Users API.
   */
  users: Users

  /**
   * The admin Wallet API.
   */
  wallet: Wallet

  /**
   * The admin StorageInfo API.
   */
  storageInfo: StorageInfo

  /**
   * The admin Storage Jobs API.
   */
  storageJobs: StorageJobs
}

/**
 * @ignore
 */
export const createAdmin = (config: Config, getMeta: () => grpc.Metadata): Admin => {
  return {
    data: createData(config, getMeta),
    users: createUsers(config, getMeta),
    wallet: createWallet(config, getMeta),
    storageInfo: createStorageInfo(config, getMeta),
    storageJobs: createStorageJobs(config, getMeta),
  }
}
