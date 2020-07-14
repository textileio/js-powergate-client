import { expect } from "chai"
import cp from "child_process"
import wait from "wait-on"
import { createPow } from "."
import { host } from "./util"

before(async function () {
  this.timeout(130000)
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

after(() => {
  cp.exec(`cd powergate-docker && make down`)
})

// beforeEach(async function () {
//   this.timeout(130000)
//   cp.exec(`cd powergate-docker && BIGSECTORS=false make localnet`, (err) => {
//     if (err) {
//       throw err
//     }
//   })
//   await wait({
//     resources: ["http://0.0.0.0:6002"],
//     timeout: 120000,
//   })
// })

// afterEach(function (done) {
//   cp.exec(`cd powergate-docker && make down`, (err) => {
//     if (err) {
//       throw err
//     }
//     done()
//   })
// })

describe("client", () => {
  it("should create a client", () => {
    const pow = createPow({ host })
    expect(pow.ffs).not.undefined
    expect(pow.health).not.undefined
    expect(pow.net).not.undefined
    expect(pow.miners).not.undefined
  })
})
