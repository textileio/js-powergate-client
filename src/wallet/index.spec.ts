import { expect } from "chai"
import { createWallet } from "."
import { getTransport, host } from "../util"

describe("wallet", () => {
  const c = createWallet({ host, transport: getTransport() })

  it("should list addresses", async () => {
    await expectAddresses(0)
  })

  it("should create a new address", async () => {
    await expectNewAddress()
  })

  it("should check balance", async () => {
    const addrs = await expectAddresses(0)
    await c.balance(addrs[0])
  })

  it("should send fil", async () => {
    const addrs = await expectAddresses(0)
    const newAddr = await expectNewAddress()
    await c.sendFil(addrs[0], newAddr, 10)
  })

  async function expectAddresses(lengthGreaterThan: number) {
    const addresses = await c.list()
    expect(addresses).length.greaterThan(lengthGreaterThan)
    return addresses
  }

  async function expectNewAddress() {
    const address = await c.newAddress()
    expect(address).length.greaterThan(0)
    return address
  }
})
