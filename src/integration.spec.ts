import { expect } from "chai"
import cp from "child_process"
import crypto from "crypto"
import wait from "wait-on"
import { ApplyOptions, createPow, Pow, powTypes } from "."
import { host } from "./util"

beforeEach(async function () {
  this.timeout(120000)
  cp.exec(`cd powergate-docker && BIGSECTORS=false make localnet`, (err) => {
    if (err) {
      throw err
    }
  })
  await wait({
    resources: ["http://0.0.0.0:6002"],
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
        const res = await pow.admin.storageJobs.executing(auth.id, cid)
        expect(res.storageJobsList).length(1)
        expect(res.storageJobsList[0].id).equals(jobId)
        expect(res.storageJobsList[0].cid).equals(cid)
      })

      it("should get latest final", async function () {
        this.timeout(180000)
        const pow = newPow()
        const auth = await expectNewUser(pow)
        const addressees = await expectAddresses(pow, 1)
        await waitForBalance(pow, addressees[0].address)
        const cid = await expectStage(pow, crypto.randomBytes(1024))
        const jobId = await expectApplyStorageConfig(pow, cid)
        let res = await pow.admin.storageJobs.latestFinal(auth.id, cid)
        expect(res.storageJobsList).empty
        await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_SUCCESS)
        res = await pow.admin.storageJobs.latestFinal(auth.id, cid)
        expect(res.storageJobsList).length(1)
        expect(res.storageJobsList[0].id).equals(jobId)
        expect(res.storageJobsList[0].cid).equals(cid)
      })

      it("should get latest successful", async function () {
        this.timeout(180000)
        const pow = newPow()
        const auth = await expectNewUser(pow)
        const addressees = await expectAddresses(pow, 1)
        await waitForBalance(pow, addressees[0].address)
        const cid = await expectStage(pow, crypto.randomBytes(1024))
        const jobId = await expectApplyStorageConfig(pow, cid)
        let res = await pow.admin.storageJobs.latestSuccessful(auth.id, cid)
        expect(res.storageJobsList).empty
        await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_SUCCESS)
        res = await pow.admin.storageJobs.latestSuccessful(auth.id, cid)
        expect(res.storageJobsList).length(1)
        res = await pow.admin.storageJobs.latestSuccessful(auth.id, cid)
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
        const res = await pow.admin.storageJobs.queued(auth.id, cid)
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
        expect(res.executingStorageJobsList[0].cid).equals(cid)
        expect(res.executingStorageJobsList[0].id).equals(jobId)
        expect(res.jobCounts?.executing).equals(1)
        expect(res.jobCounts?.latestFinal).equals(0)
        expect(res.jobCounts?.latestSuccessful).equals(0)
        expect(res.jobCounts?.queued).equals(0)
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
        const res = await pow.admin.storageJobs.summary("")
        expect(res.jobCounts?.latestFinal).greaterThan(0)
        expect(res.jobCounts?.latestSuccessful).greaterThan(0)
        expect(res.jobCounts?.queued).equals(0)
        expect(res.jobCounts?.executing).equals(0)
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
  })

  describe("data", () => {
    it("should get cid info", async function () {
      this.timeout(180000)
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      await waitForBalance(pow, addressees[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      let res = await pow.data.cidInfo(cid)
      expect(res.cidInfosList).length(1)
      res = await pow.data.cidInfo()
      expect(res.cidInfosList).length(1)
      expect(res.cidInfosList[0].cid).equals(cid)
      expect(res.cidInfosList[0].currentStorageInfo).undefined
      expect(res.cidInfosList[0].latestFinalStorageJob).undefined
      expect(res.cidInfosList[0].latestSuccessfulStorageJob).undefined
      expect(res.cidInfosList[0].latestPushedStorageConfig).not.undefined
      expect(res.cidInfosList[0].queuedStorageJobsList).length.lessThan(2)
      if (res.cidInfosList[0].executingStorageJob) {
        expect(res.cidInfosList[0].executingStorageJob.cid).equals(cid)
      }
      await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_SUCCESS)
      res = await pow.data.cidInfo()
      expect(res.cidInfosList).length(1)
      expect(res.cidInfosList[0].cid).equals(cid)
      expect(res.cidInfosList[0].currentStorageInfo?.cid).equals(cid)
      expect(res.cidInfosList[0].latestFinalStorageJob).not.undefined
      expect(res.cidInfosList[0].latestSuccessfulStorageJob).not.undefined
      expect(res.cidInfosList[0].latestPushedStorageConfig).not.undefined
      expect(res.cidInfosList[0].queuedStorageJobsList).length(0)
      expect(res.cidInfosList[0].executingStorageJob).undefined
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
      this.timeout(180000)
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
      let res = await pow.storageJobs.executing()
      expect(res.storageJobsList).length(1)
      res = await pow.storageJobs.executing(cid)
      expect(res.storageJobsList).length(1)
      expect(res.storageJobsList[0].id).equals(jobId)
      expect(res.storageJobsList[0].cid).equals(cid)
    })

    it("should get latest final", async function () {
      this.timeout(180000)
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      await waitForBalance(pow, addressees[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      let res = await pow.storageJobs.latestFinal()
      expect(res.storageJobsList).empty
      await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_SUCCESS)
      res = await pow.storageJobs.latestFinal()
      expect(res.storageJobsList).length(1)
      res = await pow.storageJobs.latestFinal(cid)
      expect(res.storageJobsList).length(1)
      expect(res.storageJobsList[0].id).equals(jobId)
      expect(res.storageJobsList[0].cid).equals(cid)
    })

    it("should get latest successful", async function () {
      this.timeout(180000)
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      await waitForBalance(pow, addressees[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      let res = await pow.storageJobs.latestSuccessful()
      expect(res.storageJobsList).empty
      await watchJobUntil(pow, jobId, powTypes.JobStatus.JOB_STATUS_SUCCESS)
      res = await pow.storageJobs.latestSuccessful()
      expect(res.storageJobsList).length(1)
      res = await pow.storageJobs.latestSuccessful(cid)
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
      const res = await pow.storageJobs.queued(cid)
      expect(res.storageJobsList).length.lessThan(2)
    })

    it("should get storage config for job", async function () {
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      await waitForBalance(pow, addressees[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      const res = await pow.storageJobs.storageConfigForJob(jobId)
      expect(res.storageConfig).not.undefined
    })

    it("should get storage job", async function () {
      const pow = newPow()
      await expectNewUser(pow)
      const addressees = await expectAddresses(pow, 1)
      await waitForBalance(pow, addressees[0].address)
      const cid = await expectStage(pow, crypto.randomBytes(1024))
      const jobId = await expectApplyStorageConfig(pow, cid)
      const res = await pow.storageJobs.storageJob(jobId)
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
      expect(res.executingStorageJobsList[0].cid).equals(cid)
      expect(res.executingStorageJobsList[0].id).equals(jobId)
      expect(res.jobCounts?.executing).equals(1)
      expect(res.jobCounts?.latestFinal).equals(0)
      expect(res.jobCounts?.latestSuccessful).equals(0)
      expect(res.jobCounts?.queued).equals(0)
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
