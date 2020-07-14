import { expect } from "chai"
import { createWallet } from "."
import { getTransport, host } from "../util"

describe("wallet", () => {
  const c = createWallet({ host, transport: getTransport() })

  let address: string

  it("should list addresses", async () => {
    const addresses = await c.list()
    expect(addresses).length.greaterThan(0)
    address = addresses[0]
  })

  it("should create a new address", async () => {
    const address = await c.newAddress()
    expect(address).length.greaterThan(0)
  })

  it("should check balance", async () => {
    await c.balance(address)
  })

  // it("should send fil", async () => {
  //   const addresses = await c.list()
  //   expect(addresses).length(1)
  //   const bal = await c.balance(addresses[0])
  //   expect(bal).greaterThan(0)

  //   const address = await c.newAddress()
  //   expect(address).length.greaterThan(0)

  //   await c.sendFil(addresses[0], address, 10)
  // })
})
