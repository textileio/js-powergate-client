import { grpc } from "@improbable-eng/grpc-web"
import {
  RPCService,
  RPCServiceClient,
} from "@textile/grpc-powergate-client/dist/ffs/rpc/rpc_pb_service"
import { Config, ffsTypes } from "../types"
import { promise } from "../util"
import { PushConfigOption, WatchLogsOption } from "./options"
import { coldObjToMessage, hotObjToMessage } from "./util"

/**
 * Creates the FFS API client
 * @param config A config object that changes the behavior of the client
 * @param getMeta A function that returns request metadata
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
        (cb) => client.create(new ffsTypes.CreateRequest(), cb),
        (res: ffsTypes.CreateResponse) => res.toObject(),
      ),

    /**
     * Lists all FFS instance IDs
     * @returns A list off all FFS instance IDs
     */
    list: () =>
      promise(
        (cb) => client.listAPI(new ffsTypes.ListAPIRequest(), cb),
        (res: ffsTypes.ListAPIResponse) => res.toObject(),
      ),

    /**
     * Get the FFS instance ID associated with the current auth token
     * @returns A Promise containing the FFS instance ID
     */
    id: () =>
      promise(
        (cb) => client.iD(new ffsTypes.IDRequest(), getMeta(), cb),
        (res: ffsTypes.IDResponse) => res.toObject(),
      ),

    /**
     * Get all wallet addresses associated with the current auth token
     * @returns A list of wallet addresses
     */
    addrs: () =>
      promise(
        (cb) => client.addrs(new ffsTypes.AddrsRequest(), getMeta(), cb),
        (res: ffsTypes.AddrsResponse) => res.toObject(),
      ),

    /**
     * Get the default storage config associates with the current auth token
     * @returns The default storage config
     */
    defaultConfig: () =>
      promise(
        (cb) => client.defaultConfig(new ffsTypes.DefaultConfigRequest(), getMeta(), cb),
        (res: ffsTypes.DefaultConfigResponse) => res.toObject(),
      ),

    /**
     * Create a new wallet address associates with the current auth token
     * @param name A human readable name for the address
     * @param type Address type, defaults to bls
     * @param makeDefault Specify if the new address should become the default address for this FFS instance, defaults to false
     * @returns Information about the newly created address
     */
    newAddr: (name: string, type?: "bls" | "secp256k1", makeDefault?: boolean) => {
      const req = new ffsTypes.NewAddrRequest()
      req.setName(name)
      req.setAddressType(type || "bls")
      req.setMakeDefault(makeDefault || false)
      return promise(
        (cb) => client.newAddr(req, getMeta(), cb),
        (res: ffsTypes.NewAddrResponse) => res.toObject(),
      )
    },

    /**
     * Get a cid storage configuration prepped for the provided cid
     * @param cid The cid to make the storage config for
     * @returns The storage config prepped for the provided cid
     */
    getDefaultCidConfig: (cid: string) => {
      const req = new ffsTypes.GetDefaultCidConfigRequest()
      req.setCid(cid)
      return promise(
        (cb) => client.getDefaultCidConfig(req, getMeta(), cb),
        (res: ffsTypes.GetDefaultCidConfigResponse) => res.toObject(),
      )
    },

    /**
     * Get the desired storage config for the provided cid, this config may not yet be realized
     * @param cid The cid of the desired storage config
     * @returns The storage config for the provided cid
     */
    getCidConfig: (cid: string) => {
      const req = new ffsTypes.GetCidConfigRequest()
      req.setCid(cid)
      return promise(
        (cb) => client.getCidConfig(req, getMeta(), cb),
        (res: ffsTypes.GetCidConfigResponse) => res.toObject(),
      )
    },

    /**
     * Set the default storage config for this FFS instance
     * @param config The new default storage config
     */
    setDefaultConfig: (config: ffsTypes.DefaultConfig.AsObject) => {
      const c = new ffsTypes.DefaultConfig()
      c.setRepairable(config.repairable)
      if (config.hot) {
        c.setHot(hotObjToMessage(config.hot))
      }
      if (config.cold) {
        c.setCold(coldObjToMessage(config.cold))
      }
      const req = new ffsTypes.SetDefaultConfigRequest()
      req.setConfig(c)
      return promise(
        (cb) => client.setDefaultConfig(req, getMeta(), cb),
        () => {
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
      const req = new ffsTypes.ShowRequest()
      req.setCid(cid)
      return promise(
        (cb) => client.show(req, getMeta(), cb),
        (res: ffsTypes.ShowResponse) => res.toObject(),
      )
    },

    /**
     * Get general information about the current FFS instance
     * @returns Information about the FFS instance
     */
    info: () =>
      promise(
        (cb) => client.info(new ffsTypes.InfoRequest(), getMeta(), cb),
        (res: ffsTypes.InfoResponse) => res.toObject(),
      ),

    /**
     * Listen for job updates for the provided job ids
     * @param handler The callback to receive job updates
     * @param jobs A list of job ids to watch
     * @returns A function that can be used to cancel watching
     */
    watchJobs: (handler: (event: ffsTypes.Job.AsObject) => void, ...jobs: string[]) => {
      const req = new ffsTypes.WatchJobsRequest()
      req.setJidsList(jobs)
      const stream = client.watchJobs(req, getMeta())
      stream.on("data", (res) => {
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
      handler: (event: ffsTypes.LogEntry.AsObject) => void,
      cid: string,
      ...opts: WatchLogsOption[]
    ) => {
      const req = new ffsTypes.WatchLogsRequest()
      req.setCid(cid)
      opts.forEach((opt) => opt(req))
      const stream = client.watchLogs(req, getMeta())
      stream.on("data", (res) => {
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
      const req = new ffsTypes.ReplaceRequest()
      req.setCid1(cid1)
      req.setCid2(cid2)
      return promise(
        (cb) => client.replace(req, getMeta(), cb),
        (res: ffsTypes.ReplaceResponse) => res.toObject(),
      )
    },

    /**
     * Push a storage config for the specified cid
     * @param cid The cid to store
     * @param opts Options controlling the behavior storage config execution
     * @returns The job id of the job executing the storage configuration
     */
    pushConfig: (cid: string, ...opts: PushConfigOption[]) => {
      const req = new ffsTypes.PushConfigRequest()
      req.setCid(cid)
      opts.forEach((opt) => {
        opt(req)
      })
      return promise(
        (cb) => client.pushConfig(req, getMeta(), cb),
        (res: ffsTypes.PushConfigResponse) => res.toObject(),
      )
    },

    /**
     * Remove a cid from FFS storage
     * @param cid The cid to remove
     */
    remove: (cid: string) => {
      const req = new ffsTypes.RemoveRequest()
      req.setCid(cid)
      return promise(
        (cb) => client.remove(req, getMeta(), cb),
        () => {
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
        const req = new ffsTypes.GetRequest()
        req.setCid(cid)
        const stream = client.get(req, getMeta())
        stream.on("data", (resp) => {
          final = append(final, resp.getChunk_asU8())
        })
        stream.on("end", (status) => {
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
      const req = new ffsTypes.SendFilRequest()
      req.setFrom(from)
      req.setTo(to)
      req.setAmount(amount)
      return promise(
        (cb) => client.sendFil(req, getMeta(), cb),
        () => {
          // nothing to return
        },
      )
    },

    /**
     * Close the current FFS instance
     */
    close: () =>
      promise(
        (cb) => client.close(new ffsTypes.CloseRequest(), getMeta(), cb),
        () => {
          // nothing to return
        },
      ),

    /**
     * A helper method to cache data in IPFS in preparation for storing in ffsTypes.
     * This doesn't actually store data in FFS, you'll want to call pushConfig for that.
     * @param input The raw data to add
     * @returns The cid of the added data
     */
    addToHot: (input: Uint8Array) => {
      // TODO: figure out how to stream data in here, or at least stream to the server
      return new Promise<ffsTypes.AddToHotResponse.AsObject>((resolve, reject) => {
        const client = grpc.client(RPCService.AddToHot, config)
        client.onMessage((message) => {
          resolve(message.toObject() as ffsTypes.AddToHotResponse.AsObject)
        })
        client.onEnd((code, msg) => {
          if (code !== grpc.Code.OK) {
            reject(`error code ${code} - ${msg}`)
          } else {
            reject("ended with no message")
          }
        })
        client.start(getMeta())
        const req = new ffsTypes.AddToHotRequest()
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
        (cb) => client.listPayChannels(new ffsTypes.ListPayChannelsRequest(), getMeta(), cb),
        (res: ffsTypes.ListPayChannelsResponse) => res.toObject().payChannelsList,
      ),

    /**
     * Create or get a payment channel
     * @param from The address to send FIL from
     * @param to The address to send FIL to
     * @param amt The amount to ensure exists in the payment channel
     * @returns Information about the payment channel
     */
    createPayChannel: (from: string, to: string, amt: number) => {
      const req = new ffsTypes.CreatePayChannelRequest()
      req.setFrom(from)
      req.setTo(to)
      req.setAmount(amt)
      return promise(
        (cb) => client.createPayChannel(req, getMeta(), cb),
        (res: ffsTypes.CreatePayChannelResponse) => res.toObject(),
      )
    },

    /**
     * Redeem a payment channel
     * @param payChannelAddr The address of the payment channel to redeem
     */
    redeemPayChannel: (payChannelAddr: string) => {
      const req = new ffsTypes.RedeemPayChannelRequest()
      req.setPayChannelAddr(payChannelAddr)
      return promise(
        (cb) => client.redeemPayChannel(req, getMeta(), cb),
        () => {
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
        (cb) => client.showAll(new ffsTypes.ShowAllRequest(), getMeta(), cb),
        (res: ffsTypes.ShowAllResponse) => res.toObject().cidInfosList,
      ),
  }
}
