import { grpc } from "@improbable-eng/grpc-web"
import {
  RPCService,
  RPCServiceClient,
} from "@textile/grpc-powergate-client/dist/deals/rpc/rpc_pb_service"
import { Config, dealsTypes } from "../types"
import { promise } from "../util"
import { ListDealRecordsOption } from "./options"
import { dealConfigObjToMessage } from "./util"

/**
 * Creates the Deals API client
 * @param config A config object that changes the behavior of the client
 * @returns The Deals API client
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createDeals = (config: Config) => {
  const client = new RPCServiceClient(config.host, config)
  return {
    /**
     * Import raw data into the Filecoin client to prepare for storage
     * @param data The raw data to import
     * @param isCAR Specifies if the data is already CAR encoded, default false
     */
    import: (data: Uint8Array, isCAR: boolean = false) => {
      // TODO: figure out how to stream data in here, or at least stream to the server
      return new Promise<dealsTypes.ImportResponse.AsObject>((resolve, reject) => {
        const client = grpc.client(RPCService.Import, config)
        client.onMessage((message) => {
          resolve(message.toObject() as dealsTypes.ImportResponse.AsObject)
        })
        client.onEnd((code, msg) => {
          if (code !== grpc.Code.OK) {
            reject(`error code ${code} - ${msg}`)
          } else {
            reject("ended with no message")
          }
        })
        client.start()

        const params = new dealsTypes.ImportParams()
        params.setIsCar(isCAR)
        const req0 = new dealsTypes.ImportRequest()
        req0.setImportParams(params)
        client.send(req0)

        const req1 = new dealsTypes.ImportRequest()
        req1.setChunk(data)
        client.send(req1)

        client.finishSend()
      })
    },

    /**
     * Stores data according to the provided deal parameters
     * @param walletAddress The wallet address to fund the deals
     * @param dataCid The cid of the data to store
     * @param pieceSize The size of the data to store
     * @param dealConfigs The list of deals to execute
     * @param minDuration The amount of time to store the data in epochs
     * @returns A list of information about the storage deals
     */
    store: (
      walletAddress: string,
      dataCid: string,
      pieceSize: number,
      dealConfigs: dealsTypes.StorageDealConfig.AsObject[],
      minDuration: number,
    ) => {
      const req = new dealsTypes.StoreRequest()
      req.setAddress(walletAddress)
      req.setDataCid(dataCid)
      req.setPieceSize(pieceSize)
      req.setStorageDealConfigsList(dealConfigs.map((c) => dealConfigObjToMessage(c)))
      req.setMinDuration(minDuration)

      return promise(
        (cb) => client.store(req, cb),
        (res: dealsTypes.StoreResponse) => res.toObject().resultsList,
      )
    },

    /**
     * Fetches deal data to the underlying blockstore of the Filecoin client
     * @param walletAddress The address to fund the retrieval
     * @param setDataCid The cid of the data to fetch
     */
    fetch: (walletAddress: string, dataCid: string) => {
      const req = new dealsTypes.FetchRequest()
      req.setAddress(walletAddress)
      req.setCid(dataCid)
      return promise(
        (cb) => client.fetch(req, cb),
        () => {
          // nothing to return
        },
      )
    },

    /**
     * Retrieve data stored in Filecoin
     * @param address The wallet address to fund the retrieval
     * @param cid The cid of the data to retrieve
     * @param isCAR Indicates if the data is CAR encoded
     * @returns The raw data
     */
    retrieve: (address: string, cid: string, isCAR: boolean = false) => {
      return new Promise<Uint8Array>((resolve, reject) => {
        const append = (l: Uint8Array, r: Uint8Array) => {
          const tmp = new Uint8Array(l.byteLength + r.byteLength)
          tmp.set(l, 0)
          tmp.set(r, l.byteLength)
          return tmp
        }
        let final = new Uint8Array()
        const req = new dealsTypes.RetrieveRequest()
        req.setAddress(address)
        req.setCid(cid)
        req.setCarEncoding(isCAR)
        const stream = client.retrieve(req)
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
     * Returns the current status of the deal and a flag indicating if the miner of the deal was slashed
     * @param proposalCid The proposal cid of the deal to check
     * @returns An object containing the status of the deal and a flag indicating if the miner of the deal was slashed
     */
    getDealStatus: (proposalCid: string) => {
      const req = new dealsTypes.GetDealStatusRequest()
      req.setProposalCid(proposalCid)
      return promise(
        (cb) => client.getDealStatus(req, cb),
        (res: dealsTypes.GetDealStatusResponse) => res.toObject(),
      )
    },

    /**
     * Listen for deal proposal updates for the provided proposal ids
     * @param handler The callback to receive proposal updates
     * @param proposals A list of proposal ids to watch
     * @returns A function that can be used to cancel watching
     */
    watch: (
      handler: (event: dealsTypes.StorageDealInfo.AsObject) => void,
      ...proposals: string[]
    ) => {
      const req = new dealsTypes.WatchRequest()
      req.setProposalsList(proposals)
      const stream = client.watch(req)
      stream.on("data", (res) => {
        const dealInfo = res.getDealInfo()?.toObject()
        if (dealInfo) {
          handler(dealInfo)
        }
      })
      return stream.cancel
    },

    /**
     * List storage deal records according to the provided options
     * @param opts Options that control the behavior of listing records
     * @returns A list of storage deal records
     */
    listStorageDealRecords: (...opts: ListDealRecordsOption[]) => {
      const conf = new dealsTypes.ListDealRecordsConfig()
      opts.forEach((opt) => {
        opt(conf)
      })
      const req = new dealsTypes.ListStorageDealRecordsRequest()
      req.setConfig(conf)
      return promise(
        (cb) => client.listStorageDealRecords(req, cb),
        (res: dealsTypes.ListStorageDealRecordsResponse) => res.toObject().recordsList,
      )
    },

    /**
     * List retrieval deal records according to the provided options
     * @param opts Options that control the behavior of listing records
     * @returns A list of retrieval deal records
     */
    listRetrievalDealRecords: (...opts: ListDealRecordsOption[]) => {
      const conf = new dealsTypes.ListDealRecordsConfig()
      opts.forEach((opt) => {
        opt(conf)
      })
      const req = new dealsTypes.ListRetrievalDealRecordsRequest()
      req.setConfig(conf)
      return promise(
        (cb) => client.listRetrievalDealRecords(req, cb),
        (res: dealsTypes.ListRetrievalDealRecordsResponse) => res.toObject().recordsList,
      )
    },
  }
}
