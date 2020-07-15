import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/index/faults/rpc/rpc_pb_service"
import { Config, faultsTypes } from "../types"
import { promise } from "../util"

/**
 * Creates the Faults API client
 * @param config A config object that changes the behavior of the client
 * @returns The Faults API client
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createFaults = (config: Config) => {
  const client = new RPCServiceClient(config.host, config)
  return {
    /**
     * Gets the faults index
     * @returns The faults index
     */
    get: () =>
      promise(
        (cb) => client.get(new faultsTypes.GetRequest(), cb),
        (resp: faultsTypes.GetResponse) => resp.toObject().index,
      ),
  }
}
