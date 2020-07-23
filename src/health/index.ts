import { CheckRequest, CheckResponse } from "@textile/grpc-powergate-client/dist/health/rpc/rpc_pb"
import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/health/rpc/rpc_pb_service"
import { Config } from "../types"
import { promise } from "../util"

export interface Health {
  /**
   * Checks the Powergate node health.
   * @returns Information about the health of the Powergate node.
   */
  check: () => Promise<CheckResponse.AsObject>
}

/**
 * @ignore
 */
export const createHealth = (config: Config): Health => {
  const client = new RPCServiceClient(config.host, config)
  return {
    check: () =>
      promise(
        (cb) => client.check(new CheckRequest(), cb),
        (resp: CheckResponse) => resp.toObject(),
      ),
  }
}
