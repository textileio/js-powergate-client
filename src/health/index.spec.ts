import { health } from '.'
import { expect } from 'chai'
import { Status } from '@textile/grpc-powergate-client/dist/health/rpc/rpc_pb'
import { getTransport } from '../util'

describe('health', () => {
  let c = health({ host: 'http://0.0.0.0:6002', transport: getTransport() })
  
  it('should check health', async () => {
    const status = await c.check()
    expect(status.status).equal(Status.OK)
  })
})