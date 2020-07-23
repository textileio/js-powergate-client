import { GetRequest, GetResponse } from "@textile/grpc-powergate-client/dist/index/miner/rpc/rpc_pb"
import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/index/miner/rpc/rpc_pb_service"
import { Config } from "../types"
import { promise } from "../util"

export interface Miners {
  /**
   * Gets the miner index.
   * @returns The miner index.
   */
  get: () => Promise<GetResponse.AsObject>
}

/**
 * @ignore
 */
export const createMiners = (config: Config): Miners => {
  const client = new RPCServiceClient(config.host, config)
  return {
    get: () =>
      promise(
        (cb) => client.get(new GetRequest(), cb),
        (resp: GetResponse) => resp.toObject(),
      ),
  }
}
