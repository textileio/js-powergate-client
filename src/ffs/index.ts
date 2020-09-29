import { grpc } from "@improbable-eng/grpc-web"
import {
  AddrsRequest,
  AddrsResponse,
  CancelJobRequest,
  CreatePayChannelRequest,
  CreatePayChannelResponse,
  CreateRequest,
  CreateResponse,
  DefaultStorageConfigRequest,
  DefaultStorageConfigResponse,
  GetRequest,
  GetStorageConfigRequest,
  GetStorageConfigResponse,
  GetStorageJobRequest,
  GetStorageJobResponse,
  IDRequest,
  IDResponse,
  InfoRequest,
  InfoResponse,
  Job,
  ListAPIRequest,
  ListAPIResponse,
  ListDealRecordsConfig,
  ListPayChannelsRequest,
  ListPayChannelsResponse,
  ListRetrievalDealRecordsRequest,
  ListRetrievalDealRecordsResponse,
  ListStorageDealRecordsRequest,
  ListStorageDealRecordsResponse,
  LogEntry,
  NewAddrRequest,
  NewAddrResponse,
  PushStorageConfigRequest,
  PushStorageConfigResponse,
  RedeemPayChannelRequest,
  RemoveRequest,
  ReplaceRequest,
  ReplaceResponse,
  SendFilRequest,
  SetDefaultStorageConfigRequest,
  ShowAllRequest,
  ShowAllResponse,
  ShowRequest,
  ShowResponse,
  StageRequest,
  StageResponse,
  StorageConfig,
  WatchJobsRequest,
  WatchLogsRequest,
} from "@textile/grpc-powergate-client/dist/ffs/rpc/rpc_pb"
import {
  RPCService,
  RPCServiceClient,
} from "@textile/grpc-powergate-client/dist/ffs/rpc/rpc_pb_service"
import fs from "fs"
import ipfsClient from "ipfs-http-client"
import block from "it-block"
import path from "path"
import { Config } from "../types"
import { promise } from "../util"
import { File, normaliseInput } from "./normalize"
import {
  GetFolderOptions,
  ListDealRecordsOptions,
  PushStorageConfigOptions,
  WatchLogsOptions,
} from "./types"
import { coldObjToMessage, hotObjToMessage } from "./util"

export { GetFolderOptions, ListDealRecordsOptions, WatchLogsOptions, PushStorageConfigOptions }

export interface FFS {
  /**
   * Creates a new FFS instance.
   * @returns Information about the new FFS instance.
   */
  create: () => Promise<CreateResponse.AsObject>

  /**
   * Lists all FFS instance IDs.
   * @returns A list off all FFS instance IDs.
   */
  list: () => Promise<ListAPIResponse.AsObject>

  /**
   * Get the FFS instance ID associated with the current auth token.
   * @returns A Promise containing the FFS instance ID.
   */
  id: () => Promise<IDResponse.AsObject>

  /**
   * Get all wallet addresses associated with the current auth token.
   * @returns A list of wallet addresses.
   */
  addrs: () => Promise<AddrsResponse.AsObject>

  /**
   * Get the default storage config associated with the current auth token.
   * @returns The default storage config.
   */
  defaultStorageConfig: () => Promise<DefaultStorageConfigResponse.AsObject>

  /**
   * Create a new wallet address associates with the current auth token.
   * @param name A human readable name for the address.
   * @param type Address type, defaults to bls.
   * @param makeDefault Specify if the new address should become the default address for this FFS instance, defaults to false.
   * @returns Information about the newly created address.
   */
  newAddr: (
    name: string,
    type?: "bls" | "secp256k1" | undefined,
    makeDefault?: boolean | undefined,
  ) => Promise<NewAddrResponse.AsObject>

  /**
   * Get the desired storage config for the provided cid, this config may not yet be realized.
   * @param cid The cid of the desired storage config.
   * @returns The storage config for the provided cid.
   */
  getStorageConfig: (cid: string) => Promise<GetStorageConfigResponse.AsObject>

  /**
   * Set the default storage config for this FFS instance.
   * @param config The new default storage config.
   */
  setDefaultStorageConfig: (config: StorageConfig.AsObject) => Promise<void>

  /**
   * Get the current storage config for the provided cid, the reflects the actual storage state.
   * @param cid The cid of the desired storage config.
   * @returns The current storage config for the provided cid.
   */
  show: (cid: string) => Promise<ShowResponse.AsObject>

  /**
   * Get general information about the current FFS instance.
   * @returns Information about the FFS instance.
   */
  info: () => Promise<InfoResponse.AsObject>

  /**
   * Get the current state of a storage job.
   * @param jobId The job id to query.
   * @returns The current state of the storage job.
   */
  getStorageJob: (jobId: string) => Promise<GetStorageJobResponse.AsObject>

  /**
   * Listen for job updates for the provided job ids.
   * @param handler The callback to receive job updates.
   * @param jobs A list of job ids to watch.
   * @returns A function that can be used to cancel watching.
   */
  watchJobs: (handler: (event: Job.AsObject) => void, ...jobs: string[]) => () => void

  /**
   * Cancel a job.
   * @param jobId The id of the job to cancel.
   */
  cancelJob: (jobId: string) => Promise<void>

  /**
   * Listen for any updates for a stored cid.
   * @param handler The callback to receive log updates.
   * @param cid The cid to watch.
   * @param opts Options that control the behavior of watching logs.
   * @returns A function that can be used to cancel watching.
   */
  watchLogs: (
    handler: (event: LogEntry.AsObject) => void,
    cid: string,
    opts?: WatchLogsOptions,
  ) => () => void

  /**
   * Replace pushes a StorageConfig for cid2 equal to that of cid1, and removes cid1. This operation
   * is more efficient than manually removing and adding in two separate operations.
   * @param cid1 The cid to replace.
   * @param cid2 The new cid.
   * @returns The job id of the job executing the storage configuration.
   */
  replace: (cid1: string, cid2: string) => Promise<ReplaceResponse.AsObject>

  /**
   * Push a storage config for the specified cid.
   * @param cid The cid to store.
   * @param opts Options controlling the behavior storage config execution.
   * @returns An object containing the job id of the job executing the storage configuration.
   */
  pushStorageConfig: (
    cid: string,
    opts?: PushStorageConfigOptions,
  ) => Promise<PushStorageConfigResponse.AsObject>

  /**
   * Remove a cid from FFS storage.
   * @param cid The cid to remove.
   */
  remove: (cid: string) => Promise<void>

  /**
   * Retrieve data stored in the current FFS instance.
   * @param cid The cid of the data to retrieve.
   * @returns The raw data.
   */
  get: (cid: string) => Promise<Uint8Array>

  /**
   * Retrieve a folder stored in the current FFS instance.
   * @param cid The root cid of the folder to retrieve.
   * @param outputPath The location to write the folder to
   * @param opts Options controlling the behavior of retrieving the folder
   */
  getFolder: (cid: string, output: string, opts?: GetFolderOptions) => Promise<void>

  /**
   * Send FIL from an address associated with the current FFS instance to any other address.
   * @param from The address to send FIL from.
   * @param to The address to send FIL to.
   * @param amount The amount of FIL to send.
   */
  sendFil: (from: string, to: string, amount: number) => Promise<void>

  /**
   * A helper method to stage data in IPFS in preparation for storing using ffs.pushStorageConfig.
   * This doesn't actually store data in FFS, you'll want to call pushStorageConfig for that.
   * @param input The raw data to add.
   * @returns The cid of the added data.
   */
  stage: (input: Uint8Array) => Promise<StageResponse.AsObject>

  /**
   * A helper method to stage a folder recursively in IPFS in preparation for storing using ffs.pushStorageConfig.
   * This doesn't actually store data in FFS, you'll want to call pushStorageConfig for that.
   * @param path The path to the folder to add.
   * @returns The cid of the added folder.
   */
  stageFolder: (path: string) => Promise<string>

  /**
   * List all payment channels for the current FFS instance.
   * @returns A list of payment channel info.
   */
  listPayChannels: () => Promise<ListPayChannelsResponse.AsObject>

  /**
   * Create or get a payment channel.
   * @param from The address to send FIL from.
   * @param to The address to send FIL to.
   * @param amt The amount to ensure exists in the payment channel.
   * @returns Information about the payment channel.
   */
  createPayChannel: (
    from: string,
    to: string,
    amt: number,
  ) => Promise<CreatePayChannelResponse.AsObject>

  /**
   * Redeem a payment channel.
   * @param payChannelAddr The address of the payment channel to redeem.
   */
  redeemPayChannel: (payChannelAddr: string) => Promise<void>

  /**
   * List storage deal records for the FFS instance according to the provided options.
   * @param opts Options that control the behavior of listing records.
   * @returns A list of storage deal records.
   */
  listStorageDealRecords: (
    opts?: ListDealRecordsOptions,
  ) => Promise<ListStorageDealRecordsResponse.AsObject>

  /**
   * List retrieval deal records for the FFS instance according to the provided options.
   * @param opts Options that control the behavior of listing records.
   * @returns A list of retrieval deal records.
   */
  listRetrievalDealRecords: (
    opts?: ListDealRecordsOptions,
  ) => Promise<ListRetrievalDealRecordsResponse.AsObject>

  /**
   * List cid infos for all data stored in the current FFS instance.
   * @returns A list of cid info.
   */
  showAll: () => Promise<ShowAllResponse.AsObject>
}

/**
 * @ignore
 */
export const createFFS = (
  config: Config,
  getMeta: () => grpc.Metadata,
  getHeaders: () => Record<string, string>,
): FFS => {
  const client = new RPCServiceClient(config.host, config)
  const ipfs = ipfsClient(config.host)
  return {
    create: () =>
      promise(
        (cb) => client.create(new CreateRequest(), cb),
        (res: CreateResponse) => res.toObject(),
      ),

    list: () =>
      promise(
        (cb) => client.listAPI(new ListAPIRequest(), cb),
        (res: ListAPIResponse) => res.toObject(),
      ),

    id: () =>
      promise(
        (cb) => client.iD(new IDRequest(), getMeta(), cb),
        (res: IDResponse) => res.toObject(),
      ),

    addrs: () =>
      promise(
        (cb) => client.addrs(new AddrsRequest(), getMeta(), cb),
        (res: AddrsResponse) => res.toObject(),
      ),

    defaultStorageConfig: () =>
      promise(
        (cb) => client.defaultStorageConfig(new DefaultStorageConfigRequest(), getMeta(), cb),
        (res: DefaultStorageConfigResponse) => res.toObject(),
      ),

    newAddr: (name: string, type?: "bls" | "secp256k1", makeDefault?: boolean) => {
      const req = new NewAddrRequest()
      req.setName(name)
      req.setAddressType(type || "bls")
      req.setMakeDefault(makeDefault || false)
      return promise(
        (cb) => client.newAddr(req, getMeta(), cb),
        (res: NewAddrResponse) => res.toObject(),
      )
    },

    getStorageConfig: (cid: string) => {
      const req = new GetStorageConfigRequest()
      req.setCid(cid)
      return promise(
        (cb) => client.getStorageConfig(req, getMeta(), cb),
        (res: GetStorageConfigResponse) => res.toObject(),
      )
    },

    setDefaultStorageConfig: (config: StorageConfig.AsObject) => {
      const c = new StorageConfig()
      c.setRepairable(config.repairable)
      if (config.hot) {
        c.setHot(hotObjToMessage(config.hot))
      }
      if (config.cold) {
        c.setCold(coldObjToMessage(config.cold))
      }
      const req = new SetDefaultStorageConfigRequest()
      req.setConfig(c)
      return promise(
        (cb) => client.setDefaultStorageConfig(req, getMeta(), cb),
        () => {
          // nothing to return
        },
      )
    },

    show: (cid: string) => {
      const req = new ShowRequest()
      req.setCid(cid)
      return promise(
        (cb) => client.show(req, getMeta(), cb),
        (res: ShowResponse) => res.toObject(),
      )
    },

    info: () =>
      promise(
        (cb) => client.info(new InfoRequest(), getMeta(), cb),
        (res: InfoResponse) => res.toObject(),
      ),

    getStorageJob: (jobId: string) => {
      const req = new GetStorageJobRequest()
      req.setJid(jobId)
      return promise(
        (cb) => client.getStorageJob(req, getMeta(), cb),
        (res: GetStorageJobResponse) => res.toObject(),
      )
    },

    watchJobs: (handler: (event: Job.AsObject) => void, ...jobs: string[]) => {
      const req = new WatchJobsRequest()
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

    cancelJob: (jobId: string) => {
      const req = new CancelJobRequest()
      req.setJid(jobId)
      return promise(
        (cb) => client.cancelJob(req, getMeta(), cb),
        () => {
          // nothing to return
        },
      )
    },

    watchLogs: (
      handler: (event: LogEntry.AsObject) => void,
      cid: string,
      opts: WatchLogsOptions = {},
    ) => {
      const req = new WatchLogsRequest()
      req.setCid(cid)
      if (opts.includeHistory) {
        req.setHistory(opts.includeHistory)
      }
      if (opts.jobId) {
        req.setJid(opts.jobId)
      }
      const stream = client.watchLogs(req, getMeta())
      stream.on("data", (res) => {
        const logEntry = res.getLogEntry()?.toObject()
        if (logEntry) {
          handler(logEntry)
        }
      })
      return stream.cancel
    },

    replace: (cid1: string, cid2: string) => {
      const req = new ReplaceRequest()
      req.setCid1(cid1)
      req.setCid2(cid2)
      return promise(
        (cb) => client.replace(req, getMeta(), cb),
        (res: ReplaceResponse) => res.toObject(),
      )
    },

    pushStorageConfig: (cid: string, opts: PushStorageConfigOptions = {}) => {
      const req = new PushStorageConfigRequest()
      req.setCid(cid)
      if (opts.override) {
        req.setOverrideConfig(opts.override)
        req.setHasOverrideConfig(true)
      }
      if (opts.storageConfig) {
        const c = new StorageConfig()
        c.setRepairable(opts.storageConfig.repairable)
        if (opts.storageConfig.hot) {
          c.setHot(hotObjToMessage(opts.storageConfig.hot))
        }
        if (opts.storageConfig.cold) {
          c.setCold(coldObjToMessage(opts.storageConfig.cold))
        }
        req.setConfig(c)
        req.setHasConfig(true)
      }
      return promise(
        (cb) => client.pushStorageConfig(req, getMeta(), cb),
        (res: PushStorageConfigResponse) => res.toObject(),
      )
    },

    remove: (cid: string) => {
      const req = new RemoveRequest()
      req.setCid(cid)
      return promise(
        (cb) => client.remove(req, getMeta(), cb),
        () => {
          // nothing to return
        },
      )
    },

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

    getFolder: async (cid: string, output: string, opts: GetFolderOptions = {}) => {
      const headers = getHeaders()
      const options: Record<string, unknown> = { headers }
      if (opts.timeout) {
        options["timeout"] = opts.timeout
      }
      for await (const file of ipfs.get(cid, options)) {
        const noCidPath = file.path.replace(cid, "")
        const fullFilePath = path.join(output, noCidPath)
        if (file.content) {
          await fs.promises.mkdir(path.join(output, path.dirname(file.path)), { recursive: true })
          const stream = fs.createWriteStream(fullFilePath)
          for await (const chunk of file.content) {
            const slice = chunk.slice()
            await new Promise((resolve, reject) => {
              stream.write(slice, (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve()
                }
              })
            })
          }
        } else {
          // this is a dir
          await fs.promises.mkdir(fullFilePath, { recursive: true })
        }
      }
    },

    sendFil: (from: string, to: string, amount: number) => {
      const req = new SendFilRequest()
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stage: async (input: any) => {
      // Only process the first  input if there are more than one
      const source: File | undefined = (await normaliseInput(input).next()).value
      return new Promise<StageResponse.AsObject>(async (resolve, reject) => {
        const client = grpc.client(RPCService.Stage, config)
        client.onMessage((message) => {
          resolve(message.toObject() as StageResponse.AsObject)
        })
        client.onEnd((code, msg) => {
          if (code !== grpc.Code.OK) {
            reject(`error code ${code} - ${msg}`)
          } else {
            reject("ended with no message")
          }
        })
        if (source?.content) {
          client.start(getMeta())
          const process = await block({ size: 32000, noPad: true })
          for await (const chunk of process(source.content)) {
            const buf = chunk.slice()
            const req = new StageRequest()
            req.setChunk(buf as Buffer)
            client.send(req)
          }
          client.finishSend()
        } else {
          reject(new Error("no content to stage"))
        }
      })
    },

    stageFolder: async (path: string) => {
      const src = ipfsClient.globSource(path, { recursive: true })
      const headers = getHeaders()
      const res = await ipfs.add(src, { headers })
      return res.cid.string
    },

    listPayChannels: () =>
      promise(
        (cb) => client.listPayChannels(new ListPayChannelsRequest(), getMeta(), cb),
        (res: ListPayChannelsResponse) => res.toObject(),
      ),

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

    redeemPayChannel: (payChannelAddr: string) => {
      const req = new RedeemPayChannelRequest()
      req.setPayChannelAddr(payChannelAddr)
      return promise(
        (cb) => client.redeemPayChannel(req, getMeta(), cb),
        () => {
          // nothing to return
        },
      )
    },

    listStorageDealRecords: (opts: ListDealRecordsOptions = {}) => {
      const req = new ListStorageDealRecordsRequest()
      req.setConfig(listDealRecordsOptionsToConfig(opts))
      return promise(
        (cb) => client.listStorageDealRecords(req, getMeta(), cb),
        (res: ListStorageDealRecordsResponse) => res.toObject(),
      )
    },

    listRetrievalDealRecords: (opts: ListDealRecordsOptions = {}) => {
      const req = new ListRetrievalDealRecordsRequest()
      req.setConfig(listDealRecordsOptionsToConfig(opts))
      return promise(
        (cb) => client.listRetrievalDealRecords(req, getMeta(), cb),
        (res: ListRetrievalDealRecordsResponse) => res.toObject(),
      )
    },

    showAll: () =>
      promise(
        (cb) => client.showAll(new ShowAllRequest(), getMeta(), cb),
        (res: ShowAllResponse) => res.toObject(),
      ),
  }
}

function listDealRecordsOptionsToConfig(opts: ListDealRecordsOptions) {
  const conf = new ListDealRecordsConfig()
  if (opts.ascending) {
    conf.setAscending(opts.ascending)
  }
  if (opts.dataCids) {
    conf.setDataCidsList(opts.dataCids)
  }
  if (opts.fromAddresses) {
    conf.setFromAddrsList(opts.fromAddresses)
  }
  if (opts.includeFinal) {
    conf.setIncludeFinal(opts.includeFinal)
  }
  if (opts.includePending) {
    conf.setIncludePending(opts.includePending)
  }
  return conf
}
