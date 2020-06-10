import { Connectedness, PeersResponse } from "@textile/grpc-powergate-client/dist/net/rpc/rpc_pb"
import { assert, expect } from "chai"
import { createNet } from "."
import { getTransport, host } from "../util"

describe("net", () => {
  const net = createNet({ host, transport: getTransport() })

  let peers: PeersResponse.AsObject

  it("should query peers", async () => {
    peers = await net.peers()
    expect(peers.peersList).length.greaterThan(0)
  })

  it("should get listen address", async () => {
    const listenAddr = await net.listenAddr()
    expect(listenAddr.addrInfo?.addrsList).length.greaterThan(0)
    expect(listenAddr.addrInfo?.id).length.greaterThan(0)
  })

  it("should find a peer", async () => {
    const peerId = peers.peersList[0].addrInfo?.id
    if (!peerId) {
      assert.fail("no peer id")
    }
    const peer = await net.findPeer(peerId)
    expect(peer.peerInfo).not.undefined
  })

  it("should get peer connectedness", async () => {
    const peerId = peers.peersList[0].addrInfo?.id
    if (!peerId) {
      assert.fail("no peer id")
    }
    const resp = await net.connectedness(peerId)
    expect(resp.connectedness).equal(Connectedness.CONNECTEDNESS_CONNECTED)
  })

  it("should disconnect and reconnect to a peer", async () => {
    const peerInfo = peers.peersList[0].addrInfo
    if (!peerInfo) {
      assert.fail("no peer info")
    }
    await net.disconnectPeer(peerInfo.id)
    await net.connectPeer(peerInfo)
  })
})
