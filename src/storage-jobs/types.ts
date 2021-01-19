/**
 * Specifies which StorageJobs to list.
 */
export enum ListSelect {
  /**
   * Lists all StorageJobs and is the default.
   */
  All,
  /**
   * Lists queued StorageJobs.
   */
  Queued,
  /**
   * Lists executing StorageJobs.
   */
  Executing,
  /**
   * Lists final StorageJobs.
   */
  Final,
}

/**
 * Controls the behavior for listing StorageJobs.
 */
export interface ListOptions {
  /**
   * Filters StorageJobs list to the specified cid. Defaults to no filter.
   */
  cidFilter?: string
  /**
   * Limits the number of StorageJobs returned. Defaults to no limit.
   */
  limit?: number
  /**
   * Returns the StorageJobs ascending by time. Defaults to false, descending.
   */
  ascending?: boolean
  /**
   * Specifies to return StorageJobs in the specified state.
   */
  select?: ListSelect
  /**
   * Sets the slug from which to start building the next page of results.
   */
  nextPageToken?: string
}
