import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/health/rpc/rpc_pb_service"
import { Config, healthTypes } from "../types"
import { promise } from "../util"

export interface Health {
  check: () => Promise<healthTypes.CheckResponse.AsObject>
}
/**
 * Creates the Health API client
 * @param config A config object that changes the behavior of the client
 * @returns The Health API client
 */
export const createHealth = (config: Config): Health => {
  const client = new RPCServiceClient(config.host, config)
  return {
    /**
     * Checks the Powergate node health
     * @returns Information about the health of the Powergate node
     */
    check: () =>
      promise(
        (cb) => client.check(new healthTypes.CheckRequest(), cb),
        (resp: healthTypes.CheckResponse) => resp.toObject(),
      ),
  }
}
