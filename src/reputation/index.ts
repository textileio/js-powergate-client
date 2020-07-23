import {
  AddSourceRequest,
  GetTopMinersRequest,
  GetTopMinersResponse,
} from "@textile/grpc-powergate-client/dist/reputation/rpc/rpc_pb"
import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/reputation/rpc/rpc_pb_service"
import { Config } from "../types"
import { promise } from "../util"

export interface Reputation {
  /**
   * Adds a data source to the reputation index.
   * @param id The id of the data source.
   * @param multiaddress The multiaddress of the data source.
   */
  addSource: (id: string, multiaddress: string) => Promise<void>

  /**
   * Gets the top ranked miners.
   * @param limit Limits the number of results.
   * @returns The list of miner scores.
   */
  getTopMiners: (limit: number) => Promise<GetTopMinersResponse.AsObject>
}

/**
 * @ignore
 */
export const createReputation = (config: Config): Reputation => {
  const client = new RPCServiceClient(config.host, config)
  return {
    addSource: (id: string, multiaddress: string) => {
      const req = new AddSourceRequest()
      req.setId(id)
      req.setMaddr(multiaddress)
      return promise(
        (cb) => client.addSource(req, cb),
        () => {
          // nothing to return
        },
      )
    },

    getTopMiners: (limit: number) => {
      const req = new GetTopMinersRequest()
      req.setLimit(limit)
      return promise(
        (cb) => client.getTopMiners(req, cb),
        (resp: GetTopMinersResponse) => resp.toObject(),
      )
    },
  }
}
