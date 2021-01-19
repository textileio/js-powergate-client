import { grpc } from "@improbable-eng/grpc-web"
import {
  CidInfoRequest,
  CidInfoResponse,
  CidSummaryRequest,
  CidSummaryResponse,
  GetRequest,
  LogEntry,
  ReplaceDataRequest,
  ReplaceDataResponse,
  StageRequest,
  StageResponse,
  WatchLogsRequest,
} from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb"
import {
  UserService,
  UserServiceClient,
} from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb_service"
import fs from "fs"
import ipfsClient from "ipfs-http-client"
import block from "it-block"
import path from "path"
import { File, normaliseInput } from "../normalize"
import { Config } from "../types"
import { promise } from "../util"
import { GetFolderOptions, WatchLogsOptions } from "./types"

export { GetFolderOptions, WatchLogsOptions }

export interface Data {
  /**
   * A helper method to stage data in IPFS in preparation for storing using storageConfig.apply.
   * This doesn't actually store data in Powergate, you'll want to call storageConfig.apply for that.
   * @param input The raw data to add.
   * @returns The cid of the added data.
   */
  stage: (input: Uint8Array) => Promise<StageResponse.AsObject>

  /**
   * A helper method to stage a folder recursively in IPFS in preparation for storing using storageConfig.apply.
   * This doesn't actually store data in Powergate, you'll want to call storageConfig.apply for that.
   * @param path The path to the folder to add.
   * @returns The cid of the added folder.
   */
  stageFolder: (path: string) => Promise<string>

  /**
   * Applies a StorageConfig for cid2 equal to that of cid1, and removes cid1. This operation
   * is more efficient than manually removing and adding in two separate operations.
   * @param cid1 The cid to replace.
   * @param cid2 The new cid.
   * @returns The job id of the job executing the storage configuration.
   */
  replaceData: (cid1: string, cid2: string) => Promise<ReplaceDataResponse.AsObject>

  /**
   * Retrieve data stored by the current user.
   * @param cid The cid of the data to retrieve.
   * @returns The raw data.
   */
  get: (cid: string) => Promise<Uint8Array>

  /**
   * Retrieve a folder stored stored by the current user.
   * @param cid The root cid of the folder to retrieve.
   * @param outputPath The location to write the folder to
   * @param opts Options controlling the behavior of retrieving the folder
   */
  getFolder: (cid: string, output: string, opts?: GetFolderOptions) => Promise<void>

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
   * Get high level information about the current state of cids in Powergate.
   * @param cids A list of cids to filter the results by.
   * @returns An object containing a list of cid summary info.
   */
  cidSummary: (...cids: string[]) => Promise<CidSummaryResponse.AsObject>

  /**
   * Get detailed information about the current state of a cid in Powergate.
   * @param cid The cid to get information for.
   * @returns An object with detailed information about the cid.
   */
  cidInfo: (cid: string) => Promise<CidInfoResponse.AsObject>
}

/**
 * @ignore
 */
export const createData = (
  config: Config,
  getMeta: () => grpc.Metadata,
  getHeaders: () => Record<string, string>,
): Data => {
  const client = new UserServiceClient(config.host, config)
  const ipfs = ipfsClient(config.host)
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stage: async (input: any) => {
      // Only process the first  input if there are more than one
      const source: File | undefined = (await normaliseInput(input).next()).value
      return new Promise<StageResponse.AsObject>(async (resolve, reject) => {
        const client = grpc.client(UserService.Stage, config)
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
            req.setChunk(buf)
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
            await new Promise<void>((resolve, reject) => {
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
        req.setJobId(opts.jobId)
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

    replaceData: (cid1: string, cid2: string) => {
      const req = new ReplaceDataRequest()
      req.setCid1(cid1)
      req.setCid2(cid2)
      return promise(
        (cb) => client.replaceData(req, getMeta(), cb),
        (res: ReplaceDataResponse) => res.toObject(),
      )
    },

    cidSummary: (...cids: string[]) => {
      const req = new CidSummaryRequest()
      req.setCidsList(cids)
      return promise(
        (cb) => client.cidSummary(req, getMeta(), cb),
        (res: CidSummaryResponse) => res.toObject(),
      )
    },

    cidInfo: (cid: string) => {
      const req = new CidInfoRequest()
      req.setCid(cid)
      return promise(
        (cb) => client.cidInfo(req, getMeta(), cb),
        (res: CidInfoResponse) => res.toObject(),
      )
    },
  }
}
