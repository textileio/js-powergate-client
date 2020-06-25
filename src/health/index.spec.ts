import { expect } from "chai"
import { createHealth } from "."
import { healthTypes } from "../types"
import { getTransport, host } from "../util"

describe("health", () => {
  const c = createHealth({ host, transport: getTransport() })

  it("should check health", async () => {
    const status = await c.check()
    expect(status.status).equal(healthTypes.Status.STATUS_OK)
  })
})
