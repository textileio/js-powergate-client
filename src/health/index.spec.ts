import { createHealth } from '.'
import { expect } from 'chai'
import { Status } from '@textile/grpc-powergate-client/dist/health/rpc/rpc_pb'
import { getTransport, host } from '../util'

describe('health', () => {
  let health = createHealth({ host, transport: getTransport() })
  
  it('should check health', async () => {
    const status = await health.check()
    expect(status.status).equal(Status.OK)
  })
})