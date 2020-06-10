import { expect } from "chai"
import { createHealth } from "."
import { health } from "../types"
import { getTransport, host } from "../util"

describe("health", () => {
  const c = createHealth({ host, transport: getTransport() })

  it("should check health", async () => {
    const status = await c.check()
    expect(status.status).equal(health.Status.STATUS_OK)
  })
})
