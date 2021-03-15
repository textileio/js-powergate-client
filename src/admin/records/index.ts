import { grpc } from "@improbable-eng/grpc-web"
import {
  GetUpdatedRetrievalRecordsSinceRequest,
  GetUpdatedRetrievalRecordsSinceResponse,
  GetUpdatedStorageDealRecordsSinceRequest,
  GetUpdatedStorageDealRecordsSinceResponse,
} from "@textile/grpc-powergate-client/dist/powergate/admin/v1/admin_pb"
import { AdminServiceClient } from "@textile/grpc-powergate-client/dist/powergate/admin/v1/admin_pb_service"
import { Timestamp } from "google-protobuf/google/protobuf/timestamp_pb"
import { Config } from "../../types"
import { promise } from "../../util"

export interface AdminRecords {
  /**
   * Get the retrieval records that were created or modified since the specified date.
   * @returns An object containing a list of retrieval records.
   */
  getUpdatedRetrievalRecordsSince: (
    time: Date,
    limit: number,
  ) => Promise<GetUpdatedRetrievalRecordsSinceResponse.AsObject>

  /**
   * Get the storage-deal records that were created or modified since the specified date.
   * @returns An object containing a list of storage-deal records.
   */
  getUpdatedStorageDealRecordsSince: (
    time: Date,
    limit: number,
  ) => Promise<GetUpdatedStorageDealRecordsSinceResponse.AsObject>
}

/**
 * @ignore
 */
export const createRecords = (config: Config, getMeta: () => grpc.Metadata): AdminRecords => {
  const client = new AdminServiceClient(config.host, config)
  return {
    getUpdatedRetrievalRecordsSince: (time: Date, limit: number) => {
      const req = new GetUpdatedRetrievalRecordsSinceRequest()
      const since = new Timestamp()
      since.fromDate(time)
      req.setSince(since)
      req.setLimit(limit)
      return promise(
        (cb) => client.getUpdatedRetrievalRecordsSince(req, getMeta(), cb),
        (resp: GetUpdatedRetrievalRecordsSinceResponse) => resp.toObject(),
      )
    },

    getUpdatedStorageDealRecordsSince: (time: Date, limit: number) => {
      const req = new GetUpdatedStorageDealRecordsSinceRequest()
      const since = new Timestamp()
      since.fromDate(time)
      req.setSince(since)
      req.setLimit(limit)
      return promise(
        (cb) => client.getUpdatedStorageDealRecordsSince(req, getMeta(), cb),
        (resp: GetUpdatedStorageDealRecordsSinceResponse) => resp.toObject(),
      )
    },
  }
}
