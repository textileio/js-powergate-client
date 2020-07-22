import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/index/miner/rpc/rpc_pb_service"
import { Config, minersTypes } from "../types"
import { promise } from "../util"

export interface Miners {
  /**
   * Gets the miner index.
   * @returns The miner index.
   */
  get: () => Promise<minersTypes.GetResponse.AsObject>
}

/**
 * @ignore
 */
export const createMiners = (config: Config): Miners => {
  const client = new RPCServiceClient(config.host, config)
  return {
    get: () =>
      promise(
        (cb) => client.get(new minersTypes.GetRequest(), cb),
        (resp: minersTypes.GetResponse) => resp.toObject(),
      ),
  }
}
