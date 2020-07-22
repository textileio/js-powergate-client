import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/index/ask/rpc/rpc_pb_service"
import { asksTypes, Config } from "../types"
import { promise } from "../util"
import { queryObjectToMsg } from "./util"

/**
 * Creates the Asks API client
 * @param config A config object that changes the behavior of the client
 * @returns The Asks API client
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createAsks = (config: Config) => {
  const client = new RPCServiceClient(config.host, config)
  return {
    /**
     * Gets the asks index
     * @returns The asks index
     */
    get: () =>
      promise(
        (cb) => client.get(new asksTypes.GetRequest(), cb),
        (resp: asksTypes.GetResponse) => resp.toObject(),
      ),

    /**
     * Queries the asks index
     * @param query The query to run against the asks index
     * @returns The asks matching the provided query
     */
    query: (query: asksTypes.Query.AsObject) => {
      const req = new asksTypes.QueryRequest()
      req.setQuery(queryObjectToMsg(query))
      return promise(
        (cb) => client.query(req, cb),
        (resp: asksTypes.QueryResponse) => resp.toObject(),
      )
    },
  }
}
