import fs from 'fs'
import { expect } from 'chai'
import {
  AddrInfo,
  DefaultConfig,
  CidConfig,
  JobStatus,
} from '@textile/grpc-powergate-client/dist/ffs/rpc/rpc_pb'
import { useToken, getTransport, host } from '../util'
import { createFFS, withOverrideConfig, withConfig, withHistory } from '.'

describe('ffs', () => {
  const { getMeta, setToken } = useToken('')

  const ffs = createFFS({ host, transport: getTransport() }, getMeta)

  let instanceId: string
  let initialAddrs: AddrInfo.AsObject[]
  let defaultConfig: DefaultConfig.AsObject
  let cid: string
  let defaultCidConfig: CidConfig.AsObject

  it('should create an instance', async function () {
    this.timeout(30000)
    const res = await ffs.create()
    expect(res.id).not.empty
    expect(res.token).not.empty
    instanceId = res.id
    setToken(res.token)
    // wait for 10 seconds so our wallet address gets funded
    await new Promise((r) => setTimeout(r, 10000))
  })

  it('should list instances', async () => {
    const res = await ffs.list()
    expect(res.instancesList).length.greaterThan(0)
  })

  it('should get instance id', async () => {
    const res = await ffs.id()
    expect(res.id).eq(instanceId)
  })

  it('should get addrs', async () => {
    const res = await ffs.addrs()
    initialAddrs = res.addrsList
    expect(initialAddrs).length.greaterThan(0)
  })

  it('should get the default config', async () => {
    const res = await ffs.defaultConfig()
    expect(res.defaultConfig).not.undefined
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    defaultConfig = res.defaultConfig!
  })

  it('should create a new addr', async () => {
    const res = await ffs.newAddr('my addr')
    expect(res.addr).length.greaterThan(0)
    const addrsRes = await ffs.addrs()
    expect(addrsRes.addrsList).length(initialAddrs.length + 1)
  })

  it('should set default config', async () => {
    await ffs.setDefaultConfig(defaultConfig)
  })

  it('should get info', async () => {
    const res = await ffs.info()
    expect(res.info).not.undefined
  })

  it('should add to hot', async () => {
    const buffer = fs.readFileSync(`src/test-util/sample-data/samplefile`)
    const res = await ffs.addToHot(buffer)
    expect(res.cid).length.greaterThan(0)
    cid = res.cid
  })

  it('should get default cid config', async () => {
    const res = await ffs.getDefaultCidConfig(cid)
    expect(res.config?.cid).equal(cid)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    defaultCidConfig = res.config!
  })

  let jobId: string

  it('should push config', async () => {
    const res = await ffs.pushConfig(cid, withOverrideConfig(false), withConfig(defaultCidConfig))
    expect(res.jobId).length.greaterThan(0)
    jobId = res.jobId
  })

  it('should watch job', function (done) {
    this.timeout(180000)
    const cancel = ffs.watchJobs((job) => {
      expect(job.errCause).empty
      expect(job.status).not.equal(JobStatus.JOB_STATUS_CANCELED)
      expect(job.status).not.equal(JobStatus.JOB_STATUS_FAILED)
      if (job.status === JobStatus.JOB_STATUS_SUCCESS) {
        cancel()
        done()
      }
    }, jobId)
  })

  it('should watch logs', function (done) {
    this.timeout(10000)
    const cancel = ffs.watchLogs(
      (logEvent) => {
        expect(logEvent.cid).not.empty
        cancel()
        done()
      },
      cid,
      withHistory(true),
    )
  })

  it('should get cid config', async () => {
    const res = await ffs.getCidConfig(cid)
    expect(res.config?.cid).equal(cid)
  })

  it('should show', async () => {
    const res = await ffs.show(cid)
    expect(res.cidInfo).not.undefined
  })

  it('should show all', async () => {
    const res = await ffs.showAll()
    expect(res).not.empty
  })

  let buffer: Buffer

  it('should replace', async () => {
    buffer = fs.readFileSync(`src/test-util/sample-data/samplefile2`)
    const res0 = await ffs.addToHot(buffer)
    expect(res0.cid).length.greaterThan(0)
    const res1 = await ffs.replace(cid, res0.cid)
    expect(res1.jobId).length.greaterThan(0)
    cid = res0.cid
    jobId = res1.jobId
  })

  it('should watch replace job', function (done) {
    this.timeout(180000)
    const cancel = ffs.watchJobs((job) => {
      expect(job.errCause).empty
      expect(job.status).not.equal(JobStatus.JOB_STATUS_CANCELED)
      expect(job.status).not.equal(JobStatus.JOB_STATUS_FAILED)
      if (job.status === JobStatus.JOB_STATUS_SUCCESS) {
        cancel()
        done()
      }
    }, jobId)
  })

  it('should get', async () => {
    const bytes = await ffs.get(cid)
    expect(bytes.byteLength).equal(buffer.byteLength)
  })

  it('should push disable storage job', async () => {
    const newConf: CidConfig.AsObject = {
      cid,
      repairable: false,
      cold: {
        enabled: false,
      },
      hot: {
        allowUnfreeze: false,
        enabled: false,
      },
    }
    const res0 = await ffs.pushConfig(cid, withOverrideConfig(true), withConfig(newConf))
    expect(res0).not.undefined
    jobId = res0.jobId
  })

  it('should watch disable storage job', function (done) {
    this.timeout(180000)
    const cancel = ffs.watchJobs((job) => {
      expect(job.errCause).empty
      expect(job.status).not.equal(JobStatus.JOB_STATUS_CANCELED)
      expect(job.status).not.equal(JobStatus.JOB_STATUS_FAILED)
      if (job.status === JobStatus.JOB_STATUS_SUCCESS) {
        cancel()
        done()
      }
    }, jobId)
  })

  it('should remove', async () => {
    await ffs.remove(cid)
  })

  it('should send fil', async () => {
    const addrs = await ffs.addrs()
    expect(addrs.addrsList).lengthOf(2)
    await ffs.sendFil(addrs.addrsList[0].addr, addrs.addrsList[1].addr, 10)
  })

  it('should close', async () => {
    await ffs.close()
  })
})
