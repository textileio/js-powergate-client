import { grpc } from "@improbable-eng/grpc-web"
import {
  ListStorageJobsRequest,
  ListStorageJobsResponse,
  StorageJobsSummaryRequest,
  StorageJobsSummaryResponse,
} from "@textile/grpc-powergate-client/dist/powergate/admin/v1/admin_pb"
import { AdminServiceClient } from "@textile/grpc-powergate-client/dist/powergate/admin/v1/admin_pb_service"
import { StorageJobsSelector } from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb"
import { ListSelect } from "../../storage-jobs"
import { Config } from "../../types"
import { promise } from "../../util"
import { AdminListOptions } from "./types"

export { AdminListOptions }

export interface AdminStorageJobs {
  /**
   * Lists StorageJobs according to the provided ListOptions.
   * @param opts Optional ListOptions to control the behavior of listing jobs.
   * @returns An object containing a list of storage jobs.
   */
  list: (opts?: AdminListOptions) => Promise<ListStorageJobsResponse.AsObject>

  /**
   * Get a summary of all jobs.
   * @param userId The user id to query or undefined for all users.
   * @param cids An optional cid to fileter the results with.
   * @returns A summary of all jobs.
   */
  summary: (userId?: string, cid?: string) => Promise<StorageJobsSummaryResponse.AsObject>
}

/**
 * @ignore
 */
export const createStorageJobs = (
  config: Config,
  getMeta: () => grpc.Metadata,
): AdminStorageJobs => {
  const client = new AdminServiceClient(config.host, config)
  return {
    list: (opts?: AdminListOptions) => {
      const req = new ListStorageJobsRequest()
      if (opts?.ascending) {
        req.setAscending(opts.ascending)
      }
      if (opts?.cidFilter) {
        req.setCidFilter(opts.cidFilter)
      }
      if (opts?.limit) {
        req.setLimit(opts.limit)
      }
      if (opts?.nextPageToken) {
        req.setNextPageToken(opts.nextPageToken)
      }
      if (opts?.select != undefined) {
        switch (opts.select) {
          case ListSelect.All:
            req.setSelector(StorageJobsSelector.STORAGE_JOBS_SELECTOR_ALL)
            break
          case ListSelect.Queued:
            req.setSelector(StorageJobsSelector.STORAGE_JOBS_SELECTOR_QUEUED)
            break
          case ListSelect.Executing:
            req.setSelector(StorageJobsSelector.STORAGE_JOBS_SELECTOR_EXECUTING)
            break
          case ListSelect.Final:
            req.setSelector(StorageJobsSelector.STORAGE_JOBS_SELECTOR_FINAL)
            break
        }
      }
      if (opts?.userId) {
        req.setUserIdFilter(opts.userId)
      }
      return promise(
        (cb) => client.listStorageJobs(req, getMeta(), cb),
        (resp: ListStorageJobsResponse) => resp.toObject(),
      )
    },

    summary: (userId?: string, cid?: string) => {
      const req = new StorageJobsSummaryRequest()
      if (userId) {
        req.setUserId(userId)
      }
      if (cid) {
        req.setCid(cid)
      }
      return promise(
        (cb) => client.storageJobsSummary(req, getMeta(), cb),
        (resp: StorageJobsSummaryResponse) => resp.toObject(),
      )
    },
  }
}
