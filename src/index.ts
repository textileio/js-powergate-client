import { grpc } from '@improbable-eng/grpc-web'
import { health } from './health'
import { net } from './net'
import { ffs } from './ffs'
import { useToken, getTransport, host } from './util'

/**
 * Object that allows you to configure the Powergate client
 */
export interface Config extends grpc.RpcOptions {
  host: string
  authToken?: string
}

const defaultConfig: Config = {
  host,
  transport: getTransport()
}

/**
 * Creates a new Powergate client
 * @param config A config object that changes the behavior of the client
 * @returns A Powergate client API
 */
const client = (config?: Partial<Config>) => {
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
    health: health(c),

    /**
     * The Net API
     */
    net: net(c),

    /**
     * The FFS API
     */
    ffs: ffs(c, getMeta)
  }
}

export default client
