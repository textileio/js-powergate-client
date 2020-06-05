import { grpc } from '@improbable-eng/grpc-web'

/**
 * Object that allows you to configure the Powergate client
 */
export interface Config extends grpc.RpcOptions {
  host: string
  authToken?: string
}
