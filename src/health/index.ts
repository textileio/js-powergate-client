import { RPCClient } from '@textile/grpc-powergate-client/dist/health/rpc/rpc_pb_service'
import { CheckRequest, CheckReply } from '@textile/grpc-powergate-client/dist/health/rpc/rpc_pb'
import { promise } from '../util'
import { Config } from '..'

export const health = (config: Config) => {
  let client = new RPCClient(config.host, config)
  return {
    check: () => promise((cb) => client.check(new CheckRequest(), cb), (resp: CheckReply) => resp.toObject())
  }
}
