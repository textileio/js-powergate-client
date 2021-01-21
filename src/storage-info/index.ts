import { grpc } from "@improbable-eng/grpc-web"
import {
  ListStorageInfoRequest,
  ListStorageInfoResponse,
  StorageInfoRequest,
  StorageInfoResponse,
} from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb"
import { UserServiceClient } from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb_service"
import { Config } from "../types"
import { promise } from "../util"

export interface StorageInfo {
  /**
   * Get the current storage state of a cid.
   * @param cid The cid to query.
   * @returns The current storage state of the cid.
   */
  get: (cid: string) => Promise<StorageInfoResponse.AsObject>

  /**
   * Lists the current storage state for many or all cids.
   * @param cids Optional list of cids to filter the results by.
   * @returns An object containing a list of storage info.
   */
  list: (...cids: string[]) => Promise<ListStorageInfoResponse.AsObject>
}

/**
 * @ignore
 */
export const createStorageInfo = (config: Config, getMeta: () => grpc.Metadata): StorageInfo => {
  const client = new UserServiceClient(config.host, config)
  return {
    get: (cid: string) => {
      const req = new StorageInfoRequest()
      req.setCid(cid)
      return promise(
        (cb) => client.storageInfo(req, getMeta(), cb),
        (res: StorageInfoResponse) => res.toObject(),
      )
    },

    list: (...cids: string[]) => {
      const req = new ListStorageInfoRequest()
      req.setCidsList(cids)
      return promise(
        (cb) => client.listStorageInfo(req, getMeta(), cb),
        (res: ListStorageInfoResponse) => res.toObject(),
      )
    },
  }
}
