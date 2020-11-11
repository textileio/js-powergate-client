import {
  ColdConfig,
  FilConfig,
  FilRenew,
  HotConfig,
  IpfsConfig,
} from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb"

export function coldObjToMessage(obj: ColdConfig.AsObject): ColdConfig {
  const cold = new ColdConfig()
  cold.setEnabled(obj.enabled)
  if (obj.filecoin) {
    const fc = new FilConfig()
    fc.setAddress(obj.filecoin.address)
    fc.setCountryCodesList(obj.filecoin.countryCodesList)
    fc.setDealMinDuration(obj.filecoin.dealMinDuration)
    fc.setExcludedMinersList(obj.filecoin.excludedMinersList)
    fc.setMaxPrice(obj.filecoin.maxPrice)
    fc.setReplicationFactor(obj.filecoin.replicationFactor)
    fc.setTrustedMinersList(obj.filecoin.trustedMinersList)
    if (obj.filecoin.renew) {
      const renew = new FilRenew()
      renew.setEnabled(obj.filecoin.renew.enabled)
      renew.setThreshold(obj.filecoin.renew.threshold)
      fc.setRenew(renew)
    }
    cold.setFilecoin(fc)
  }
  return cold
}

export function hotObjToMessage(obj: HotConfig.AsObject): HotConfig {
  const hot = new HotConfig()
  hot.setAllowUnfreeze(obj.allowUnfreeze)
  hot.setEnabled(obj.enabled)
  if (obj?.ipfs) {
    const ipfs = new IpfsConfig()
    ipfs.setAddTimeout(obj.ipfs.addTimeout)
    hot.setIpfs(ipfs)
  }
  return hot
}
