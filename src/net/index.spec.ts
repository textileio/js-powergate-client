import { Connectedness, PeersResponse } from "@textile/grpc-powergate-client/dist/net/rpc/rpc_pb"
import { assert, expect } from "chai"
import { createNet } from "."
import { getTransport, host } from "../util"

describe("net", () => {
  const c = createNet({ host, transport: getTransport() })

  it("should query peers", async () => {
    await expectPeers()
  })

  it("should get listen address", async () => {
    const listenAddr = await c.listenAddr()
    expect(listenAddr.addrInfo?.addrsList).length.greaterThan(0)
    expect(listenAddr.addrInfo?.id).length.greaterThan(0)
  })

  it("should find a peer", async () => {
    const peers = await expectPeers()
    const peerId = expectPeerInfo(peers).id
    const peer = await c.findPeer(peerId)
    expect(peer.peerInfo).not.undefined
  })

  it("should get peer connectedness", async () => {
    const peers = await expectPeers()
    const peerId = expectPeerInfo(peers).id
    const resp = await c.connectedness(peerId)
    expect(resp.connectedness).equal(Connectedness.CONNECTEDNESS_CONNECTED)
  })

  it("should disconnect and reconnect to a peer", async () => {
    const peers = await expectPeers()
    const peerInfo = expectPeerInfo(peers)
    await c.disconnectPeer(peerInfo.id)
    await c.connectPeer(peerInfo)
  })

  async function expectPeers() {
    const peers = await c.peers()
    expect(peers.peersList).length.greaterThan(0)
    return peers
  }

  function expectPeerInfo(peersResp: PeersResponse.AsObject) {
    const peerInfo = peersResp.peersList[0].addrInfo
    if (!peerInfo) {
      assert.fail("no peer info")
    }
    return peerInfo
  }
})
