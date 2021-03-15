import { grpc } from "@improbable-eng/grpc-web"
import { Config } from "../types"
import { AdminData, createData } from "./data"
import { AdminGetMinersOptions, AdminIndices, createIndices } from "./indices"
import { AdminRecords, createRecords } from "./records"
import { AdminStorageInfo, createStorageInfo } from "./storage-info"
import { AdminListOptions, AdminStorageJobs, createStorageJobs } from "./storage-jobs"
import { AdminUsers, createUsers } from "./users"
import { AdminWallet, createWallet } from "./wallet"
export {
  AdminUsers,
  AdminStorageJobs,
  AdminWallet,
  AdminStorageInfo,
  AdminGetMinersOptions,
  AdminListOptions,
  AdminData,
  AdminIndices,
  AdminRecords,
}

export interface Admin {
  /**
   * The admin Data API.
   */
  data: AdminData

  /**
   * The admin Records API.
   */
  records: AdminRecords

  /**
   * The admin Indices API.
   */
  indices: AdminIndices

  /**
   * The admin Users API.
   */
  users: AdminUsers

  /**
   * The admin Wallet API.
   */
  wallet: AdminWallet

  /**
   * The admin StorageInfo API.
   */
  storageInfo: AdminStorageInfo

  /**
   * The admin Storage Jobs API.
   */
  storageJobs: AdminStorageJobs
}

/**
 * @ignore
 */
export const createAdmin = (config: Config, getMeta: () => grpc.Metadata): Admin => {
  return {
    data: createData(config, getMeta),
    records: createRecords(config, getMeta),
    indices: createIndices(config, getMeta),
    users: createUsers(config, getMeta),
    wallet: createWallet(config, getMeta),
    storageInfo: createStorageInfo(config, getMeta),
    storageJobs: createStorageJobs(config, getMeta),
  }
}
