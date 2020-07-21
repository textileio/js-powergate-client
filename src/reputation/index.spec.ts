import { expect } from "chai"
import { createReputation } from "."
import { getTransport, host } from "../util"

describe("reputation", () => {
  const c = createReputation({ host, transport: getTransport() })

  it("should get top miners", async () => {
    const { topMinersList } = await c.getTopMiners(10)
    expect(topMinersList).not.undefined
  })
})
