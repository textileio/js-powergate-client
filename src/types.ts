import { grpc } from "@improbable-eng/grpc-web"
import * as dealsTypes from "@textile/grpc-powergate-client/dist/deals/rpc/rpc_pb"
import * as ffsTypes from "@textile/grpc-powergate-client/dist/ffs/rpc/rpc_pb"
import * as healthTypes from "@textile/grpc-powergate-client/dist/health/rpc/rpc_pb"
import * as minersTypes from "@textile/grpc-powergate-client/dist/index/miner/rpc/rpc_pb"
import * as netTypes from "@textile/grpc-powergate-client/dist/net/rpc/rpc_pb"

/**
 * Object that allows you to configure the Powergate client
 */
export interface Config extends grpc.RpcOptions {
  host: string
  authToken?: string
}

export { ffsTypes, healthTypes, minersTypes, netTypes, dealsTypes }
