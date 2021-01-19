import { StorageConfig } from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb"

/**
 * Options to control the behavior of pushStorageConfig.
 */
export interface ApplyOptions {
  /**
   * Allows you to override an existing storage configuration
   */
  override?: boolean

  /**
   * Allows you to override the default storage config with a custom one
   */
  storageConfig?: StorageConfig.AsObject

  /**
   * Allows to import active on-chain deals to the Cid deals information.
   */
  importDealIds?: number[]

  /**
   * Allows to configure if a Job should ensure the new storage configuration.
   */
  noExec?: boolean
}
