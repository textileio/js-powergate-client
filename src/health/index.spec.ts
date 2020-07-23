import { Status } from "@textile/grpc-powergate-client/dist/health/rpc/rpc_pb"
import { expect } from "chai"
import { createHealth } from "."
import { getTransport, host } from "../util"

describe("health", () => {
  const c = createHealth({ host, transport: getTransport() })

  it("should check health", async () => {
    const status = await c.check()
    expect(status.status).equal(Status.STATUS_OK)
  })
})
