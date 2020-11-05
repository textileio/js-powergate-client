import { grpc } from "@improbable-eng/grpc-web"
import { Config } from "../types"
import { createProfiles, Profiles } from "./profiles"
import { createStorageJobs, StorageJobs } from "./storage-jobs"
import { createWallet, Wallet } from "./wallet"
export { Profiles, StorageJobs, Wallet }

export interface Admin {
  /**
   * The admin Profiles API.
   */
  profiles: Profiles

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
    profiles: createProfiles(config, getMeta),
    wallet: createWallet(config, getMeta),
    storageJobs: createStorageJobs(config, getMeta),
  }
}
