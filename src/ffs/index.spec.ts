import { expect } from "chai"
import fs from "fs"
import { createFFS } from "."
import { ffsTypes } from "../types"
import { getTransport, host, useToken } from "../util"
import { PushStorageConfigOption, withConfig, withHistory, withOverrideConfig } from "./options"

describe("ffs", function () {
  this.timeout(180000)

  const { getMeta, setToken } = useToken("")

  const c = createFFS({ host, transport: getTransport() }, getMeta)

  it("should create an instance", async () => {
    await expectNewInstance()
  })

  it("should list instances", async () => {
    await expectNewInstance()
    const res = await c.list()
    expect(res.instancesList).length.greaterThan(0)
  })

  it("should get instance id", async () => {
    const instanceInfo = await expectNewInstance()
    const res = await c.id()
    expect(res.id).eq(instanceInfo.id)
  })

  it("should get addrs", async () => {
    await expectNewInstance()
    await expectAddrs(1)
  })

  it("should get the default config", async () => {
    await expectNewInstance()
    await expectDefaultStorageConfig()
  })

  it("should create a new addr", async () => {
    await expectNewInstance()
    await expectAddrs(1)
    await expectNewAddr()
    await expectAddrs(2)
  })

  it("should set default config", async () => {
    await expectNewInstance()
    const defaultConfig = await expectDefaultStorageConfig()
    await c.setDefaultStorageConfig(defaultConfig)
  })

  it("should get info", async () => {
    await expectNewInstance()
    const res = await c.info()
    expect(res.info).not.undefined
  })

  it("should add to hot", async () => {
    await expectNewInstance()
    await expectStage("sample-data/samplefile")
  })

  it("should push config", async () => {
    await expectNewInstance()
    const cid = await expectStage("sample-data/samplefile")
    const config = await expectDefaultStorageConfig()
    await expectPushStorageConfig(cid, false, config)
  })

  it("should watch job", async () => {
    await expectNewInstance()
    const addrs = await expectAddrs(1)
    await waitForBalance(addrs[0].addr, 0)
    const cid = await expectStage("sample-data/samplefile")
    const jobId = await expectPushStorageConfig(cid)
    await waitForJobStatus(jobId, ffsTypes.JobStatus.JOB_STATUS_SUCCESS)
  })

  it("should watch logs", async () => {
    await expectNewInstance()
    const cid = await expectStage("sample-data/samplefile")
    await expectPushStorageConfig(cid)
    await new Promise<void>((resolve, reject) => {
      const cancel = c.watchLogs(
        (logEvent) => {
          if (logEvent.cid.length > 0) {
            cancel()
            resolve()
          } else {
            cancel()
            reject("empty log cid")
          }
        },
        cid,
        withHistory(true),
      )
    })
  })

  // it("should get a storage deal record", async () => {
  //   await expectNewInstance()
  //   const addrs = await expectAddrs(1)
  //   await waitForBalance(addrs[0].addr, 0)

  //   const [cid1, cid2, cid3] = await Promise.all([
  //     expectStage("sample-data/samplefile"),
  //     expectStage("sample-data/samplefile2"),
  //     expectStage("sample-data/samplefile3"),
  //   ])

  //   const [jobId1, jobId2, jobId3] = await Promise.all([
  //     expectPushStorageConfig(cid1),
  //     expectPushStorageConfig(cid2),
  //     expectPushStorageConfig(cid3),
  //   ])

  //   await Promise.all([
  //     waitForJobStatus(jobId1, ffsTypes.JobStatus.JOB_STATUS_EXECUTING),
  //     waitForJobStatus(jobId2, ffsTypes.JobStatus.JOB_STATUS_EXECUTING),
  //     waitForJobStatus(jobId3, ffsTypes.JobStatus.JOB_STATUS_EXECUTING),
  //   ])

  //   const res1 = await c.listStorageDealRecords(
  //     withIncludePending(true),
  //     // withAscending(true),
  //     // withFromAddresses(addrs[0].addr),
  //     // withDataCids(cid, cid2, cid3),
  //   )
  //   expect(res1, "pending").length(3)

  //   const res2 = await c.listStorageDealRecords(
  //     withIncludeFinal(true),
  //     // withAscending(true),
  //     // withFromAddresses(addrs[0].addr),
  //     // withDataCids(cid, cid2, cid3),
  //   )
  //   expect(res2, "final").empty

  //   // const res = await c.listStorageDealRecords(
  //   //   withIncludeFinal(true),
  //   //   withIncludePending(true),
  //   //   withAscending(true),
  //   //   withFromAddresses(addrs[0].addr),
  //   //   // withDataCids(cid, cid2, cid3),
  //   // )
  //   // expect(res).length(3)
  // })

  it("should get a retrieval deal record", async () => {
    // ToDo: Figure out hot to make sure the data in the previous push isn't cached in hot
  })

  it("should get storage config", async () => {
    await expectNewInstance()
    const cid = await expectStage("sample-data/samplefile")
    await expectPushStorageConfig(cid)
    const res = await c.getStorageConfig(cid)
    expect(res.config?.cold).not.undefined
    expect(res.config?.hot).not.undefined
  })

  it("should show", async () => {
    await expectNewInstance()
    const addrs = await expectAddrs(1)
    await waitForBalance(addrs[0].addr, 0)
    const cid = await expectStage("sample-data/samplefile")
    const jobId = await expectPushStorageConfig(cid)
    await waitForJobStatus(jobId, ffsTypes.JobStatus.JOB_STATUS_SUCCESS)
    const res = await c.show(cid)
    expect(res.cidInfo).not.undefined
  })

  it("should show all", async () => {
    await expectNewInstance()
    const addrs = await expectAddrs(1)
    await waitForBalance(addrs[0].addr, 0)
    const cid = await expectStage("sample-data/samplefile")
    const jobId = await expectPushStorageConfig(cid)
    await waitForJobStatus(jobId, ffsTypes.JobStatus.JOB_STATUS_SUCCESS)
    const res = await c.showAll()
    expect(res.cidInfosList).not.empty
  })

  it("should replace", async () => {
    await expectNewInstance()
    const addrs = await expectAddrs(1)
    await waitForBalance(addrs[0].addr, 0)
    const cid = await expectStage("sample-data/samplefile")
    const jobId = await expectPushStorageConfig(cid)
    await waitForJobStatus(jobId, ffsTypes.JobStatus.JOB_STATUS_SUCCESS)
    const cid2 = await expectStage("sample-data/samplefile2")
    const res = await c.replace(cid, cid2)
    expect(res.jobId).length.greaterThan(0)
  })

  it("should get", async () => {
    await expectNewInstance()
    const addrs = await expectAddrs(1)
    await waitForBalance(addrs[0].addr, 0)
    const cid = await expectStage("sample-data/samplefile")
    const jobId = await expectPushStorageConfig(cid)
    await waitForJobStatus(jobId, ffsTypes.JobStatus.JOB_STATUS_SUCCESS)
    const bytes = await c.get(cid)
    expect(bytes.byteLength).greaterThan(0)
  })

  it("should cancel a job", async () => {
    await expectNewInstance()
    const cid = await expectStage("sample-data/samplefile")
    const jobId = await expectPushStorageConfig(cid)
    await c.cancelJob(jobId)
  })

  it("should list payment channels", async () => {
    // TODO
  })

  it("should create a payment channel", async () => {
    // TODO
  })

  it("should redeem a payment channel", async () => {
    // TODO
  })

  it("should remove", async () => {
    await expectNewInstance()
    const cid = await expectStage("sample-data/samplefile")
    const conf: ffsTypes.StorageConfig.AsObject = {
      repairable: false,
      cold: {
        enabled: false,
      },
      hot: {
        allowUnfreeze: false,
        enabled: false,
      },
    }
    const jobId = await expectPushStorageConfig(cid, false, conf)
    await waitForJobStatus(jobId, ffsTypes.JobStatus.JOB_STATUS_SUCCESS)
    await c.remove(cid)
  })

  it("should send fil", async () => {
    await expectNewInstance()
    const addrs = await expectAddrs(1)
    await waitForBalance(addrs[0].addr, 0)
    const addr = await expectNewAddr()
    await c.sendFil(addrs[0].addr, addr, 10)
  })

  it("should close", async () => {
    await expectNewInstance()
    await c.close()
  })

  async function expectNewInstance() {
    const res = await c.create()
    expect(res.id).not.empty
    expect(res.token).not.empty
    setToken(res.token)
    return res
  }

  async function expectAddrs(length: number) {
    const res = await c.addrs()
    expect(res.addrsList).length(length)
    return res.addrsList
  }

  async function expectNewAddr() {
    const res = await c.newAddr("my addr")
    expect(res.addr).length.greaterThan(0)
    return res.addr
  }

  async function expectDefaultStorageConfig() {
    const res = await c.defaultStorageConfig()
    expect(res.defaultStorageConfig).not.undefined
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return res.defaultStorageConfig!
  }

  async function expectStage(path: string) {
    const buffer = fs.readFileSync(path)
    const res = await c.stage(buffer)
    expect(res.cid).length.greaterThan(0)
    return res.cid
  }

  async function expectPushStorageConfig(
    cid: string,
    override: boolean = false,
    config?: ffsTypes.StorageConfig.AsObject,
  ) {
    const opts: PushStorageConfigOption[] = []
    opts.push(withOverrideConfig(override))
    if (config) {
      opts.push(withConfig(config))
    }
    const res = await c.pushStorageConfig(cid, ...opts)
    expect(res.jobId).length.greaterThan(0)
    return res.jobId
  }

  function waitForJobStatus(
    jobId: string,
    status: ffsTypes.JobStatusMap[keyof ffsTypes.JobStatusMap],
  ) {
    return new Promise<void>((resolve, reject) => {
      try {
        const cancel = c.watchJobs((job) => {
          if (job.errCause.length > 0) {
            reject(job.errCause)
          }
          if (job.status === ffsTypes.JobStatus.JOB_STATUS_CANCELED) {
            reject("job canceled")
          }
          if (job.status === ffsTypes.JobStatus.JOB_STATUS_FAILED) {
            reject("job failed")
          }
          if (job.status === status) {
            cancel()
            resolve()
          }
        }, jobId)
      } catch (e) {
        reject(e)
      }
    })
  }

  function waitForBalance(address: string, greaterThan: number) {
    return new Promise<number>(async (resolve, reject) => {
      while (true) {
        try {
          const res = await c.info()
          if (!res.info) {
            reject("no balance info returned")
            return
          }
          const info = res.info.balancesList.find((info) => info.addr?.addr === address)
          if (!info) {
            reject("address not in balances list")
            return
          }
          if (info.balance > greaterThan) {
            resolve(info.balance)
            return
          }
        } catch (e) {
          reject(e)
        }
        await new Promise((r) => setTimeout(r, 1000))
      }
    })
  }
})
