import { dealsTypes } from "../types"

export function dealConfigObjToMessage(
  obj: dealsTypes.StorageDealConfig.AsObject,
): dealsTypes.StorageDealConfig {
  const msg = new dealsTypes.StorageDealConfig()
  msg.setEpochPrice(obj.epochPrice)
  msg.setMiner(obj.miner)
  return msg
}
