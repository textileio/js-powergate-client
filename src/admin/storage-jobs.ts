import { grpc } from "@improbable-eng/grpc-web"
import {
  ExecutingStorageJobsRequest,
  ExecutingStorageJobsResponse,
  LatestFinalStorageJobsRequest,
  LatestFinalStorageJobsResponse,
  LatestSuccessfulStorageJobsRequest,
  LatestSuccessfulStorageJobsResponse,
  QueuedStorageJobsRequest,
  QueuedStorageJobsResponse,
  StorageJobsSummaryRequest,
  StorageJobsSummaryResponse,
} from "@textile/grpc-powergate-client/dist/proto/admin/v1/powergate_admin_pb"
import { PowergateAdminServiceClient } from "@textile/grpc-powergate-client/dist/proto/admin/v1/powergate_admin_pb_service"
import { Config } from "../types"
import { promise } from "../util"

export interface StorageJobs {
  /**
   * List queued storgae jobs.
   * @param profileId The storage profile id to query or an empty string for all storage profiles.
   * @param cids An optional list of data cids to fileter the results with.
   * @returns A list of queued storage jobs.
   */
  queued: (profileId: string, ...cids: string[]) => Promise<QueuedStorageJobsResponse.AsObject>

  /**
   * List executing storgae jobs.
   * @param profileId The storage profile id to query or an empty string for all storage profiles.
   * @param cids An optional list of data cids to fileter the results with.
   * @returns A list of executing storage jobs.
   */
  executing: (
    profileId: string,
    ...cids: string[]
  ) => Promise<ExecutingStorageJobsResponse.AsObject>

  /**
   * List the latest final storgae jobs.
   * @param profileId The storage profile id to query or an empty string for all storage profiles.
   * @param cids An optional list of data cids to fileter the results with.
   * @returns A list of the latest final storage jobs.
   */
  latestFinal: (
    profileId: string,
    ...cids: string[]
  ) => Promise<LatestFinalStorageJobsResponse.AsObject>

  /**
   * List the latest successful storgae jobs.
   * @param profileId The storage profile id to query or an empty string for all storage profiles.
   * @param cids An optional list of data cids to fileter the results with.
   * @returns A list of the latest successful storage jobs.
   */
  latestSuccessful: (
    profileId: string,
    ...cids: string[]
  ) => Promise<LatestSuccessfulStorageJobsResponse.AsObject>

  /**
   * Get a summary of all jobs.
   * @param profileId The storage profile id to query or an empty string for all storage profiles.
   * @param cids An optional list of data cids to fileter the results with.
   * @returns A summary of all jobs.
   */
  summary: (profileId: string, ...cids: string[]) => Promise<StorageJobsSummaryResponse.AsObject>
}

/**
 * @ignore
 */
export const createStorageJobs = (config: Config, getMeta: () => grpc.Metadata): StorageJobs => {
  const client = new PowergateAdminServiceClient(config.host, config)
  return {
    queued: (profileId: string, ...cids: string[]) => {
      const req = new QueuedStorageJobsRequest()
      req.setCidsList(cids)
      req.setProfileId(profileId)
      return promise(
        (cb) => client.queuedStorageJobs(req, getMeta(), cb),
        (resp: QueuedStorageJobsResponse) => resp.toObject(),
      )
    },

    executing: (profileId: string, ...cids: string[]) => {
      const req = new ExecutingStorageJobsRequest()
      req.setCidsList(cids)
      req.setProfileId(profileId)
      return promise(
        (cb) => client.executingStorageJobs(req, getMeta(), cb),
        (resp: ExecutingStorageJobsResponse) => resp.toObject(),
      )
    },

    latestFinal: (profileId: string, ...cids: string[]) => {
      const req = new LatestFinalStorageJobsRequest()
      req.setCidsList(cids)
      req.setProfileId(profileId)
      return promise(
        (cb) => client.latestFinalStorageJobs(req, getMeta(), cb),
        (resp: LatestFinalStorageJobsResponse) => resp.toObject(),
      )
    },

    latestSuccessful: (profileId: string, ...cids: string[]) => {
      const req = new LatestSuccessfulStorageJobsRequest()
      req.setCidsList(cids)
      req.setProfileId(profileId)
      return promise(
        (cb) => client.latestSuccessfulStorageJobs(req, getMeta(), cb),
        (resp: LatestSuccessfulStorageJobsResponse) => resp.toObject(),
      )
    },

    summary: (profileId: string, ...cids: string[]) => {
      const req = new StorageJobsSummaryRequest()
      req.setCidsList(cids)
      req.setProfileId(profileId)
      return promise(
        (cb) => client.storageJobsSummary(req, getMeta(), cb),
        (resp: StorageJobsSummaryResponse) => resp.toObject(),
      )
    },
  }
}