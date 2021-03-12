import { grpc } from "@improbable-eng/grpc-web"
import {
  GCStagedRequest,
  GCStagedResponse,
  PinnedCidsRequest,
  PinnedCidsResponse,
} from "@textile/grpc-powergate-client/dist/powergate/admin/v1/admin_pb"
import { AdminServiceClient } from "@textile/grpc-powergate-client/dist/powergate/admin/v1/admin_pb_service"
import { Config } from "../../types"
import { promise } from "../../util"

export interface AdminData {
  /**
   * Unpins staged data not related to queued or executing jobs.
   * @returns An object containing a list of unpinned cids.
   */
  gcStaged: () => Promise<GCStagedResponse.AsObject>

  /**
   * Get pinned cids information of hot-storage.
   * @returns Pinned cids information of hot-storage.
   */
  pinnedCids: () => Promise<PinnedCidsResponse.AsObject>
}

/**
 * @ignore
 */
export const createData = (config: Config, getMeta: () => grpc.Metadata): AdminData => {
  const client = new AdminServiceClient(config.host, config)
  return {
    gcStaged: () => {
      return promise(
        (cb) => client.gCStaged(new GCStagedRequest(), getMeta(), cb),
        (resp: GCStagedResponse) => resp.toObject(),
      )
    },

    pinnedCids: () =>
      promise(
        (cb) => client.pinnedCids(new PinnedCidsRequest(), getMeta(), cb),
        (resp: PinnedCidsResponse) => resp.toObject(),
      ),
  }
}
