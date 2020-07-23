import { Query } from "@textile/grpc-powergate-client/dist/index/ask/rpc/rpc_pb"

export function queryObjectToMsg(query: Query.AsObject): Query {
  const ret = new Query()
  ret.setLimit(query.limit)
  ret.setMaxPrice(query.maxPrice)
  ret.setOffset(query.offset)
  ret.setPieceSize(query.pieceSize)
  return ret
}
