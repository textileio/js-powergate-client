import { ffs } from "../types"

export function coldObjToMessage(obj: ffs.ColdConfig.AsObject) {
  const cold = new ffs.ColdConfig()
  cold.setEnabled(obj.enabled)
  if (obj.filecoin) {
    const fc = new ffs.FilConfig()
    fc.setAddr(obj.filecoin.addr)
    fc.setCountryCodesList(obj.filecoin.countryCodesList)
    fc.setDealMinDuration(obj.filecoin.dealMinDuration)
    fc.setExcludedMinersList(obj.filecoin.excludedMinersList)
    fc.setMaxPrice(obj.filecoin.maxPrice)
    fc.setRepFactor(obj.filecoin.repFactor)
    fc.setTrustedMinersList(obj.filecoin.trustedMinersList)
    if (obj.filecoin.renew) {
      const renew = new ffs.FilRenew()
      renew.setEnabled(obj.filecoin.renew.enabled)
      renew.setThreshold(obj.filecoin.renew.threshold)
      fc.setRenew(renew)
    }
    cold.setFilecoin(fc)
  }
  return cold
}

export function hotObjToMessage(obj: ffs.HotConfig.AsObject) {
  const hot = new ffs.HotConfig()
  hot.setAllowUnfreeze(obj.allowUnfreeze)
  hot.setEnabled(obj.enabled)
  if (obj?.ipfs) {
    const ipfs = new ffs.IpfsConfig()
    ipfs.setAddTimeout(obj.ipfs.addTimeout)
    hot.setIpfs(ipfs)
  }
  return hot
}
