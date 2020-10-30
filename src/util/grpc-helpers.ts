import { grpc } from "@improbable-eng/grpc-web"
import { WebsocketTransport } from "@textile/grpc-transport"

export const host = "http://0.0.0.0:6002"

const tokenKey = "X-ffs-Token"
const adminTokenKey = "X-pow-admin-token"

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

export const useTokens = (
  initialToken?: string,
  initialAdminToken?: string,
): Readonly<{
  getMeta: () => grpc.Metadata
  getHeaders: () => Record<string, string>
  setToken: (t: string) => void
  setAdminToken: (t: string) => void
}> => {
  let token = initialToken
  let adminToken = initialAdminToken

  const getMeta = () => {
    const meta = new grpc.Metadata()
    if (token) {
      meta.set(tokenKey, token)
    }
    if (adminToken) {
      meta.set(adminTokenKey, adminToken)
    }
    return meta
  }

  const getHeaders = () => {
    const headers: Record<string, string> = {}
    if (token) {
      headers["x-ipfs-ffs-auth"] = token
    }
    return headers
  }

  const setToken = (t: string) => {
    token = t
  }

  const setAdminToken = (t: string) => {
    adminToken = t
  }

  return Object.freeze({ getMeta, getHeaders, setToken, setAdminToken })
}

export const getTransport = (): grpc.TransportFactory => WebsocketTransport()
