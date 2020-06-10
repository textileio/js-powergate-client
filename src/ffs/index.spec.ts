import { expect } from "chai"
import fs from "fs"
import { createFFS, withConfig, withHistory, withOverrideConfig } from "."
import { ffs } from "../types"
import { getTransport, host, useToken } from "../util"

describe("ffs", () => {
  const { getMeta, setToken } = useToken("")

  const c = createFFS({ host, transport: getTransport() }, getMeta)

  let instanceId: string
  let initialAddrs: ffs.AddrInfo.AsObject[]
  let defaultConfig: ffs.DefaultConfig.AsObject
  let cid: string
  let defaultCidConfig: ffs.CidConfig.AsObject

  it("should create an instance", async function () {
    this.timeout(30000)
    const res = await c.create()
    expect(res.id).not.empty
    expect(res.token).not.empty
    instanceId = res.id
    setToken(res.token)
    // wait for 10 seconds so our wallet address gets funded
    await new Promise((r) => setTimeout(r, 10000))
  })

  it("should list instances", async () => {
    const res = await c.list()
    expect(res.instancesList).length.greaterThan(0)
  })

  it("should get instance id", async () => {
    const res = await c.id()
    expect(res.id).eq(instanceId)
  })

  it("should get addrs", async () => {
    const res = await c.addrs()
    initialAddrs = res.addrsList
    expect(initialAddrs).length.greaterThan(0)
  })

  it("should get the default config", async () => {
    const res = await c.defaultConfig()
    expect(res.defaultConfig).not.undefined
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    defaultConfig = res.defaultConfig!
  })

  it("should create a new addr", async () => {
    const res = await c.newAddr("my addr")
    expect(res.addr).length.greaterThan(0)
    const addrsRes = await c.addrs()
    expect(addrsRes.addrsList).length(initialAddrs.length + 1)
  })

  it("should set default config", async () => {
    await c.setDefaultConfig(defaultConfig)
  })

  it("should get info", async () => {
    const res = await c.info()
    expect(res.info).not.undefined
  })

  it("should add to hot", async () => {
    const buffer = fs.readFileSync(`sample-data/samplefile`)
    const res = await c.addToHot(buffer)
    expect(res.cid).length.greaterThan(0)
    cid = res.cid
  })

  it("should get default cid config", async () => {
    const res = await c.getDefaultCidConfig(cid)
    expect(res.config?.cid).equal(cid)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    defaultCidConfig = res.config!
  })

  let jobId: string

  it("should push config", async () => {
    const res = await c.pushConfig(cid, withOverrideConfig(false), withConfig(defaultCidConfig))
    expect(res.jobId).length.greaterThan(0)
    jobId = res.jobId
  })

  it("should watch job", function (done) {
    this.timeout(180000)
    const cancel = c.watchJobs((job) => {
      expect(job.errCause).empty
      expect(job.status).not.equal(ffs.JobStatus.JOB_STATUS_CANCELED)
      expect(job.status).not.equal(ffs.JobStatus.JOB_STATUS_FAILED)
      if (job.status === ffs.JobStatus.JOB_STATUS_SUCCESS) {
        cancel()
        done()
      }
    }, jobId)
  })

  it("should watch logs", function (done) {
    this.timeout(10000)
    const cancel = c.watchLogs(
      (logEvent) => {
        expect(logEvent.cid).not.empty
        cancel()
        done()
      },
      cid,
      withHistory(true),
    )
  })

  it("should get cid config", async () => {
    const res = await c.getCidConfig(cid)
    expect(res.config?.cid).equal(cid)
  })

  it("should show", async () => {
    const res = await c.show(cid)
    expect(res.cidInfo).not.undefined
  })

  it("should show all", async () => {
    const res = await c.showAll()
    expect(res).not.empty
  })

  let buffer: Buffer

  it("should replace", async () => {
    buffer = fs.readFileSync(`sample-data/samplefile2`)
    const res0 = await c.addToHot(buffer)
    expect(res0.cid).length.greaterThan(0)
    const res1 = await c.replace(cid, res0.cid)
    expect(res1.jobId).length.greaterThan(0)
    cid = res0.cid
    jobId = res1.jobId
  })

  it("should watch replace job", function (done) {
    this.timeout(180000)
    const cancel = c.watchJobs((job) => {
      expect(job.errCause).empty
      expect(job.status).not.equal(ffs.JobStatus.JOB_STATUS_CANCELED)
      expect(job.status).not.equal(ffs.JobStatus.JOB_STATUS_FAILED)
      if (job.status === ffs.JobStatus.JOB_STATUS_SUCCESS) {
        cancel()
        done()
      }
    }, jobId)
  })

  it("should get", async () => {
    const bytes = await c.get(cid)
    expect(bytes.byteLength).equal(buffer.byteLength)
  })

  it("should list payment channels", async () => {
    await c.listPayChannels()
  })

  it("should create a payment channel", async () => {
    // TODO
  })

  it("should redeem a payment channel", async () => {
    // TODO
  })

  it("should push disable storage job", async () => {
    const newConf: ffs.CidConfig.AsObject = {
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
    const res0 = await c.pushConfig(cid, withOverrideConfig(true), withConfig(newConf))
    expect(res0).not.undefined
    jobId = res0.jobId
  })

  it("should watch disable storage job", function (done) {
    this.timeout(180000)
    const cancel = c.watchJobs((job) => {
      expect(job.errCause).empty
      expect(job.status).not.equal(ffs.JobStatus.JOB_STATUS_CANCELED)
      expect(job.status).not.equal(ffs.JobStatus.JOB_STATUS_FAILED)
      if (job.status === ffs.JobStatus.JOB_STATUS_SUCCESS) {
        cancel()
        done()
      }
    }, jobId)
  })

  it("should remove", async () => {
    await c.remove(cid)
  })

  it("should send fil", async () => {
    const addrs = await c.addrs()
    expect(addrs.addrsList).lengthOf(2)
    await c.sendFil(addrs.addrsList[0].addr, addrs.addrsList[1].addr, 10)
  })

  it("should close", async () => {
    await c.close()
  })
})
