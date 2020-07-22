import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/index/faults/rpc/rpc_pb_service"
import { Config, faultsTypes } from "../types"
import { promise } from "../util"

type Faults = ReturnType<typeof bindClient>

/**
 * Creates the Faults API client
 * @param config A config object that changes the behavior of the client
 * @returns The Faults API client
 */
export const createFaults = (config: Config): Faults => {
  const client = new RPCServiceClient(config.host, config)
  return bindClient(client)
}

const bindClient = (client: RPCServiceClient) => {
  return {
    /**
     * Gets the faults index
     * @returns The faults index
     */
    get: () =>
      promise(
        (cb) => client.get(new faultsTypes.GetRequest(), cb),
        (resp: faultsTypes.GetResponse) => resp.toObject(),
      ),
  }
}
