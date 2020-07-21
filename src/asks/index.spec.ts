import { expect } from "chai"
import { createAsks } from "."
import { asksTypes } from "../types"
import { getTransport, host } from "../util"

describe("asks", () => {
  const c = createAsks({ host, transport: getTransport() })

  it("should get", async () => {
    const { index } = await c.get()
    expect(index).not.undefined
  })

  it("should query", async () => {
    const q = new asksTypes.Query().toObject()
    const { asksList } = await c.query(q)
    expect(asksList).not.undefined
  })
})
