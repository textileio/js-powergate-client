/**
 * Object that allows you to configure the call to getFolder
 */
export type GetFolderOptions = {
  /**
   * Timeout for fetching data
   */
  timeout?: number
}

/**
 * Object control the behavior of watchLogs
 */
export type WatchLogsOptions = {
  /**
   * Control whether or not to include the history of log events
   */
  includeHistory?: boolean

  /**
   * Filter log events to only those associated with the provided job id
   */
  jobId?: string
}
