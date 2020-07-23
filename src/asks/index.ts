import {
  GetRequest,
  GetResponse,
  Query,
  QueryRequest,
  QueryResponse,
} from "@textile/grpc-powergate-client/dist/index/ask/rpc/rpc_pb"
import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/index/ask/rpc/rpc_pb_service"
import { Config } from "../types"
import { promise } from "../util"
import { queryObjectToMsg } from "./util"

export interface Asks {
  /**
   * Gets the asks index.
   * @returns The asks index.
   */
  get: () => Promise<GetResponse.AsObject>

  /**
   * Queries the asks index.
   * @param query The query to run against the asks index.
   * @returns The asks matching the provided query.
   */
  query: (query: Query.AsObject) => Promise<QueryResponse.AsObject>
}

/**
 * @ignore
 */
export const createAsks = (config: Config): Asks => {
  const client = new RPCServiceClient(config.host, config)
  return {
    get: () =>
      promise(
        (cb) => client.get(new GetRequest(), cb),
        (resp: GetResponse) => resp.toObject(),
      ),

    query: (query: Query.AsObject) => {
      const req = new QueryRequest()
      req.setQuery(queryObjectToMsg(query))
      return promise(
        (cb) => client.query(req, cb),
        (resp: QueryResponse) => resp.toObject(),
      )
    },
  }
}
