import { expect } from "chai"
import { getTransport, host } from "../util"
import { createMiners } from "."

describe("miners", () => {
  const miners = createMiners({ host, transport: getTransport() })

  it("should get the index", async () => {
    const status = await miners.get()
    expect(status.index).not.undefined
  })
})
