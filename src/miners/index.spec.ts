import { miners } from '.'
import { expect } from 'chai'
import { Status } from '@textile/grpc-powergate-client/dist/health/rpc/rpc_pb'
import { getTransport, host } from '../util'

describe('miners', () => {
  let c = miners({ host, transport: getTransport() })
  
  it('should get the index', async () => {
    const status = await c.get()
    expect(status.index).not.undefined
  })
})