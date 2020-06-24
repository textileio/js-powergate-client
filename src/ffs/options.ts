import { ffs } from "../types"
import { coldObjToMessage, hotObjToMessage } from "./util"

export type PushConfigOption = (req: ffs.PushConfigRequest) => void

/**
 * Allows you to override an existing storage configuration
 * @param override Whether or not to override any existing storage configuration
 * @returns The resulting option
 */
export const withOverrideConfig = (override: boolean) => {
  const option: PushConfigOption = (req: ffs.PushConfigRequest) => {
    req.setHasOverrideConfig(true)
    req.setOverrideConfig(override)
  }
  return option
}

/**
 * Allows you to override the default storage config with a custom one
 * @param config The storage configuration to use
 * @returns The resulting option
 */
export const withConfig = (config: ffs.CidConfig.AsObject) => {
  const option: PushConfigOption = (req: ffs.PushConfigRequest) => {
    const c = new ffs.CidConfig()
    c.setCid(config.cid)
    c.setRepairable(config.repairable)
    if (config.hot) {
      c.setHot(hotObjToMessage(config.hot))
    }
    if (config.cold) {
      c.setCold(coldObjToMessage(config.cold))
    }
    req.setHasConfig(true)
    req.setConfig(c)
  }
  return option
}

export type WatchLogsOption = (res: ffs.WatchLogsRequest) => void

/**
 * Control whether or not to include the history of log events
 * @param includeHistory Whether or not to include the history of log events
 * @returns The resulting option
 */
export const withHistory = (includeHistory: boolean) => {
  const option: WatchLogsOption = (req: ffs.WatchLogsRequest) => {
    req.setHistory(includeHistory)
  }
  return option
}

/**
 * Filter log events to only those associated with the provided job id
 * @param jobId The job id to show events for
 * @returns The resulting option
 */
export const withJobId = (jobId: string) => {
  const option: WatchLogsOption = (req: ffs.WatchLogsRequest) => {
    req.setJid(jobId)
  }
  return option
}
