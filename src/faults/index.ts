import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/index/faults/rpc/rpc_pb_service"
import { Config, faultsTypes } from "../types"
import { promise } from "../util"

export interface Faults {
  /**
   * Gets the faults index.
   * @returns The faults index.
   */
  get: () => Promise<faultsTypes.GetResponse.AsObject>
}

/**
 * @ignore
 */
export const createFaults = (config: Config): Faults => {
  const client = new RPCServiceClient(config.host, config)
  return {
    get: () =>
      promise(
        (cb) => client.get(new faultsTypes.GetRequest(), cb),
        (resp: faultsTypes.GetResponse) => resp.toObject(),
      ),
  }
}
