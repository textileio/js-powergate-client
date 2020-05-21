import {net} from '.'
import {expect, assert} from 'chai'
import {PeersReply, Connectedness} from '@textile/grpc-powergate-client/dist/net/rpc/rpc_pb'

describe('net', () => {
  const c = net('http://0.0.0.0:6002')
  
  let peers: PeersReply.AsObject

  it('should query peers', async () => {
    peers = await c.peers()
    expect(peers.peersList).length.greaterThan(0)
  })

  it('should get listen address', async () => {
    const listenAddr = await c.listenAddr()
    expect(listenAddr.addrinfo?.addrsList).length.greaterThan(0)
    expect(listenAddr.addrinfo?.id).length.greaterThan(0)
  })

  it('should find a peer', async () => {
    const peerId = peers.peersList[0].addrinfo?.id
    if (!peerId) {
      assert.fail('no peer id')
    }
    const peer = await c.findPeer(peerId)
    expect(peer.peerinfo).not.undefined
  })

  it('should get peer connectedness', async () => {
    const peerId = peers.peersList[0].addrinfo?.id
    if (!peerId) {
      assert.fail('no peer id')
    }
    const resp = await c.connectedness(peerId)
    expect(resp.connectedness).equal(Connectedness.CONNECTED)
  })

  it('should disconnect and reconnect to a peer', async () => {
    const peerInfo = peers.peersList[0].addrinfo
    if (!peerInfo) {
      assert.fail('no peer info')
    }
    const disconnectResp = await c.disconnectPeer(peerInfo.id)
    expect(disconnectResp).not.undefined
    const connectResp = await c.connectPeer(peerInfo)
    expect(connectResp).not.undefined
  })
})
