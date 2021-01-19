import { grpc } from "@improbable-eng/grpc-web"
import {
  ApplyStorageConfigRequest,
  ApplyStorageConfigResponse,
  DefaultStorageConfigRequest,
  DefaultStorageConfigResponse,
  RemoveRequest,
  RemoveResponse,
  SetDefaultStorageConfigRequest,
  SetDefaultStorageConfigResponse,
  StorageConfig as SConfig,
} from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb"
import { UserServiceClient } from "@textile/grpc-powergate-client/dist/powergate/user/v1/user_pb_service"
import { Config } from "../types"
import { promise } from "../util"
import { ApplyOptions } from "./types"
import { coldObjToMessage, hotObjToMessage } from "./util"

export { ApplyOptions }
export interface StorageConfig {
  /**
   * Get the default storage config associated with the current user.
   * @returns The default storage config.
   */
  default: () => Promise<DefaultStorageConfigResponse.AsObject>

  /**
   * Set the default storage config for this user.
   * @param config The new default storage config.
   */
  setDefault: (config: SConfig.AsObject) => Promise<SetDefaultStorageConfigResponse.AsObject>

  /**
   * Apply a storage config or the default to the specified cid.
   * @param cid The cid to store.
   * @param opts Options controlling the behavior storage config execution.
   * @returns An object containing the job id of the job executing the storage configuration.
   */
  apply: (cid: string, opts?: ApplyOptions) => Promise<ApplyStorageConfigResponse.AsObject>

  /**
   * Remove a cid from the user storage.
   * @param cid The cid to remove.
   */
  remove: (cid: string) => Promise<RemoveResponse.AsObject>
}

export const createStorageConfig = (
  config: Config,
  getMeta: () => grpc.Metadata,
): StorageConfig => {
  const client = new UserServiceClient(config.host, config)
  return {
    default: () =>
      promise(
        (cb) => client.defaultStorageConfig(new DefaultStorageConfigRequest(), getMeta(), cb),
        (res: DefaultStorageConfigResponse) => res.toObject(),
      ),

    setDefault: (config: SConfig.AsObject) => {
      const c = new SConfig()
      c.setRepairable(config.repairable)
      if (config.hot) {
        c.setHot(hotObjToMessage(config.hot))
      }
      if (config.cold) {
        c.setCold(coldObjToMessage(config.cold))
      }
      const req = new SetDefaultStorageConfigRequest()
      req.setConfig(c)
      return promise(
        (cb) => client.setDefaultStorageConfig(req, getMeta(), cb),
        (res: SetDefaultStorageConfigResponse) => res.toObject(),
      )
    },

    apply: (cid: string, opts?: ApplyOptions) => {
      const req = new ApplyStorageConfigRequest()
      req.setCid(cid)
      if (opts?.override) {
        req.setOverrideConfig(opts.override)
        req.setHasOverrideConfig(true)
      }
      if (opts?.storageConfig) {
        const c = new SConfig()
        c.setRepairable(opts.storageConfig.repairable)
        if (opts.storageConfig.hot) {
          c.setHot(hotObjToMessage(opts.storageConfig.hot))
        }
        if (opts.storageConfig.cold) {
          c.setCold(coldObjToMessage(opts.storageConfig.cold))
        }
        req.setConfig(c)
        req.setHasConfig(true)
      }
      if (opts?.importDealIds) {
        req.setImportDealIdsList(opts.importDealIds)
      }
      if (opts?.noExec) {
        req.setNoExec(opts.noExec)
      }
      return promise(
        (cb) => client.applyStorageConfig(req, getMeta(), cb),
        (res: ApplyStorageConfigResponse) => res.toObject(),
      )
    },

    remove: (cid: string) => {
      const req = new RemoveRequest()
      req.setCid(cid)
      return promise(
        (cb) => client.remove(req, getMeta(), cb),
        (res: RemoveResponse) => res.toObject(),
      )
    },
  }
}
