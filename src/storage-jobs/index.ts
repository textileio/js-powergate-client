import { grpc } from "@improbable-eng/grpc-web"
import {
  CancelStorageJobRequest,
  CancelStorageJobResponse,
  ExecutingStorageJobsRequest,
  ExecutingStorageJobsResponse,
  LatestFinalStorageJobsRequest,
  LatestFinalStorageJobsResponse,
  LatestSuccessfulStorageJobsRequest,
  LatestSuccessfulStorageJobsResponse,
  QueuedStorageJobsRequest,
  QueuedStorageJobsResponse,
  StorageConfigForJobRequest,
  StorageConfigForJobResponse,
  StorageJob,
  StorageJobRequest,
  StorageJobResponse,
  StorageJobsSummaryRequest,
  StorageJobsSummaryResponse,
  WatchStorageJobsRequest,
} from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb"
import { UserServiceClient } from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb_service"
import { Config } from "../types"
import { promise } from "../util"

export interface StorageJobs {
  /**
   * Get the current state of a storage job.
   * @param jobId The job id to query.
   * @returns The current state of the storage job.
   */
  storageJob: (jobId: string) => Promise<StorageJobResponse.AsObject>

  /**
   * Get the desired storage config for the provided cid, this config may not yet be realized.
   * @param cid The cid of the desired storage config.
   * @returns The storage config for the provided cid.
   */
  storageConfigForJob: (jobId: string) => Promise<StorageConfigForJobResponse.AsObject>

  /**
   * Get queued jobs in the user for the specified cids or all cids.
   * @param cids A list of cids to get jobs for, providing no cids means all cids.
   * @returns An object containing a list of jobs.
   */
  queued: (...cids: string[]) => Promise<QueuedStorageJobsResponse.AsObject>

  /**
   * Get executing jobs in the user for the specified cids or all cids.
   * @param cids A list of cids to get jobs for, providing no cids means all cids.
   * @returns An object containing a list of jobs.
   */
  executing: (...cids: string[]) => Promise<ExecutingStorageJobsResponse.AsObject>

  /**
   * Get the latest final jobs in the user for the specified cids or all cids.
   * @param cids A list of cids to get jobs for, providing no cids means all cids.
   * @returns An object containing a list of jobs.
   */
  latestFinal: (...cids: string[]) => Promise<LatestFinalStorageJobsResponse.AsObject>

  /**
   * Get latest successful jobs in the user for the specified cids or all cids.
   * @param cids A list of cids to get jobs for, providing no cids means all cids.
   * @returns An object containing a list of jobs.
   */
  latestSuccessful: (...cids: string[]) => Promise<LatestSuccessfulStorageJobsResponse.AsObject>

  /**
   * Get a summary of jobs in the user for the specified cids or all cids.
   * @param cids A list of cids to get a job summary for, providing no cids means all cids.
   * @returns An object containing a summary of jobs.
   */
  summary: (...cids: string[]) => Promise<StorageJobsSummaryResponse.AsObject>

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
    storageJob: (jobId: string) => {
      const req = new StorageJobRequest()
      req.setJobId(jobId)
      return promise(
        (cb) => client.storageJob(req, getMeta(), cb),
        (res: StorageJobResponse) => res.toObject(),
      )
    },

    storageConfigForJob: (jobId: string) => {
      const req = new StorageConfigForJobRequest()
      req.setJobId(jobId)
      return promise(
        (cb) => client.storageConfigForJob(req, getMeta(), cb),
        (res: StorageConfigForJobResponse) => res.toObject(),
      )
    },

    queued: (...cids: string[]) => {
      const req = new QueuedStorageJobsRequest()
      req.setCidsList(cids)
      return promise(
        (cb) => client.queuedStorageJobs(req, getMeta(), cb),
        (res: QueuedStorageJobsResponse) => res.toObject(),
      )
    },

    executing: (...cids: string[]) => {
      const req = new ExecutingStorageJobsRequest()
      req.setCidsList(cids)
      return promise(
        (cb) => client.executingStorageJobs(req, getMeta(), cb),
        (res: ExecutingStorageJobsResponse) => res.toObject(),
      )
    },

    latestFinal: (...cids: string[]) => {
      const req = new LatestFinalStorageJobsRequest()
      req.setCidsList(cids)
      return promise(
        (cb) => client.latestFinalStorageJobs(req, getMeta(), cb),
        (res: LatestFinalStorageJobsResponse) => res.toObject(),
      )
    },

    latestSuccessful: (...cids: string[]) => {
      const req = new LatestSuccessfulStorageJobsRequest()
      req.setCidsList(cids)
      return promise(
        (cb) => client.latestSuccessfulStorageJobs(req, getMeta(), cb),
        (res: LatestSuccessfulStorageJobsResponse) => res.toObject(),
      )
    },

    summary: (...cids: string[]) => {
      const req = new StorageJobsSummaryRequest()
      req.setCidsList(cids)
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
