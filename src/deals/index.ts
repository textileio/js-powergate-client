import { grpc } from "@improbable-eng/grpc-web"
import {
  DealRecordsConfig,
  RetrievalDealRecordsRequest,
  RetrievalDealRecordsResponse,
  StorageDealRecordsRequest,
  StorageDealRecordsResponse,
} from "@textile/grpc-powergate-client/dist/proto/powergate/v1/powergate_pb"
import { PowergateServiceClient } from "@textile/grpc-powergate-client/dist/proto/powergate/v1/powergate_pb_service"
import { Config } from "../types"
import { promise } from "../util"
import { DealRecordsOptions } from "./types"

export { DealRecordsOptions }

export interface Deals {
  /**
   * List storage deal records for the Storage Profile according to the provided options.
   * @param opts Options that control the behavior of listing records.
   * @returns A list of storage deal records.
   */
  storageDealRecords: (opts?: DealRecordsOptions) => Promise<StorageDealRecordsResponse.AsObject>

  /**
   * List retrieval deal records for the Storage Profile according to the provided options.
   * @param opts Options that control the behavior of listing records.
   * @returns A list of retrieval deal records.
   */
  retrievalDealRecords: (
    opts?: DealRecordsOptions,
  ) => Promise<RetrievalDealRecordsResponse.AsObject>
}

/**
 * @ignore
 */
export const createDeals = (config: Config, getMeta: () => grpc.Metadata): Deals => {
  const client = new PowergateServiceClient(config.host, config)
  return {
    storageDealRecords: (opts: DealRecordsOptions = {}) => {
      const req = new StorageDealRecordsRequest()
      req.setConfig(listDealRecordsOptionsToConfig(opts))
      return promise(
        (cb) => client.storageDealRecords(req, getMeta(), cb),
        (res: StorageDealRecordsResponse) => res.toObject(),
      )
    },

    retrievalDealRecords: (opts: DealRecordsOptions = {}) => {
      const req = new RetrievalDealRecordsRequest()
      req.setConfig(listDealRecordsOptionsToConfig(opts))
      return promise(
        (cb) => client.retrievalDealRecords(req, getMeta(), cb),
        (res: RetrievalDealRecordsResponse) => res.toObject(),
      )
    },
  }
}

function listDealRecordsOptionsToConfig(opts: DealRecordsOptions) {
  const conf = new DealRecordsConfig()
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
