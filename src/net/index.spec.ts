import { createNet } from '.'
import { expect, assert } from 'chai'
import { PeersReply, Connectedness } from '@textile/grpc-powergate-client/dist/net/rpc/rpc_pb'
import { getTransport, host } from '../util'

describe('net', () => {
  const net = createNet({ host, transport: getTransport() })
  
  let peers: PeersReply.AsObject

  it('should query peers', async () => {
    peers = await net.peers()
    expect(peers.peersList).length.greaterThan(0)
  })

  it('should get listen address', async () => {
    const listenAddr = await net.listenAddr()
    expect(listenAddr.addrinfo?.addrsList).length.greaterThan(0)
    expect(listenAddr.addrinfo?.id).length.greaterThan(0)
  })

  it('should find a peer', async () => {
    const peerId = peers.peersList[0].addrinfo?.id
    if (!peerId) {
      assert.fail('no peer id')
    }
    const peer = await net.findPeer(peerId)
    expect(peer.peerinfo).not.undefined
  })

  it('should get peer connectedness', async () => {
    const peerId = peers.peersList[0].addrinfo?.id
    if (!peerId) {
      assert.fail('no peer id')
    }
    const resp = await net.connectedness(peerId)
    expect(resp.connectedness).equal(Connectedness.CONNECTED)
  })

  it('should disconnect and reconnect to a peer', async () => {
    const peerInfo = peers.peersList[0].addrinfo
    if (!peerInfo) {
      assert.fail('no peer info')
    }
    await net.disconnectPeer(peerInfo.id)
    await net.connectPeer(peerInfo)
  })
})
