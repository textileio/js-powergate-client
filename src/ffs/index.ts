import {
  CreateRequest,
  CreateResponse,
  ListAPIRequest,
  ListAPIResponse,
  IDRequest,
  IDResponse,
  AddrsRequest,
  AddrsResponse,
  DefaultConfigRequest,
  DefaultConfigResponse,
  NewAddrRequest,
  NewAddrResponse,
  AddToHotRequest,
  AddToHotResponse,
  GetDefaultCidConfigRequest,
  GetDefaultCidConfigResponse,
  GetCidConfigRequest,
  GetCidConfigResponse,
  DefaultConfig,
  HotConfig,
  IpfsConfig,
  ColdConfig,
  FilConfig,
  FilRenew,
  SetDefaultConfigRequest,
  SetDefaultConfigResponse,
  InfoRequest,
  InfoResponse,
  PushConfigRequest,
  CidConfig,
  PushConfigResponse,
  ShowRequest,
  ShowResponse,
  ReplaceRequest,
  ReplaceResponse,
  RemoveRequest,
  RemoveResponse,
  SendFilRequest,
  SendFilResponse,
  CloseRequest,
  CloseResponse,
  WatchJobsRequest,
  Job,
  LogEntry,
  WatchLogsRequest,
  GetRequest,
  ShowAllRequest,
  ShowAllResponse,
  ListPayChannelsRequest,
  ListPayChannelsResponse,
  CreatePayChannelRequest,
  CreatePayChannelResponse,
  RedeemPayChannelRequest,
  RedeemPayChannelResponse,
} from '@textile/grpc-powergate-client/dist/ffs/rpc/rpc_pb'
import {
  RPCServiceClient,
  RPCService,
} from '@textile/grpc-powergate-client/dist/ffs/rpc/rpc_pb_service'
import { grpc } from '@improbable-eng/grpc-web'
import { promise } from '../util'
import { Config } from '../types'

type PushConfigOption = (req: PushConfigRequest) => void

/**
 * Allows you to override an existing storage configuration
 * @param override Whether or not to override any existing storage configuration
 * @returns The resulting option
 */
export const withOverrideConfig = (override: boolean) => (req: PushConfigRequest) => {
  req.setHasOverrideConfig(true)
  req.setOverrideConfig(override)
}

/**
 * Allows you to override the default storage config with a custom one
 * @param config The storage configuration to use
 * @returns The resulting option
 */
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
  req.setHasConfig(true)
  req.setConfig(c)
}

type WatchLogsOption = (res: WatchLogsRequest) => void

/**
 * Control whether or not to include the history of log events
 * @param includeHistory Whether or not to include the history of log events
 * @returns The resulting option
 */
export const withHistory = (includeHistory: boolean) => (req: WatchLogsRequest) => {
  req.setHistory(includeHistory)
}

/**
 * Filter log events to only those associated with the provided job id
 * @param jobId The job id to show events for
 * @returns The resulting option
 */
export const withJobId = (jobId: string) => (req: WatchLogsRequest) => {
  req.setJid(jobId)
}

/**
 * Creates the FFS API client
 * @param config A config object that changes the behavior of the client
 * @param getMeta A funtion that returns request metadata
 * @returns The FFS API client
 */
export const createFFS = (config: Config, getMeta: () => grpc.Metadata) => {
  const client = new RPCServiceClient(config.host, config)
  return {
    /**
     * Creates a new FFS instance
     * @returns Information about the new FFS instance
     */
    create: () =>
      promise(
        (cb) => client.create(new CreateRequest(), cb),
        (res: CreateResponse) => res.toObject(),
      ),

    /**
     * Lists all FFS instance IDs
     * @returns A list off all FFS instance IDs
     */
    list: () =>
      promise(
        (cb) => client.listAPI(new ListAPIRequest(), cb),
        (res: ListAPIResponse) => res.toObject(),
      ),

    /**
     * Get the FFS instance ID associated with the current auth token
     * @returns A Promise containing the FFS instance ID
     */
    id: () =>
      promise(
        (cb) => client.iD(new IDRequest(), getMeta(), cb),
        (res: IDResponse) => res.toObject(),
      ),

    /**
     * Get all wallet addresses associated with the current auth token
     * @returns A list of wallet addresses
     */
    addrs: () =>
      promise(
        (cb) => client.addrs(new AddrsRequest(), getMeta(), cb),
        (res: AddrsResponse) => res.toObject(),
      ),

    /**
     * Get the default storage config associates with the current auth token
     * @returns The default storage config
     */
    defaultConfig: () =>
      promise(
        (cb) => client.defaultConfig(new DefaultConfigRequest(), getMeta(), cb),
        (res: DefaultConfigResponse) => res.toObject(),
      ),

    /**
     * Create a new wallete address associates with the current auth token
     * @param name A human readable name for the address
     * @param type Address type, defaults to bls
     * @param makeDefault Specify if the new address should become the default address for this FFS instance, defaults to false
     * @returns Information about the newly created address
     */
    newAddr: (name: string, type?: 'bls' | 'secp256k1', makeDefault?: boolean) => {
      const req = new NewAddrRequest()
      req.setName(name)
      req.setAddressType(type || 'bls')
      req.setMakeDefault(makeDefault || false)
      return promise(
        (cb) => client.newAddr(req, getMeta(), cb),
        (res: NewAddrResponse) => res.toObject(),
      )
    },

    /**
     * Get a cid storage configuration prepped for the provided cid
     * @param cid The cid to make the storage config for
     * @returns The storage config prepped for the provided cid
     */
    getDefaultCidConfig: (cid: string) => {
      const req = new GetDefaultCidConfigRequest()
      req.setCid(cid)
      return promise(
        (cb) => client.getDefaultCidConfig(req, getMeta(), cb),
        (res: GetDefaultCidConfigResponse) => res.toObject(),
      )
    },

    /**
     * Get the desired storage config for the provided cid, this config may not yet be realized
     * @param cid The cid of the desired storage config
     * @returns The storage config for the provided cid
     */
    getCidConfig: (cid: string) => {
      const req = new GetCidConfigRequest()
      req.setCid(cid)
      return promise(
        (cb) => client.getCidConfig(req, getMeta(), cb),
        (res: GetCidConfigResponse) => res.toObject(),
      )
    },

    /**
     * Set the default storage config for this FFS instance
     * @param config The new default storage config
     */
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
      return promise(
        (cb) => client.setDefaultConfig(req, getMeta(), cb),
        (res: SetDefaultConfigResponse) => {
          // nothing to return
        },
      )
    },

    /**
     * Get the current storage config for the provided cid, the reflects the actual storage state
     * @param cid The cid of the desired storage config
     * @returns The current storage config for the provided cid
     */
    show: (cid: string) => {
      const req = new ShowRequest()
      req.setCid(cid)
      return promise(
        (cb) => client.show(req, getMeta(), cb),
        (res: ShowResponse) => res.toObject(),
      )
    },

    /**
     * Get general information about the current FFS instance
     * @returns Information about the FFS instance
     */
    info: () =>
      promise(
        (cb) => client.info(new InfoRequest(), getMeta(), cb),
        (res: InfoResponse) => res.toObject(),
      ),

    /**
     * Listen for job updates for the provided job ids
     * @param handler The callback to receive job updates
     * @param jobs A list of job ids to watch
     * @returns A function that can be used to cancel watching
     */
    watchJobs: (handler: (event: Job.AsObject) => void, ...jobs: string[]) => {
      const req = new WatchJobsRequest()
      req.setJidsList(jobs)
      const stream = client.watchJobs(req, getMeta())
      stream.on('data', (res) => {
        const job = res.getJob()?.toObject()
        if (job) {
          handler(job)
        }
      })
      return stream.cancel
    },

    /**
     * Listen for any updates for a stored cid
     * @param handler The callback to receive log updates
     * @param cid The cid to watch
     * @param opts Options that control the behavior of watching logs
     * @returns A function that can be used to cancel watching
     */
    watchLogs: (
      handler: (event: LogEntry.AsObject) => void,
      cid: string,
      ...opts: WatchLogsOption[]
    ) => {
      const req = new WatchLogsRequest()
      req.setCid(cid)
      opts.forEach((opt) => opt(req))
      const stream = client.watchLogs(req, getMeta())
      stream.on('data', (res) => {
        const logEntry = res.getLogEntry()?.toObject()
        if (logEntry) {
          handler(logEntry)
        }
      })
      return stream.cancel
    },

    /**
     * Replace smth?
     * @param cid1 smth
     * @param cid2 hrmmm
     * @returns The job id of the job executing the storage configuration
     */
    replace: (cid1: string, cid2: string) => {
      const req = new ReplaceRequest()
      req.setCid1(cid1)
      req.setCid2(cid2)
      return promise(
        (cb) => client.replace(req, getMeta(), cb),
        (res: ReplaceResponse) => res.toObject(),
      )
    },

    /**
     * Push a storage config for the specified cid
     * @param cid The cid to store
     * @param opts Options controlling the behavior storage config execution
     * @returns The job id of the job executing the storage configuration
     */
    pushConfig: (cid: string, ...opts: PushConfigOption[]) => {
      const req = new PushConfigRequest()
      req.setCid(cid)
      opts.forEach((opt) => {
        opt(req)
      })
      return promise(
        (cb) => client.pushConfig(req, getMeta(), cb),
        (res: PushConfigResponse) => res.toObject(),
      )
    },

    /**
     * Remove a cid from FFS storage
     * @param cid The cid to remove
     */
    remove: (cid: string) => {
      const req = new RemoveRequest()
      req.setCid(cid)
      return promise(
        (cb) => client.remove(req, getMeta(), cb),
        (res: RemoveResponse) => {
          // nothing to return
        },
      )
    },

    /**
     * Retrieve data stored in the current FFS instance
     * @param cid The cid of the data to retrieve
     * @returns The raw data
     */
    get: (cid: string) => {
      return new Promise<Uint8Array>((resolve, reject) => {
        const append = (l: Uint8Array, r: Uint8Array) => {
          const tmp = new Uint8Array(l.byteLength + r.byteLength)
          tmp.set(l, 0)
          tmp.set(r, l.byteLength)
          return tmp
        }
        let final = new Uint8Array()
        const req = new GetRequest()
        req.setCid(cid)
        const stream = client.get(req, getMeta())
        stream.on('data', (resp) => {
          final = append(final, resp.getChunk_asU8())
        })
        stream.on('end', (status) => {
          if (status?.code !== grpc.Code.OK) {
            reject(`error code ${status?.code} - ${status?.details}`)
          } else {
            resolve(final)
          }
        })
      })
    },

    /**
     * Send FIL from an address associated with the current FFS instance to any other address
     * @param from The address to send FIL from
     * @param to The address to send FIL to
     * @param amount The amount of FIL to send
     */
    sendFil: (from: string, to: string, amount: number) => {
      const req = new SendFilRequest()
      req.setFrom(from)
      req.setTo(to)
      req.setAmount(amount)
      return promise(
        (cb) => client.sendFil(req, getMeta(), cb),
        (res: SendFilResponse) => {
          // nothing to return
        },
      )
    },

    /**
     * Close the current FFS instance
     */
    close: () =>
      promise(
        (cb) => client.close(new CloseRequest(), getMeta(), cb),
        (res: CloseResponse) => {
          // nothing to return
        },
      ),

    /**
     * A helper method to cache data in IPFS in preparation for storing in FFS.
     * This doesn't actually store data in FFS, you'll want to call pushConfig for that.
     * @param input The raw data to add
     * @returns The cid of the added data
     */
    addToHot: (input: Uint8Array) => {
      // TODO: figure out how to stream data in here, or at least stream to the server
      return new Promise<AddToHotResponse.AsObject>((resolve, reject) => {
        const client = grpc.client(RPCService.AddToHot, config)
        client.onMessage((message) => {
          resolve(message.toObject() as AddToHotResponse.AsObject)
        })
        client.onEnd((code, msg, _) => {
          if (code !== grpc.Code.OK) {
            reject(`error code ${code} - ${msg}`)
          } else {
            reject('ended with no message')
          }
        })
        client.start(getMeta())
        const req = new AddToHotRequest()
        req.setChunk(input)
        client.send(req)
        client.finishSend()
      })
    },

    /**
     * List all payment channels for the current FFS instance
     * @returns A list of payment channel info
     */
    listPayChannels: () =>
      promise(
        (cb) => client.listPayChannels(new ListPayChannelsRequest(), getMeta(), cb),
        (res: ListPayChannelsResponse) => res.toObject().payChannelsList,
      ),

    /**
     * Create or get a payment channel
     * @param from The address to send FIL from
     * @param to The address to send FIL to
     * @param amt The amount to ensure exists in the payment channel
     * @returns Information about the payment channel
     */
    createPayChannel: (from: string, to: string, amt: number) => {
      const req = new CreatePayChannelRequest()
      req.setFrom(from)
      req.setTo(to)
      req.setAmount(amt)
      return promise(
        (cb) => client.createPayChannel(req, getMeta(), cb),
        (res: CreatePayChannelResponse) => res.toObject(),
      )
    },

    /**
     * Redeem a payment channel
     * @param payChannelAddr The address of the payment channel to redeem
     */
    redeemPayChannel: (payChannelAddr: string) => {
      const req = new RedeemPayChannelRequest()
      req.setPayChannelAddr(payChannelAddr)
      return promise(
        (cb) => client.redeemPayChannel(req, getMeta(), cb),
        (res: RedeemPayChannelResponse) => {
          // nothing to return
        },
      )
    },

    /**
     * List cid infos for all data stored in the current FFS instance
     * @returns A list of cid info
     */
    showAll: () =>
      promise(
        (cb) => client.showAll(new ShowAllRequest(), getMeta(), cb),
        (res: ShowAllResponse) => res.toObject().cidInfosList,
      ),
  }
}

function coldObjToMessage(obj: ColdConfig.AsObject) {
  const cold = new ColdConfig()
  cold.setEnabled(obj.enabled)
  if (obj.filecoin) {
    const fc = new FilConfig()
    fc.setAddr(obj.filecoin.addr)
    fc.setCountryCodesList(obj.filecoin.countryCodesList)
    fc.setDealMinDuration(obj.filecoin.dealMinDuration)
    fc.setExcludedMinersList(obj.filecoin.excludedMinersList)
    fc.setMaxPrice(obj.filecoin.maxPrice)
    fc.setRepFactor(obj.filecoin.repFactor)
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

function hotObjToMessage(obj: HotConfig.AsObject) {
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
