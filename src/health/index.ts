import { RPCServiceClient } from '@textile/grpc-powergate-client/dist/health/rpc/rpc_pb_service'
import { CheckRequest, CheckResponse } from '@textile/grpc-powergate-client/dist/health/rpc/rpc_pb'
import { promise } from '../util'
import { Config } from '..'

/**
 * Creates the Health API client
 * @param config A config object that changes the behavior of the client
 * @returns The Health API client
 */
export const createHealth = (config: Config) => {
  let client = new RPCServiceClient(config.host, config)
  return {
    /**
     * Checks the Powergate node health
     * @returns Information about the health of the Powergate node
     */
    check: () => promise((cb) => client.check(new CheckRequest(), cb), (resp: CheckResponse) => resp.toObject())
  }
}
