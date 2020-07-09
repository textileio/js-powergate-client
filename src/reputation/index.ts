import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/reputation/rpc/rpc_pb_service"
import { Config, reputationTypes } from "../types"
import { promise } from "../util"

/**
 * Creates the Reputation API client
 * @param config A config object that changes the behavior of the client
 * @returns The Reputation API client
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createReputation = (config: Config) => {
  const client = new RPCServiceClient(config.host, config)
  return {
    /**
     * Adds a data source to the reputation index
     * @param id The id of the data source
     * @param multiaddress The multiaddress of the data source
     */
    addSource: (id: string, multiaddress: string) => {
      const req = new reputationTypes.AddSourceRequest()
      req.setId(id)
      req.setMaddr(multiaddress)
      return promise(
        (cb) => client.addSource(req, cb),
        () => {
          // nothing to return
        },
      )
    },

    /**
     * Gets the top ranked miners
     * @param limit Limits the number of results
     * @returns The list of miner scores
     */
    getTopMiners: (limit: number) => {
      const req = new reputationTypes.GetTopMinersRequest()
      req.setLimit(limit)
      return promise(
        (cb) => client.getTopMiners(req, cb),
        (resp: reputationTypes.GetTopMinersResponse) => resp.toObject().topMinersList,
      )
    },
  }
}
