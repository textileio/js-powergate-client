import {expect} from 'chai'
import { AddrInfo, DefaultConfig, CidConfig, JobStatus } from '@textile/grpc-powergate-client/dist/ffs/rpc/rpc_pb'
import fs from 'fs'
import { ffs, withOverrideConfig, withConfig } from '.'
import { useToken, getTransport } from '../util'

describe('ffs', () => {
  const {getMeta, setToken} = useToken('')

  let c = ffs({ host: 'http://0.0.0.0:6002', transport: getTransport() }, getMeta)

  let instanceId: string
  let initialAddrs: AddrInfo.AsObject[]
  let defaultConfig: DefaultConfig.AsObject
  let cid: string
  let defaultCidConfig: CidConfig.AsObject

  it('should create an instance', async function() {
    this.timeout(30000)
    const res = await c.create()
    expect(res.id).not.empty
    expect(res.token).not.empty
    instanceId = res.id
    setToken(res.token)
    // wait for 10 seconds so our wallet address gets funded
    await new Promise(r => setTimeout(r, 10000))
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
    await c.setDefaultConfig(defaultConfig)
  })

  it('should get info', async () => {
    const res = await c.info()
    expect(res.info).not.undefined
  })

  it('should add to hot', async () => {
    const result = fs.readFileSync(`/Users/aaron/code/textile/powergate/samplefile`)
    // let buffer = new Uint8Array(Array.from(Array(700).keys()))

    // const obj = {hello: 'world'}
    // const blob = new Blob([buffer])
    const res = await c.addToHot(result)
    expect(res.cid).length.greaterThan(0)
    cid = res.cid
  })

  it('should get default cid config', async () => {
    const res = await c.getDefaultCidConfig(cid)
    expect(res.config?.cid).equal(cid)
    defaultCidConfig = res.config!
  })

  let jobId: string

  it('should push config', async () => {
    const res = await c.pushConfig(cid, withOverrideConfig(false), withConfig(defaultCidConfig))
    expect(res.jobid).length.greaterThan(0)
    jobId = res.jobid
  })

  it('should watch job', function(done) {
    this.timeout(0)
    const cancel = c.watchJobs((job) => {
      expect(job.errcause).empty
      expect(job.status).not.equal(JobStatus.CANCELED)
      expect(job.status).not.equal(JobStatus.FAILED)
      if (job.status === JobStatus.SUCCESS) {
        done()
      }
    }, jobId)
  })

  // watch logs

  it('should get cid config', async () => {
    const res = await c.getCidConfig(cid)
    expect(res.config?.cid).equal(cid)
  })

  it('should show', async () => {
    const res = await c.show(cid)
    expect(res.cidinfo).not.undefined
  })

  // it('should replace', async () => {
  //   const obj = {hello: 'how are you?'}
  //   const blob = new Blob([JSON.stringify(obj, null, 2)], {type: 'application/json'})
  //   const res0 = await c.addToHot(blob)
  //   expect(res0.cid).length.greaterThan(0)
  //   const res1 = await c.replace(cid, res0.cid)
  //   expect(res1.jobid).length.greaterThan(0)
  //   cid = res0.cid
  // })

  it('should get', async () => {
    const bytes = await c.get(cid)
    expect(bytes).not.empty
  })

  // it('should remove', async () => {
  //   const newConf: CidConfig.AsObject = {
  //     cid,
  //     repairable: false,
  //     cold: {
  //       enabled: false
  //     },
  //     hot: {
  //       allowunfreeze: false,
  //       enabled: false
  //     }
  //   }
  //   const res0 = c.pushConfig(cid, withOverrideConfig(true), withConfig(newConf))
  //   expect(res0).not.undefined
  //   const res = await c.remove(cid)
  //   expect(res).not.undefined
  // })

  it('should send fil', async () => {
    const addrs = await c.addrs()
    expect(addrs.addrsList).lengthOf(2)
    await c.sendFil(addrs.addrsList[0].addr, addrs.addrsList[1].addr, 10)
  })

  it('should close', async () => {
    await c.close()
  })
})