import { expect } from "chai"
import cp from "child_process"
import wait from "wait-on"
import { createPow } from "."
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

describe("client", () => {
  const pow = createPow({ host })

  it("should create a client", () => {
    expect(pow.ffs).not.undefined
    expect(pow.health).not.undefined
    expect(pow.net).not.undefined
    expect(pow.miners).not.undefined
    expect(pow.host).equal(host)
  })

  it("should get build info", async () => {
    const res = await pow.buildInfo()
    expect(res.gitSummary).not.empty
  })
})
