import { grpc } from "@improbable-eng/grpc-web"
import {
  CreateStorageProfileRequest,
  CreateStorageProfileResponse,
  StorageProfilesRequest,
  StorageProfilesResponse,
} from "@textile/grpc-powergate-client/dist/proto/admin/v1/powergate_admin_pb"
import { PowergateAdminServiceClient } from "@textile/grpc-powergate-client/dist/proto/admin/v1/powergate_admin_pb_service"
import { Config } from "../types"
import { promise } from "../util"

export interface Profiles {
  /**
   * Create a new storage profile.
   * @returns Information about the new storage profile.
   */
  createStorageProfile: () => Promise<CreateStorageProfileResponse.AsObject>

  /**
   * List all storage profiles.
   * @returns A list of all storage profiles.
   */
  storageProfiles: () => Promise<StorageProfilesResponse.AsObject>
}

/**
 * @ignore
 */
export const createProfiles = (config: Config, getMeta: () => grpc.Metadata): Profiles => {
  const client = new PowergateAdminServiceClient(config.host, config)
  return {
    createStorageProfile: () => {
      return promise(
        (cb) => client.createStorageProfile(new CreateStorageProfileRequest(), getMeta(), cb),
        (resp: CreateStorageProfileResponse) => resp.toObject(),
      )
    },

    storageProfiles: () =>
      promise(
        (cb) => client.storageProfiles(new StorageProfilesRequest(), getMeta(), cb),
        (resp: StorageProfilesResponse) => resp.toObject(),
      ),
  }
}
