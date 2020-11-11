import { StorageConfig } from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb"

/**
 * Options to control the behavior of pushStorageConfig.
 */
export type ApplyOptions = {
  /**
   * Allows you to override an existing storage configuration
   */
  override?: boolean

  /**
   * Allows you to override the default storage config with a custom one
   */
  storageConfig?: StorageConfig.AsObject
}
