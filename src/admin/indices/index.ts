import { grpc } from "@improbable-eng/grpc-web"
import {
  GetMinerInfoRequest,
  GetMinerInfoResponse,
  GetMinersRequest,
  GetMinersResponse,
} from "@textile/grpc-powergate-client/dist/powergate/admin/v1/admin_pb"
import { AdminServiceClient } from "@textile/grpc-powergate-client/dist/powergate/admin/v1/admin_pb_service"
import { Config } from "../../types"
import { promise } from "../../util"
import { AdminGetMinersOptions } from "./types"

export { AdminGetMinersOptions }

export interface AdminIndices {
  /**
   * Gets a list of miner addresses that satisfies the provided filters.
   * @returns An object containing a list of miner addresses.
   */
  getMiners: (opts?: AdminGetMinersOptions) => Promise<GetMinersResponse.AsObject>

  /**
   * Gets all known indices data for the provided miner addresses.
   * @returns An object containing a list of miner info.
   */
  getMinerInfo: (...miners: string[]) => Promise<GetMinerInfoResponse.AsObject>
}

/**
 * @ignore
 */
export const createIndices = (config: Config, getMeta: () => grpc.Metadata): AdminIndices => {
  const client = new AdminServiceClient(config.host, config)
  return {
    getMiners: (opts?: AdminGetMinersOptions) => {
      const req = new GetMinersRequest()
      if (opts?.withPower) {
        req.setWithPower(opts.withPower)
      }
      return promise(
        (cb) => client.getMiners(req, getMeta(), cb),
        (resp: GetMinersResponse) => resp.toObject(),
      )
    },

    getMinerInfo: (...miners: string[]) => {
      const req = new GetMinerInfoRequest()
      if (miners) {
        req.setMinersList(miners)
      }
      return promise(
        (cb) => client.getMinerInfo(req, getMeta(), cb),
        (resp: GetMinerInfoResponse) => resp.toObject(),
      )
    },
  }
}
