import { expect } from "chai"
import { createMiners } from "."
import { getTransport, host } from "../util"

describe("miners", () => {
  const miners = createMiners({ host, transport: getTransport() })

  it("should get the index", async () => {
    const status = await miners.get()
    expect(status.index).not.undefined
  })
})
