import { Asks, createAsks } from "./asks"
import { createFaults, Faults } from "./faults"
import { createFFS, FFS } from "./ffs"
import { createHealth, Health } from "./health"
import { createMiners, Miners } from "./miners"
import { createNet, Net } from "./net"
import { ffsOptions } from "./options"
import { createReputation, Reputation } from "./reputation"
import {
  asksTypes,
  Config,
  faultsTypes,
  ffsTypes,
  healthTypes,
  minersTypes,
  netTypes,
  reputationTypes,
  walletTypes,
} from "./types"
import { getTransport, host, useToken } from "./util"
import { createWallet, Wallet } from "./wallet"

export { ffsOptions }
export { Asks, Faults, FFS, Health, Miners, Net, Reputation, Wallet }
export {
  asksTypes,
  Config,
  faultsTypes,
  ffsTypes,
  healthTypes,
  minersTypes,
  netTypes,
  reputationTypes,
  walletTypes,
}

const defaultConfig: Config = {
  host,
  transport: getTransport(),
}

export interface POW {
  setToken: (t: string) => void
  asks: Asks
  faults: Faults
  ffs: FFS
  health: Health
  miners: Miners
  net: Net
  reputation: Reputation
  wallet: Wallet
}

/**
 * Creates a new Powergate client
 * @param config A config object that changes the behavior of the client
 * @returns A Powergate client API
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createPow = (config?: Partial<Config>): POW => {
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

    /**
     * The Wallet API
     */
    wallet: createWallet(c),
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
