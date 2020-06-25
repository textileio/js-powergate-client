import { createFFS } from "./ffs"
import { createHealth } from "./health"
import { createMiners } from "./miners"
import { createNet } from "./net"
import { ffsOptions } from "./options"
import { Config, ffsTypes, healthTypes, minersTypes, netTypes } from "./types"
import { getTransport, host, useToken } from "./util"

export { Config, ffsTypes, healthTypes, minersTypes, netTypes, ffsOptions }

const defaultConfig: Config = {
  host,
  transport: getTransport(),
}

/**
 * Creates a new Powergate client
 * @param config A config object that changes the behavior of the client
 * @returns A Powergate client API
 */
export const createPow = (config?: Partial<Config>) => {
  const c = { ...defaultConfig, ...removeEmpty(config) }

  const { getMeta, setToken } = useToken(c.authToken)

  return {
    /**
     * Set the active auth token
     * @param t The token to set
     */
    setToken,

    /**
     * The Health API
     */
    health: createHealth(c),

    /**
     * The Net API
     */
    net: createNet(c),

    /**
     * The FFS API
     */
    ffs: createFFS(c, getMeta),

    /**
     * The Miners API
     */
    miners: createMiners(c),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const removeEmpty = (obj: any) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === "object") removeEmpty(obj[key])
    else if (obj[key] === undefined) delete obj[key]
  })
  return obj
}
