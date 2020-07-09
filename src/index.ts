import { createAsks } from "./asks"
import { createFaults } from "./faults"
import { createFFS } from "./ffs"
import { createHealth } from "./health"
import { createMiners } from "./miners"
import { createNet } from "./net"
import { dealsOptions, ffsOptions } from "./options"
import { createReputation } from "./reputation"
import {
  asksTypes,
  Config,
  dealsTypes,
  faultsTypes,
  ffsTypes,
  healthTypes,
  minersTypes,
  netTypes,
  reputationTypes,
} from "./types"
import { getTransport, host, useToken } from "./util"

export { dealsOptions, ffsOptions }
export {
  asksTypes,
  Config,
  dealsTypes,
  faultsTypes,
  ffsTypes,
  healthTypes,
  minersTypes,
  netTypes,
  reputationTypes,
}

const defaultConfig: Config = {
  host,
  transport: getTransport(),
}

/**
 * Creates a new Powergate client
 * @param config A config object that changes the behavior of the client
 * @returns A Powergate client API
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
     * The Asks API
     */
    asks: createAsks(c),

    /**
     * The Faults API
     */
    faults: createFaults(c),

    /**
     * The FFS API
     */
    ffs: createFFS(c, getMeta),

    /**
     * The Health API
     */
    health: createHealth(c),

    /**
     * The Miners API
     */
    miners: createMiners(c),

    /**
     * The Net API
     */
    net: createNet(c),

    /**
     * The Reputation API
     */
    reputation: createReputation(c),
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
