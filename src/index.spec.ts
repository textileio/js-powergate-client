import { expect } from "chai"
import cp from "child_process"
import wait from "wait-on"
import { createPow } from "."
import { host } from "./util"

beforeEach(async function () {
  this.timeout(10000)
  cp.exec(`cd powergate-docker && BIGSECTORS=false make localnet`, (err) => {
    if (err) {
      throw err
    }
  })
  await wait({
    resources: ["http://0.0.0.0:6002"],
    timeout: 120000,
  })
})

afterEach(async function () {
  this.timeout(10000)
  await new Promise<string>((resolve, reject) => {
    cp.exec(`cd powergate-docker && make down`, (err, stdout) => {
      if (err) {
        reject(err)
      }
      resolve(stdout)
    })
  })
})

describe("client", () => {
  it("should create a client", () => {
    const pow = createPow({ host })
    expect(pow.ffs).not.undefined
    expect(pow.health).not.undefined
    expect(pow.net).not.undefined
    expect(pow.miners).not.undefined
  })
})
