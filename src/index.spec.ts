import { expect } from "chai"
import cp from "child_process"
import path from "path"

import { createPow } from "."
import { host } from "./util"

const p = path.join(__dirname, "../docker-compose-devnet.yml")

before(async function () {
  this.timeout(60000)
  cp.exec(`docker-compose -p devnet -f ${p} up --build -V --detach`, (err) => {
    if (err) {
      throw err
    }
  })
  await new Promise((r) => setTimeout(r, 50000))
})

after(() => {
  cp.exec(`docker-compose -p devnet -f ${p} down`)
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
