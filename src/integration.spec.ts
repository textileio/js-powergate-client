import { expect } from "chai"
import cp from "child_process"
import crypto from "crypto"
import wait from "wait-on"
import { ApplyOptions, createPow, Pow, powTypes } from "."
import { ListSelect } from "./storage-jobs"
import { host } from "./util"

beforeEach(async function () {
  this.timeout(120000)
  cp.exec(`cd powergate-docker && BIGSECTORS=false make localnet`, (err) => {
    if (err) {
      throw err
    }
  })
  await wait({
    resources: ["http://0.0.0.0:6002", "http://0.0.0.0:5001"],
    timeout: 120000,
    validateStatus: function () {
      return true // the call expectedly returns 404, so just allow that
    },
  })
})

afterEach(async function () {
  this.timeout(120000)
  await new Promise<string>((resolve, reject) => {
    cp.exec(`cd powergate-docker && make localnet-down`, (err, stdout) => {
      if (err) {
        reject(err)
      }
      resolve(stdout)
    })
  })
})

describe("pow", () => {
  it("should get build info", async () => {
    const pow = newPow()
    const res = await pow.buildInfo()
    expect(res.gitSummary).not.empty
  })

  it("should check host", () => {
    const pow = newPow()
    expect(pow.host).equal(host)
  })

  it("should get user id", async () => {
    const pow = newPow()
    await expectNewUser(pow)
    const res = await pow.userId()
    expect(res.id).not.empty
  })

  describe("admin", () => {
    describe("users", () => {
      it("should create user", async () => {
        const pow = newPow()
        await expectNewUser(pow)
      })

      it("should list users", async () => {
        const pow = newPow()
        await expectNewUser(pow)
        const res = await pow.admin.users.list()
        expect(res.usersList).length.greaterThan(0)
      })
    })

    describe("user storage jobs", async () => {
      it("should get executing", async function () {
        const pow = newPow()
        const auth = await expectNewUser(pow)
        const addressees = await expectAddresses(pow, 1)
        await waitForBalance(pow, addressees[0].address)
        const cid = await expectStage(pow, crypto.randomBytes(1024))
        const jobId = await expectApplyStorageConfig(pow, cid)
        await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_EXECUTING)
        const res = await pow.admin.storageJobs.list({
          userId: auth.id,
          cidFilter: cid,
          select: ListSelect.Executing,
        })
        expect(res.storageJobsList).length(1)
        expect(res.storageJobsList[0].id).equals(jobId)
        expect(res.storageJobsList[0].cid).equals(cid)
      })

      it("should get queued", async function () {
        const pow = newPow()
        const auth = await expectNewUser(pow)
        const addressees = await expectAddresses(pow, 1)
        await waitForBalance(pow, addressees[0].address)
        const cid = await expectStage(pow, crypto.randomBytes(1024))
        await expectApplyStorageConfig(pow, cid)
        const res = await pow.admin.storageJobs.list({
          userId: auth.id,
          cidFilter: cid,
          select: ListSelect.Queued,
        })
        expect(res.storageJobsList).length.lessThan(2)
      })

      it("should get summary", async function () {
        const pow = newPow()
        const auth = await expectNewUser(pow)
        const addressees = await expectAddresses(pow, 1)
        await waitForBalance(pow, addressees[0].address)
        const cid = await expectStage(pow, crypto.randomBytes(1024))
        const jobId = await expectApplyStorageConfig(pow, cid)
        let res = await pow.admin.storageJobs.summary(auth.id, cid)
        expect(res.executingStorageJobsList).length(1)
        res = await pow.admin.storageJobs.summary(auth.id, cid)
        expect(res.executingStorageJobsList).length(1)
        expect(res.executingStorageJobsList[0]).equals(jobId)
      })
    })

    describe("all storage jobs", () => {
      it("should get summary", async function () {
        this.timeout(180000)
        const pow = newPow()
        await expectNewUser(pow)
        const addressees = await expectAddresses(pow, 1)
        await waitForBalance(pow, addressees[0].address)
        const cid = await expectStage(pow, crypto.randomBytes(1024))
        const jobId = await expectApplyStorageConfig(pow, cid)
        await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_SUCCESS)
        const res = await pow.admin.storageJobs.summary()
        expect(res.finalStorageJobsList).length.greaterThan(0)
      })
    })

    describe("wallet", async () => {
      it("should get addresses", async function () {
        const pow = newPow()
        const res = await pow.admin.wallet.addresses()
        expect(res.addressesList).length.greaterThan(0)
      })

      it("should create an address", async function () {
        const pow = newPow()
        const res = await pow.admin.wallet.newAddress()
        expect(res.address).not.empty
      })

      it("should send fil", async function () {
        this.timeout(20000)
        const pow = newPow()
        const res0 = await pow.admin.wallet.newAddress()
        const res1 = await pow.admin.wallet.newAddress()
        await waitForBalance(pow, res0.address)
        const bal = await waitForBalance(pow, res1.address)
        await pow.admin.wallet.sendFil(res0.address, res1.address, BigInt(10))
        await waitForBalance(pow, res1.address, bal)
      })
    })

    describe("data", () => {
      it("should gc staged", async function () {
        this.timeout(180000)
        const pow = newPow()
        await expectNewUser(pow)
        const cid = await expectStage(pow, crypto.randomBytes(1024))
        const res = await pow.admin.data.gcStaged()
        expect(res.unpinnedCidsList).length(1)
        expect(res.unpinnedCidsList[0]).equals(cid)
      })

      it("should get pinned cids", async function () {
        this.timeout(30000)
        const pow = newPow()
        const { id } = await expectNewUser(pow)
        const cid = await expectStage(pow, crypto.randomBytes(1024))
        const opts: ApplyOptions = {
          storageConfig: {
            repairable: false,
            hot: {
              enabled: true,
              allowUnfreeze: false,
              unfreezeMaxPrice: 0,
              ipfs: {
                addTimeout: 300,
              },
            },
          },
        }
        const jobId = await expectApplyStorageConfig(pow, cid, opts)
        await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_SUCCESS)
        const res = await pow.admin.data.pinnedCids()
        expect(res.cidsList).length(1)
        expect(res.cidsList[0].cid).equals(cid)
        expect(res.cidsList[0].usersList).length(1)
        expect(res.cidsList[0].usersList[0].userId).equals(id)
      })
    })

    describe("storage info", () => {
      it("should get", async function () {
        this.timeout(180000)
        const pow = newPow()
        const { id } = await expectNewUser(pow)
        const addressees = await expectAddresses(pow, 1)
        await waitForBalance(pow, addressees[0].address)
        const cid = await expectStage(pow, crypto.randomBytes(1024))
        const jobId = await expectApplyStorageConfig(pow, cid)
        await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_SUCCESS)
        const res = await pow.admin.storageInfo.get(id, cid)
        expect(res?.storageInfo).not.undefined
        expect(res?.storageInfo?.cid).equals(cid)
      })

      it("should list", async function () {
        this.timeout(180000)
        const pow = newPow()
        const { id } = await expectNewUser(pow)
        const addressees = await expectAddresses(pow, 1)
        await waitForBalance(pow, addressees[0].address)
        const cid = await expectStage(pow, crypto.randomBytes(1024))
        const jobId = await expectApplyStorageConfig(pow, cid)
        await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_SUCCESS)
        let res = await pow.admin.storageInfo.list()
        expect(res.storageInfoList).length(1)
        res = await pow.admin.storageInfo.list([id])
        expect(res.storageInfoList).length(1)
        res = await pow.admin.storageInfo.list([id], [cid])
        expect(res.storageInfoList).length(1)
        res = await pow.admin.storageInfo.list(undefined, [cid])
        expect(res.storageInfoList).length(1)
        expect(res?.storageInfoList[0].cid).equals(cid)
      })
    })

    describe("records", function () {
      it("should get updated deal records since", async function () {
        this.timeout(180000)
        const t = new Date()
        const pow = newPow()
        await expectNewUser(pow)
        const addressees = await expectAddresses(pow, 1)
        await waitForBalance(pow, addressees[0].address)
        const cid = await expectStage(pow, crypto.randomBytes(1024))
        const jobId = await expectApplyStorageConfig(pow, cid)
        await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_SUCCESS)
        const res = await pow.admin.records.getUpdatedStorageDealRecordsSince(t, 10)
        expect(res.recordsList).length(1)
        expect(res.recordsList[0].rootCid).eq(cid)
      })

      // TODO: Figure out how to test retrievals.
    })

    describe("indices", async function () {
      it("should get miners", async function () {
        const pow = newPow()
        await expectGetMiners(pow)
      })

      it("should get miner info", async function () {
        const pow = newPow()
        const miners = await expectGetMiners(pow)
        const res = await pow.admin.indices.getMinerInfo(miners[0].address)
        expect(res.minersInfoList).length(1)
        expect(res.minersInfoList[0].address).eq(miners[0].address)
      })
    })
  })

  describe("data", () => {
    it("should get cid summary", async function () {
      this.timeout(180000)
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      await waitForBalance(pow, addressees[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      let res = await pow.data.cidSummary()
      expect(res.cidSummaryList).length(1)
      res = await pow.data.cidSummary(cid)
      expect(res.cidSummaryList).length(1)
      expect(res.cidSummaryList[0].cid).equals(cid)
      expect(res.cidSummaryList[0].executingJob).equals(jobId)
    })

    it("should get cid info", async function () {
      this.timeout(180000)
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      await waitForBalance(pow, addressees[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      let res = await pow.data.cidInfo(cid)
      expect(res.cidInfo).not.undefined
      expect(res.cidInfo?.cid).equals(cid)
      expect(res.cidInfo?.currentStorageInfo).undefined
      expect(res.cidInfo?.latestPushedStorageConfig).not.undefined
      expect(res.cidInfo?.queuedStorageJobsList).length.lessThan(2)
      if (res.cidInfo?.executingStorageJob) {
        expect(res.cidInfo?.executingStorageJob.cid).equals(cid)
      }
      await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_SUCCESS)
      res = await pow.data.cidInfo(cid)
      expect(res.cidInfo).not.undefined
      expect(res.cidInfo?.cid).equals(cid)
      expect(res.cidInfo?.currentStorageInfo?.cid).equals(cid)
      expect(res.cidInfo?.latestPushedStorageConfig).not.undefined
      expect(res.cidInfo?.queuedStorageJobsList).length(0)
      expect(res.cidInfo?.executingStorageJob).undefined
    })

    it("should get", async function () {
      this.timeout(180000)
      const pow = newPow()
      await expectNewUser(pow)
      const addrs = await expectAddresses(pow, 1)
      await waitForBalance(pow, addrs[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_SUCCESS)
      const bytes = await pow.data.get(cid)
      expect(bytes.byteLength).greaterThan(0)
    })

    it("should get a folder", async () => {
      const pow = newPow()
      await expectNewUser(pow)
      const res = await pow.data.stageFolder("./sample-data")
      expect(res).length.greaterThan(0)
      await pow.data.getFolder(res, "./output", { timeout: 10000 })
    })

    it("should replace", async function () {
      this.timeout(360000)
      const pow = newPow()
      await expectNewUser(pow)
      const addrs = await expectAddresses(pow, 1)
      await waitForBalance(pow, addrs[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_SUCCESS)
      const cid2 = await expectStage(pow, crypto.randomBytes(1024))
      const res = await pow.data.replaceData(cid, cid2)
      expect(res.jobId).length.greaterThan(0)
      await watchJobUntil(pow, res.jobId, powTypes.JobStatus.JOB_STATUS_SUCCESS)
    })

    it("should stage", async () => {
      const pow = newPow()
      await expectNewUser(pow)
      await expectStage(pow, crypto.randomBytes(1024))
    })

    it("should stage folder", async () => {
      const pow = newPow()
      await expectNewUser(pow)
      const res = await pow.data.stageFolder("sample-data")
      expect(res).not.empty
    })

    it("should watch logs", async function () {
      const pow = newPow()
      await expectNewUser(pow)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      const event = await new Promise<powTypes.LogEntry.AsObject>((resolve) => {
        pow.data.watchLogs((event) => resolve(event), cid, { includeHistory: true, jobId })
      })
      expect(event.cid).equals(cid)
      expect(event.jobId).equals(jobId)
    })
  })

  describe("deals", () => {
    it("should get storage deal records", async function () {
      this.timeout(180000)
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      await waitForBalance(pow, addressees[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_SUCCESS)
      const pending = await pow.deals.storageDealRecords({ includePending: true })
      const final = await pow.deals.storageDealRecords({ includeFinal: true })
      expect(pending.recordsList).empty
      expect(final.recordsList).length(1)
    })

    it("should get retreival deal records", () => {
      // ToDo: Figre out how to force a retrieval to test this.
    })
  })

  describe("storage config", () => {
    it("should get default", async () => {
      const pow = newPow()
      await expectNewUser(pow)
      await expectDefaultStorageConfig(pow)
    })

    it("should set default", async () => {
      const pow = newPow()
      await expectNewUser(pow)
      const conf = await expectDefaultStorageConfig(pow)
      await pow.storageConfig.setDefault(conf)
    })

    it("should apply", async () => {
      const pow = newPow()
      await expectNewUser(pow)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      await expectApplyStorageConfig(pow, cid)
    })

    it("should remove", async () => {
      const pow = newPow()
      await expectNewUser(pow)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const conf = await expectDefaultStorageConfig(pow)
      conf.cold = { ...conf.cold, enabled: false }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      conf.hot = { ...conf.hot!, enabled: false }
      await expectApplyStorageConfig(pow, cid, { storageConfig: conf })
      await pow.storageConfig.remove(cid)
    })
  })

  describe("storage jobs", () => {
    it("should cancel", async function () {
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      await waitForBalance(pow, addressees[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      await pow.storageJobs.cancel(jobId)
    })

    it("should get executing", async function () {
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      await waitForBalance(pow, addressees[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_EXECUTING)
      let res = await pow.storageJobs.list({ select: ListSelect.Executing })
      expect(res.storageJobsList).length(1)
      res = await pow.storageJobs.list({
        cidFilter: cid,
        select: ListSelect.Executing,
      })
      expect(res.storageJobsList).length(1)
      expect(res.storageJobsList[0].id).equals(jobId)
      expect(res.storageJobsList[0].cid).equals(cid)
    })

    it("should get queued", async function () {
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      await waitForBalance(pow, addressees[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      await expectApplyStorageConfig(pow, cid)
      const res = await pow.storageJobs.list({
        cidFilter: cid,
        select: ListSelect.Queued,
      })
      expect(res.storageJobsList).length.lessThan(2)
    })

    it("should get storage config for job", async function () {
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      await waitForBalance(pow, addressees[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      const res = await pow.storageJobs.storageConfig(jobId)
      expect(res.storageConfig).not.undefined
    })

    it("should get storage job", async function () {
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      await waitForBalance(pow, addressees[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      const res = await pow.storageJobs.get(jobId)
      expect(res.storageJob?.id).equals(jobId)
    })

    it("should get summary", async function () {
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      await waitForBalance(pow, addressees[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      let res = await pow.storageJobs.summary()
      expect(res.executingStorageJobsList).length(1)
      res = await pow.storageJobs.summary(cid)
      expect(res.executingStorageJobsList).length(1)
      expect(res.executingStorageJobsList[0]).equals(jobId)
    })

    it("should watch", async function () {
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      await waitForBalance(pow, addressees[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_EXECUTING)
    })
  })

  describe("storage info", () => {
    it("should get", async function () {
      this.timeout(180000)
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      await waitForBalance(pow, addressees[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_SUCCESS)
      const res = await pow.storageInfo.get(cid)
      expect(res?.storageInfo).not.undefined
      expect(res?.storageInfo?.cid).equals(cid)
    })

    it("should list", async function () {
      this.timeout(180000)
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      await waitForBalance(pow, addressees[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_SUCCESS)
      let res = await pow.storageInfo.list()
      expect(res.storageInfoList).length(1)
      res = await pow.storageInfo.list(cid)
      expect(res.storageInfoList).length(1)
      expect(res?.storageInfoList[0].cid).equals(cid)
    })
  })

  describe("wallet", () => {
    it("should get addresses", async function () {
      const pow = newPow()
      await expectNewUser(pow)
      await expectAddresses(pow, 1)
    })

    it("should get balance", async function () {
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      await waitForBalance(pow, addressees[0].address)
    })

    it("should create new address", async function () {
      const pow = newPow()
      await expectNewUser(pow)
      const res = await pow.wallet.newAddress("new one")
      expect(res.address).not.empty
    })

    it("should send fil", async function () {
      this.timeout(120000)
      const pow = newPow()
      await expectNewUser(pow)
      await pow.wallet.newAddress("new one")
      const addressees = await expectAddresses(pow, 2)
      await waitForBalance(pow, addressees[0].address)
      const bal = await waitForBalance(pow, addressees[1].address)
      await pow.wallet.sendFil(addressees[0].address, addressees[1].address, BigInt(10))
      await waitForBalance(pow, addressees[1].address, bal)
    })

    it("should sign message", async function () {
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      const res = await pow.wallet.signMessage(addressees[0].address, crypto.randomBytes(1024))
      expect(res.signature).not.empty
    })

    it("should verify message signature", async function () {
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      const message = crypto.randomBytes(1024)
      const res0 = await pow.wallet.signMessage(addressees[0].address, message)
      const res1 = await pow.wallet.verifyMessage(addressees[0].address, message, res0.signature)
      expect(res1.ok).true
    })
  })
})

function newPow(): Pow {
  return createPow({ host })
}

async function expectNewUser(pow: Pow) {
  const res = await pow.admin.users.create()
  expect(res.user?.id).not.empty
  expect(res.user?.token).not.empty
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  pow.setToken(res.user!.token)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return res.user!
}

async function expectDefaultStorageConfig(pow: Pow) {
  const res = await pow.storageConfig.default()
  expect(res.defaultStorageConfig).not.undefined
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return res.defaultStorageConfig!
}

async function expectStage(pow: Pow, data: Buffer) {
  const res = await pow.data.stage(data)
  expect(res.cid).length.greaterThan(0)
  return res.cid
}

async function expectApplyStorageConfig(pow: Pow, cid: string, opts?: ApplyOptions) {
  const res = await pow.storageConfig.apply(cid, opts)
  expect(res.jobId).length.greaterThan(0)
  return res.jobId
}

function watchJobUntil(
  pow: Pow,
  jobId: string,
  status: powTypes.JobStatusMap[keyof powTypes.JobStatusMap],
) {
  return new Promise<void>((resolve, reject) => {
    try {
      const cancel = pow.storageJobs.watch((job) => {
        if (job.errorCause.length > 0) {
          reject(job.errorCause)
        }
        if (job.status === powTypes.JobStatus.JOB_STATUS_CANCELED) {
          reject("job canceled")
        }
        if (job.status === powTypes.JobStatus.JOB_STATUS_FAILED) {
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

async function expectAddresses(pow: Pow, length: number) {
  const res = await pow.wallet.addresses()
  expect(res.addressesList).length(length)
  return res.addressesList
}

function waitForBalance(pow: Pow, address: string, greaterThan?: bigint) {
  return new Promise<bigint>(async (resolve, reject) => {
    while (true) {
      try {
        const res = await pow.wallet.balance(address)
        const balace = BigInt(res.balance)
        if (balace > (greaterThan || BigInt(0))) {
          resolve(balace)
          break
        }
      } catch (e) {
        reject(e)
      }
      await new Promise((r) => setTimeout(r, 1000))
    }
  })
}

async function expectGetMiners(pow: Pow) {
  const res = await pow.admin.indices.getMiners()
  expect(res.minersList).length(1)
  return res.minersList
}
