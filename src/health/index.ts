import {RPCClient} from '@textile/grpc-powergate-client/dist/health/rpc/rpc_pb_service'
import {CheckRequest, CheckReply} from '@textile/grpc-powergate-client/dist/health/rpc/rpc_pb'
import {promise} from '../util'

export const health = (host: string) => {
  let client = new RPCClient(host)
  return {
    check: () => promise((cb) => client.check(new CheckRequest(), cb), (resp: CheckReply) => resp.toObject())
  }
}
