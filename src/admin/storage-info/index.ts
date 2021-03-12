import { grpc } from "@improbable-eng/grpc-web"
import {
  ListStorageInfoRequest,
  ListStorageInfoResponse,
  StorageInfoRequest,
  StorageInfoResponse,
} from "@textile/grpc-powergate-client/dist/powergate/admin/v1/admin_pb"
import { AdminServiceClient } from "@textile/grpc-powergate-client/dist/powergate/admin/v1/admin_pb_service"
import { Config } from "../../types"
import { promise } from "../../util"

export interface AdminStorageInfo {
  /**
   * Get the current storage state of a cid.
   * @param userId The user id to query.
   * @param cid The cid to query.
   * @returns The current storage state of the cid.
   */
  get: (userId: string, cid: string) => Promise<StorageInfoResponse.AsObject>

  /**
   * Lists the current storage state for many or all user ids and cids.
   * @param cids Optional list of cids to filter the results by.
   * @returns An object containing a list of storage info.
   */
  list: (userIds?: string[], cids?: string[]) => Promise<ListStorageInfoResponse.AsObject>
}

/**
 * @ignore
 */
export const createStorageInfo = (
  config: Config,
  getMeta: () => grpc.Metadata,
): AdminStorageInfo => {
  const client = new AdminServiceClient(config.host, config)
  return {
    get: (userId: string, cid: string) => {
      const req = new StorageInfoRequest()
      req.setUserId(userId)
      req.setCid(cid)
      return promise(
        (cb) => client.storageInfo(req, getMeta(), cb),
        (res: StorageInfoResponse) => res.toObject(),
      )
    },

    list: (userIds?: string[], cids?: string[]) => {
      const req = new ListStorageInfoRequest()
      if (userIds) {
        req.setUserIdsList(userIds)
      }
      if (cids) {
        req.setCidsList(cids)
      }
      return promise(
        (cb) => client.listStorageInfo(req, getMeta(), cb),
        (res: ListStorageInfoResponse) => res.toObject(),
      )
    },
  }
}
