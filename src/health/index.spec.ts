import { expect } from 'chai'
import { Status } from '@textile/grpc-powergate-client/dist/health/rpc/rpc_pb'
import { getTransport, host } from '../util'
import { createHealth } from '.'

describe('health', () => {
  const health = createHealth({ host, transport: getTransport() })

  it('should check health', async () => {
    const status = await health.check()
    expect(status.status).equal(Status.STATUS_OK)
  })
})
