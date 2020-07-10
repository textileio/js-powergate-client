import { dealsTypes } from "../types"

export function dealConfigObjToMessage(obj: dealsTypes.DealConfig.AsObject): dealsTypes.DealConfig {
  const msg = new dealsTypes.DealConfig()
  msg.setEpochPrice(obj.epochPrice)
  msg.setMiner(obj.miner)
  return msg
}
