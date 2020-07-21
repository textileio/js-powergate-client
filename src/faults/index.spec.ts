import { expect } from "chai"
import { createFaults } from "."
import { getTransport, host } from "../util"

describe("faults", () => {
  const c = createFaults({ host, transport: getTransport() })

  it("should get", async () => {
    const { index } = await c.get()
    expect(index).not.undefined
  })
})
