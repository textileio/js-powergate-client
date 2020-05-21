import {expect} from 'chai'
import {ffs} from '.'
import {useToken} from '../util'

describe('ffs', () => {
  const {getMeta, setToken} = useToken('')

  let c = ffs('http://0.0.0.0:6002', getMeta)

  let instanceId: string

  it('should create an instance', async () => {
    const res = await c.create()
    expect(res.id).not.empty
    expect(res.token).not.empty
    instanceId = res.id
    setToken(res.token)
  })

  it('should list instances', async () => {
    const res = await c.list()
    expect(res.instancesList).length.greaterThan(0)
  })

  it('should get instance id', async () => {
    const res = await c.id()
    expect(res.id).eq(instanceId)
  })
})