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
     * Stores data according to the provided deal parameters
     * @returns Information about the storage deals
     */
    store: (
      addr: string,
      data: Uint8Array,
      dealConfigs: dealsTypes.DealConfig.AsObject[],
      minDuration: number,
    ) => {
      // TODO: figure out how to stream data in here, or at least stream to the server
      return new Promise<dealsTypes.StoreResponse.AsObject>((resolve, reject) => {
        const client = grpc.client(RPCService.Store, config)
        client.onMessage((message) => {
          resolve(message.toObject() as dealsTypes.StoreResponse.AsObject)
        })
        client.onEnd((code, msg) => {
          if (code !== grpc.Code.OK) {
            reject(`error code ${code} - ${msg}`)
          } else {
            reject("ended with no message")
          }
        })
        client.start()

        const dealConfigMsgs = dealConfigs.map((val) => dealConfigObjToMessage(val))
        const params = new dealsTypes.StoreParams()
        params.setAddress(addr)
        params.setDealConfigsList(dealConfigMsgs)
        params.setMinDuration(minDuration)
        const req0 = new dealsTypes.StoreRequest()
        req0.setStoreParams(params)
        client.send(req0)

        const req1 = new dealsTypes.StoreRequest()
        req1.setChunk(data)
        client.send(req1)

        client.finishSend()
      })
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
     * Retrieve data stored in Filecoin
     * @param address The wallet address to fund the retrieval
     * @param cid The cid of the data to retrieve
     * @returns The raw data
     */
    retrieve: (address: string, cid: string) => {
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
