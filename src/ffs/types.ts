import { StorageConfig } from "@textile/grpc-powergate-client/dist/ffs/rpc/rpc_pb"

/**
 * Options to control the behavior of pushStorageConfig.
 */
export type PushStorageConfigOptions = {
  /**
   * Allows you to override an existing storage configuration
   */
  override?: boolean

  /**
   * Allows you to override the default storage config with a custom one
   */
  storageConfig?: StorageConfig.AsObject
}

/**
 * Object that allows you to configure the call to getFolder
 */
export type GetFolderOptions = {
  /**
   * Timeout for fetching data
   */
  timeout?: number
}

/**
 * Controls the behavior of listing deal records.
 */
export type ListDealRecordsOptions = {
  /**
   * Limits the results deals initiated from the provided wallet addresses.
   */
  fromAddresses?: string[]

  /**
   * Limits the results to deals for the provided data cids
   */
  dataCids?: string[]

  /**
   * Specifies whether or not to include pending deals in the results
   * Default is false
   * Ignored for listRetrievalDealRecords
   */
  includePending?: boolean

  /**
   * Specifies whether or not to include final deals in the results
   * Default is false
   * Ignored for listRetrievalDealRecords
   */
  includeFinal?: boolean

  /**
   * Specifies to sort the results in ascending order
   * Default is descending order
   * Records are sorted by timestamp */
  ascending?: boolean
}

/**
 * Object control the behavior of watchLogs
 */
export type WatchLogsOptions = {
  /**
   * Control whether or not to include the history of log events
   */
  includeHistory?: boolean

  /**
   * Filter log events to only those associated with the provided job id
   */
  jobId?: string
}
