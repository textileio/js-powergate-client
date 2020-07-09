import { asksTypes } from "../types"

export function queryObjectToMsg(query: asksTypes.Query.AsObject): asksTypes.Query {
  const ret = new asksTypes.Query()
  ret.setLimit(query.limit)
  ret.setMaxPrice(query.maxPrice)
  ret.setOffset(query.offset)
  ret.setPieceSize(query.pieceSize)
  return ret
}
