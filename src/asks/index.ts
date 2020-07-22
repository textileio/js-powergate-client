import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/index/ask/rpc/rpc_pb_service"
import { asksTypes, Config } from "../types"
import { promise } from "../util"
import { queryObjectToMsg } from "./util"

export interface Asks {
  /**
   * Gets the asks index.
   * @returns The asks index.
   */
  get: () => Promise<asksTypes.GetResponse.AsObject>

  /**
   * Queries the asks index.
   * @param query The query to run against the asks index.
   * @returns The asks matching the provided query.
   */
  query: (query: asksTypes.Query.AsObject) => Promise<asksTypes.QueryResponse.AsObject>
}

/**
 * @ignore
 */
export const createAsks = (config: Config): Asks => {
  const client = new RPCServiceClient(config.host, config)
  return {
    get: () =>
      promise(
        (cb) => client.get(new asksTypes.GetRequest(), cb),
        (resp: asksTypes.GetResponse) => resp.toObject(),
      ),

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
