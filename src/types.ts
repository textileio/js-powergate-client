import { grpc } from "@improbable-eng/grpc-web"
import * as ffs from "@textile/grpc-powergate-client/dist/ffs/rpc/rpc_pb"
import * as health from "@textile/grpc-powergate-client/dist/health/rpc/rpc_pb"
import * as miners from "@textile/grpc-powergate-client/dist/index/miner/rpc/rpc_pb"
import * as net from "@textile/grpc-powergate-client/dist/net/rpc/rpc_pb"

/**
 * Object that allows you to configure the Powergate client
 */
export interface Config extends grpc.RpcOptions {
  host: string
  authToken?: string
}

export { ffs, health, miners, net }
