import {
  GetRequest,
  GetResponse,
} from "@textile/grpc-powergate-client/dist/index/faults/rpc/rpc_pb"
import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/index/faults/rpc/rpc_pb_service"
import { Config } from "../types"
import { promise } from "../util"

export interface Faults {
  /**
   * Gets the faults index.
   * @returns The faults index.
   */
  get: () => Promise<GetResponse.AsObject>
}

/**
 * @ignore
 */
export const createFaults = (config: Config): Faults => {
  const client = new RPCServiceClient(config.host, config)
  return {
    get: () =>
      promise(
        (cb) => client.get(new GetRequest(), cb),
        (resp: GetResponse) => resp.toObject(),
      ),
  }
}
