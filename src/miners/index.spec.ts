import { expect } from "chai"
import { createMiners } from "."
import { getTransport, host } from "../util"

describe("miners", () => {
  const c = createMiners({ host, transport: getTransport() })

  it("should get the index", async () => {
    const res = await c.get()
    expect(res.index).not.undefined
  })
})
