import { grpc } from '@improbable-eng/grpc-web'
import { health } from './health'
import { net } from './net'
import { ffs } from './ffs'
import { useToken, getTransport, host } from './util'

export interface Config extends grpc.RpcOptions {
  host: string
  authToken?: string
}

const defaultConfig: Config = {
  host,
  transport: getTransport()
}

const client = (config?: Partial<Config>) => {
  const c = { ...defaultConfig, ...config }

  const { getMeta, setToken } = useToken(c.authToken)

  return {
    setToken,
    health: health(c),
    net: net(c),
    ffs: ffs(c, getMeta)
  }
}

export default client
