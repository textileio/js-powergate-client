import { createHealth } from './health'
import { createNet } from './net'
import { createFFS } from './ffs'
import { createMiners } from './miners'
import { useToken, getTransport, host } from './util'
import { Config } from './types'

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
  const c = { ...defaultConfig, ...config }

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
