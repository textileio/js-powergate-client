import {health} from './health'
import {net} from './net'
import {ffs} from './ffs'
import {useToken, useValue} from './util'

export interface Config {
  host: string
  authToken?: string
}

const defaultConfig: Config = {
  host: 'http://0.0.0.0:6002',
}

const client = (config?: Partial<Config>) => {
  const c = {...defaultConfig, ...config}

  const {getMeta, setToken} = useToken(c.authToken)

  return {
    setToken,
    health: health(c.host),
    net: net(c.host),
    ffs: ffs(c.host, getMeta)
  }
}

export default client
