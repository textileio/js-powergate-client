import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/index/miner/rpc/rpc_pb_service"
import { Config, minersTypes } from "../types"
import { promise } from "../util"

/**
 * Creates the Miners API client
 * @param config A config object that changes the behavior of the client
 * @returns The Miners API client
 */
export const createMiners = (config: Config) => {
  const client = new RPCServiceClient(config.host, config)
  return {
    /**
     * Gets the miner index
     * @returns The miner index
     */
    get: () =>
      promise(
        (cb) => client.get(new minersTypes.GetRequest(), cb),
        (resp: minersTypes.GetResponse) => resp.toObject(),
      ),
  }
}
