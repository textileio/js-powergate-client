import {
  CreateRequest,
  CreateReply,
  ListAPIRequest,
  ListAPIReply,
  IDRequest,
  IDReply,
  AddrsRequest,
  AddrsReply,
  DefaultConfigRequest,
  DefaultConfigReply,
  NewAddrRequest,
  NewAddrReply,
  AddToHotRequest,
  AddToHotReply,
  GetDefaultCidConfigRequest,
  GetDefaultCidConfigReply,
  GetCidConfigRequest,
  GetCidConfigReply,
  DefaultConfig,
  HotConfig,
  IpfsConfig,
  ColdConfig,
  FilConfig,
  FilRenew,
  SetDefaultConfigRequest,
  SetDefaultConfigReply,
  InfoRequest,
  InfoReply,
  PushConfigRequest,
  CidConfig,
  PushConfigReply
} from '@textile/grpc-powergate-client/dist/ffs/rpc/rpc_pb'
import {RPCClient, RPC} from '@textile/grpc-powergate-client/dist/ffs/rpc/rpc_pb_service'
import {grpc} from '@improbable-eng/grpc-web'
import {promise} from '../util'

type PushConfigOption = (req: PushConfigRequest) => void
export const withOverrideConfig = (override: boolean) => (req: PushConfigRequest) => {
  req.setHasoverrideconfig(true)
  req.setOverrideconfig(override)
}
export const withConfig = (config: CidConfig.AsObject) => (req: PushConfigRequest) => {
  const c = new CidConfig()
  c.setCid(config.cid)
  c.setRepairable(config.repairable)
  if (config.hot) {
    c.setHot(hotObjToMessage(config.hot))
  }
  if (config.cold) {
    c.setCold(coldObjToMessage(config.cold))
  }
  req.setHasconfig(true)
  req.setConfig(c)
}

export const ffs = (host: string, getMeta: () => grpc.Metadata) => {
  const client = new RPCClient(host)

  return {
    create: () => promise((cb) => client.create(new CreateRequest(), cb), (res: CreateReply) => res.toObject()),

    list: () => promise((cb) => client.listAPI(new ListAPIRequest(), cb), (res: ListAPIReply) => res.toObject()),

    id: () => promise((cb) => client.iD(new IDRequest(), getMeta(), cb), (res: IDReply) => res.toObject()),

    addrs: () => promise((cb) => client.addrs(new AddrsRequest(), getMeta(), cb), (res: AddrsReply) => res.toObject()),

    defaultConfig: () => promise((cb) => client.defaultConfig(new DefaultConfigRequest(), getMeta(), cb), (res: DefaultConfigReply) => res.toObject()),

    newAddr: (name: string, type?: 'bls' | 'secp256k1', makeDefault?: boolean) => {
      const req = new NewAddrRequest()
      req.setName(name)
      req.setAddresstype(type || 'bls')
      req.setMakedefault(makeDefault || false)
      return promise((cb) => client.newAddr(req, getMeta(), cb), (res: NewAddrReply) => res.toObject())
    },

    getDefaultCidConfig: (cid: string) => {
      const req = new GetDefaultCidConfigRequest()
      req.setCid(cid)
      return promise((cb) => client.getDefaultCidConfig(req, getMeta(), cb), (res: GetDefaultCidConfigReply) => res.toObject())
    },

    getCidConfig: (cid: string) => {
      const req = new GetCidConfigRequest()
      req.setCid(cid)
      return promise((cb) => client.getCidConfig(req, getMeta(), cb), (res: GetCidConfigReply) => res.toObject())
    },

    setDefaultConfig: (config: DefaultConfig.AsObject) => {
      const c = new DefaultConfig()
      c.setRepairable(config.repairable)
      if (config.hot) {
        c.setHot(hotObjToMessage(config.hot))
      }
      if (config.cold) {
        c.setCold(coldObjToMessage(config.cold))
      }
      const req = new SetDefaultConfigRequest()
      req.setConfig(c)
      return promise((cb) => client.setDefaultConfig(req, getMeta(), cb), (res: SetDefaultConfigReply) => res.toObject())
    },

    info: () => promise((cb) => client.info(new InfoRequest(), getMeta(), cb), (res: InfoReply) => res.toObject()),

    pushConfig: (cid: string, ...opts: PushConfigOption[]) => {
      const req = new PushConfigRequest()
      req.setCid(cid)
      opts.forEach((opt) => {
        opt(req)
      })
      return promise((cb) => client.pushConfig(req, getMeta(), cb), (res: PushConfigReply) => res.toObject())
    },

    addToHot: (input: File | Blob) => {
      // TODO: figure out how to stream data in here, or at least stream to the server
      return new Promise<AddToHotReply.AsObject>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (!reader.result) {
            reject('empty reader result')
          } else if (typeof reader.result == 'string') {
            reject('unexpected string reader result')
          } else {
            const client = grpc.client(RPC.AddToHot, {host})
            client.onMessage((message) => {
              resolve(message.toObject() as AddToHotReply.AsObject)
            })
            client.onEnd((code, msg, _) => {
              if (code !== grpc.Code.OK) {
                reject(`error code ${code} - ${msg}`)
              } else {
                reject('ended with no message')
              }
            })
            client.start(getMeta());
            const arr = new Uint8Array(reader.result)
            const req = new AddToHotRequest()
            req.setChunk(arr)
            client.send(req);
            client.finishSend()
          }
        }
        reader.onerror = (e) => {
          reject(reader.error)
        }
        reader.onabort = (e) => {
          reject('aborted')
        }
        reader.readAsArrayBuffer(input)
      })
    }
  }
}

function coldObjToMessage(obj: ColdConfig.AsObject) {
  const cold = new ColdConfig()
  cold.setEnabled(obj.enabled)
  if (obj.filecoin) {
    const fc = new FilConfig()
    fc.setAddr(obj.filecoin.addr)
    fc.setCountrycodesList(obj.filecoin.countrycodesList)
    fc.setDealduration(obj.filecoin.dealduration)
    fc.setExcludedminersList(obj.filecoin.excludedminersList)
    fc.setRepfactor(obj.filecoin.repfactor)
    fc.setTrustedminersList(obj.filecoin.trustedminersList)
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

function hotObjToMessage(obj: HotConfig.AsObject) {
  const hot = new HotConfig()
  hot.setAllowunfreeze(obj.allowunfreeze)
  hot.setEnabled(obj.enabled)
  if (obj?.ipfs) {
    const ipfs = new IpfsConfig()
    ipfs.setAddtimeout(obj.ipfs.addtimeout)
    hot.setIpfs(ipfs)
  }
  return hot
}
