import { grpc } from "@improbable-eng/grpc-web"
import { Config } from "../types"
import { createStorageJobs, StorageJobs } from "./storage-jobs"
import { createUsers, Users } from "./users"
import { createWallet, Wallet } from "./wallet"
export { Users, StorageJobs, Wallet }

export interface Admin {
  /**
   * The admin Users API.
   */
  users: Users

  /**
   * The admin Wallet API.
   */
  wallet: Wallet

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
    users: createUsers(config, getMeta),
    wallet: createWallet(config, getMeta),
    storageJobs: createStorageJobs(config, getMeta),
  }
}
