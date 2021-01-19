import { grpc } from "@improbable-eng/grpc-web"
import {
  CancelStorageJobRequest,
  CancelStorageJobResponse,
  ListStorageJobsRequest,
  ListStorageJobsResponse,
  StorageConfigForJobRequest,
  StorageConfigForJobResponse,
  StorageJob,
  StorageJobRequest,
  StorageJobResponse,
  StorageJobsSelector,
  StorageJobsSummaryRequest,
  StorageJobsSummaryResponse,
  WatchStorageJobsRequest,
} from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb"
import { UserServiceClient } from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb_service"
import { Config } from "../types"
import { promise } from "../util"
import { ListOptions, ListSelect } from "./types"

export { ListOptions, ListSelect }

export interface StorageJobs {
  /**
   * Get the current state of a storage job.
   * @param jobId The job id to query.
   * @returns The current state of the storage job.
   */
  get: (jobId: string) => Promise<StorageJobResponse.AsObject>

  /**
   * Get the storage config associated with the specified storage job id.
   * @param jobId The cid of the desired storage config.
   * @returns The storage config associated with the provided job id.
   */
  storageConfig: (jobId: string) => Promise<StorageConfigForJobResponse.AsObject>

  /**
   * Lists StorageJobs according to the provided ListOptions.
   * @param opts Optional ListOptions to control the behavior of listing jobs.
   * @returns An object containing a list of storage jobs.
   */
  list: (opts?: ListOptions) => Promise<ListStorageJobsResponse.AsObject>

  /**
   * Get a summary of jobs in the user for the specified cids or all cids.
   * @param cid An optional cid to get a job summary for, providing no cid means all cids.
   * @returns An object containing a summary of jobs.
   */
  summary: (cid?: string) => Promise<StorageJobsSummaryResponse.AsObject>

  /**
   * Listen for job updates for the provided job ids.
   * @param handler The callback to receive job updates.
   * @param jobs A list of job ids to watch.
   * @returns A function that can be used to cancel watching.
   */
  watch: (handler: (event: StorageJob.AsObject) => void, ...jobs: string[]) => () => void

  /**
   * Cancel a job.
   * @param jobId The id of the job to cancel.
   */
  cancel: (jobId: string) => Promise<CancelStorageJobResponse.AsObject>
}

/**
 * @ignore
 */
export const createStorageJobs = (config: Config, getMeta: () => grpc.Metadata): StorageJobs => {
  const client = new UserServiceClient(config.host, config)
  return {
    get: (jobId: string) => {
      const req = new StorageJobRequest()
      req.setJobId(jobId)
      return promise(
        (cb) => client.storageJob(req, getMeta(), cb),
        (res: StorageJobResponse) => res.toObject(),
      )
    },

    storageConfig: (jobId: string) => {
      const req = new StorageConfigForJobRequest()
      req.setJobId(jobId)
      return promise(
        (cb) => client.storageConfigForJob(req, getMeta(), cb),
        (res: StorageConfigForJobResponse) => res.toObject(),
      )
    },

    list: (opts?: ListOptions) => {
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
      return promise(
        (cb) => client.listStorageJobs(req, getMeta(), cb),
        (res: ListStorageJobsResponse) => res.toObject(),
      )
    },

    summary: (cid?: string) => {
      const req = new StorageJobsSummaryRequest()
      if (cid) {
        req.setCid(cid)
      }
      return promise(
        (cb) => client.storageJobsSummary(req, getMeta(), cb),
        (res: StorageJobsSummaryResponse) => res.toObject(),
      )
    },

    watch: (handler: (event: StorageJob.AsObject) => void, ...jobs: string[]) => {
      const req = new WatchStorageJobsRequest()
      req.setJobIdsList(jobs)
      const stream = client.watchStorageJobs(req, getMeta())
      stream.on("data", (res) => {
        const job = res.getStorageJob()?.toObject()
        if (job) {
          handler(job)
        }
      })
      return stream.cancel
    },

    cancel: (jobId: string) => {
      const req = new CancelStorageJobRequest()
      req.setJobId(jobId)
      return promise(
        (cb) => client.cancelStorageJob(req, getMeta(), cb),
        (res: CancelStorageJobResponse) => res.toObject(),
      )
    },
  }
}
