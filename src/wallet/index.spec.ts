import { expect } from "chai"
import { createWallet } from "."
import { getTransport, host } from "../util"

describe("wallet", () => {
  const c = createWallet({ host, transport: getTransport() })

  let address: string

  it("should list addresses", async () => {
    const addresses = await c.list()
    expect(addresses).length(1)
    address = addresses[0]
  })

  it("should create a new address", async () => {
    const address = await c.newAddress()
    expect(address).length.greaterThan(0)
  })

  it("should check balance", async () => {
    const bal = await c.balance(address)
    expect(bal).greaterThan(0)
  })
})
