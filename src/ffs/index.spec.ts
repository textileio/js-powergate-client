import {expect} from 'chai'
import { AddrInfo, DefaultConfig, CidConfig } from '@textile/grpc-powergate-client/dist/ffs/rpc/rpc_pb'
import {ffs, withOverrideConfig, withConfig} from '.'
import {useToken} from '../util'

describe('ffs', () => {
  const {getMeta, setToken} = useToken('')

  let c = ffs('http://0.0.0.0:6002', getMeta)

  let instanceId: string
  let initialAddrs: AddrInfo.AsObject[]
  let defaultConfig: DefaultConfig.AsObject
  let cid: string
  let defaultCidConfig: CidConfig.AsObject

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

  it('should get addrs', async () => {
    const res = await c.addrs()
    initialAddrs = res.addrsList
    expect(initialAddrs).length.greaterThan(0)
  })

  it('should get the default config', async () => {
    const res = await c.defaultConfig()
    expect(res.defaultconfig).not.undefined
    defaultConfig = res.defaultconfig!
  })

  it('should create a new addr', async () => {
    const res = await c.newAddr('my addr')
    expect(res.addr).length.greaterThan(0)
    const addrsRes = await c.addrs()
    expect(addrsRes.addrsList).length(initialAddrs.length + 1)
  })

  it('should set default config', async () => {
    const res = await c.setDefaultConfig(defaultConfig)
    expect(res).not.undefined
  })

  it('should get info', async () => {
    const res = await c.info()
    expect(res.info).not.undefined
  })

  it('should add to hot', async () => {
    const obj = {hello: 'world'}
    const blob = new Blob([JSON.stringify(obj, null, 2)], {type: 'application/json'})
    const res = await c.addToHot(blob)
    expect(res.cid).length.greaterThan(0)
    cid = res.cid
  })

  it('should get default cid config', async () => {
    const res = await c.getDefaultCidConfig(cid)
    expect(res.config?.cid).equal(cid)
    defaultCidConfig = res.config!
  })

  it('should push config', async () => {
    const res = await c.pushConfig(cid, withOverrideConfig(false), withConfig(defaultCidConfig))
    expect(res.jobid).length.greaterThan(0)
  })

  it('should get cid config', async () => {
    const res = await c.getCidConfig(cid)
    expect(res.config?.cid).equal(cid)
  })
})