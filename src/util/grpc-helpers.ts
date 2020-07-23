import { grpc } from "@improbable-eng/grpc-web"
import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport"
import { isNode } from "./util"

export const host = "http://0.0.0.0:6002"

const tokenKey = "X-ffs-Token"

export function promise<U, V, W>(
  handler: (callback: (error: V | null, resp: U | null) => void) => void,
  mapper: (resp: U) => W,
): Promise<W> {
  return new Promise((resolve, reject) => {
    handler((err, resp) => {
      if (err) {
        reject(err)
      }
      if (!resp) {
        reject("empty response")
      } else {
        resolve(mapper(resp))
      }
    })
  })
}

export const useToken = (
  initialToken?: string,
): Readonly<{
  getMeta: () => grpc.Metadata
  setToken: (t: string) => void
}> => {
  let token = initialToken

  const getMeta = () => {
    const meta = new grpc.Metadata()
    if (token) {
      meta.set(tokenKey, token)
    }
    return meta
  }

  const setToken = (t: string) => {
    token = t
  }

  return Object.freeze({ getMeta, setToken })
}

export const getTransport = (): grpc.TransportFactory | undefined =>
  isNode ? NodeHttpTransport() : undefined
