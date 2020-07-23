import {
  ListDealRecordsConfig,
  PushStorageConfigRequest,
  StorageConfig,
  WatchLogsRequest,
} from "@textile/grpc-powergate-client/dist/ffs/rpc/rpc_pb"
import { coldObjToMessage, hotObjToMessage } from "./util"

export type PushStorageConfigOption = (req: PushStorageConfigRequest) => void

/**
 * Allows you to override an existing storage configuration
 * @param override Whether or not to override any existing storage configuration
 * @returns The resulting option
 */
export const withOverride = (override: boolean): PushStorageConfigOption => {
  return (req: PushStorageConfigRequest) => {
    req.setHasOverrideConfig(true)
    req.setOverrideConfig(override)
  }
}

/**
 * Allows you to override the default storage config with a custom one
 * @param config The storage configuration to use
 * @returns The resulting option
 */
export const withStorageConfig = (config: StorageConfig.AsObject): PushStorageConfigOption => {
  return (req: PushStorageConfigRequest) => {
    const c = new StorageConfig()
    c.setRepairable(config.repairable)
    if (config.hot) {
      c.setHot(hotObjToMessage(config.hot))
    }
    if (config.cold) {
      c.setCold(coldObjToMessage(config.cold))
    }
    req.setHasConfig(true)
    req.setConfig(c)
  }
}

export type WatchLogsOption = (res: WatchLogsRequest) => void

/**
 * Control whether or not to include the history of log events
 * @param includeHistory Whether or not to include the history of log events
 * @returns The resulting option
 */
export const withHistory = (includeHistory: boolean): WatchLogsOption => {
  return (req: WatchLogsRequest) => {
    req.setHistory(includeHistory)
  }
}

/**
 * Filter log events to only those associated with the provided job id
 * @param jobId The job id to show events for
 * @returns The resulting option
 */
export const withJobId = (jobId: string): WatchLogsOption => {
  return (req: WatchLogsRequest) => {
    req.setJid(jobId)
  }
}

export type ListDealRecordsOption = (req: ListDealRecordsConfig) => void

/**
 * Limits the results deals initiated from the provided wallet addresses
 * @param addresses The list of addresses
 * @returns The resulting option
 */
export const withFromAddresses = (...addresses: string[]): ListDealRecordsOption => {
  return (req: ListDealRecordsConfig) => {
    req.setFromAddrsList(addresses)
  }
}

/**
 * Limits the results to deals for the provided data cids
 * @param cids The list of cids
 * @returns The resulting option
 */
export const withDataCids = (...cids: string[]): ListDealRecordsOption => {
  return (req: ListDealRecordsConfig) => {
    req.setDataCidsList(cids)
  }
}

/**
 * Specifies whether or not to include pending deals in the results
 * Default is false
 * Ignored for listRetrievalDealRecords
 * @param includePending Whether or not to include pending deal records
 * @returns The resulting option
 */
export const withIncludePending = (includePending: boolean): ListDealRecordsOption => {
  return (req: ListDealRecordsConfig) => {
    req.setIncludePending(includePending)
  }
}

/**
 * Specifies whether or not to include final deals in the results
 * Default is false
 * Ignored for listRetrievalDealRecords
 * @param includeFinal Whether or not to include final deal records
 * @returns The resulting option
 */
export const withIncludeFinal = (includeFinal: boolean): ListDealRecordsOption => {
  return (req: ListDealRecordsConfig) => {
    req.setIncludeFinal(includeFinal)
  }
}

/**
 * Specifies to sort the results in ascending order
 * Default is descending order
 * Records are sorted by timestamp
 * @param ascending Whether or not to sort the results in ascending order
 * @returns The resulting option
 */
export const withAscending = (ascending: boolean): ListDealRecordsOption => {
  return (req: ListDealRecordsConfig) => {
    req.setAscending(ascending)
  }
}
