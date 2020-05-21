import {
  CreateRequest,
  CreateReply,
  ListAPIRequest,
  ListAPIReply,
  IDRequest,
  IDReply
} from '@textile/grpc-powergate-client/dist/ffs/rpc/rpc_pb'
import {RPCClient} from '@textile/grpc-powergate-client/dist/ffs/rpc/rpc_pb_service'
import {grpc} from '@improbable-eng/grpc-web'
import {promise} from '../util'

export const ffs = (host: string, getMeta: () => grpc.Metadata) => {
  const client = new RPCClient(host)

  return {
    create: () => promise((cb) => client.create(new CreateRequest(), cb), (res: CreateReply) => res.toObject()),

    list: () => promise((cb) => client.listAPI(new ListAPIRequest(), cb), (res: ListAPIReply) => res.toObject()),

    id: () => promise((cb) => client.iD(new IDRequest(), getMeta(), cb), (res: IDReply) => res.toObject())
  }
}
