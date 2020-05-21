import {health} from './health'
import {net} from './net'
import {ffs} from './ffs'
import {useToken} from './util'

const client = (host: string, authToken?: string) => {
  const {getMeta, setToken} = useToken(authToken)
  return {
    setToken,
    health: health(host),
    net: net(host),
    ffs: ffs(host, getMeta)
  }
}

export default client
