import { RPCClient } from '@textile/grpc-powergate-client/dist/index/miner/rpc/rpc_pb_service'
import { GetRequest, GetReply } from '@textile/grpc-powergate-client/dist/index/miner/rpc/rpc_pb'
import { promise } from '../util'
import { Config } from '..'

/**
 * Creates the Miners API client
 * @param config A config object that changes the behavior of the client
 * @returns The Miners API client
 */
export const createMiners = (config: Config) => {
  let client = new RPCClient(config.host, config)
  return {
    /**
     * Gets the miner index
     * @returns The miner index
     */
    get: () => promise((cb) => client.get(new GetRequest(), cb), (resp: GetReply) => resp.toObject())
  }
}
