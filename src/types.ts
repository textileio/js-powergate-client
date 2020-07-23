import { grpc } from "@improbable-eng/grpc-web"

/**
 * Object that allows you to configure the Powergate client
 */
export interface Config extends grpc.RpcOptions {
  /**
   * The gRPC web host URL
   */
  host: string

  /**
   * A FFS auth token
   */
  authToken?: string
}
