import {RPCClient} from '@textile/grpc-powergate-client/dist/net/rpc/rpc_pb_service'
import {
  PeersRequest, 
  PeersReply, 
  ListenAddrRequest, 
  ListenAddrReply, 
  FindPeerRequest, 
  FindPeerReply, 
  ConnectPeerRequest, 
  PeerAddrInfo, 
  ConnectPeerReply, 
  DisconnectPeerRequest,
  DisconnectPeerReply,
  ConnectednessRequest,
  ConnectednessReply
} from '@textile/grpc-powergate-client/dist/net/rpc/rpc_pb'
import {promise} from '../util'

export const net = (host: string) => {
  let client = new RPCClient(host)
  return {
    listenAddr: () => promise((cb) => client.listenAddr(new ListenAddrRequest(), cb), (res: ListenAddrReply) => res.toObject()),

    peers: () => promise((cb) => client.peers(new PeersRequest(), cb), (res: PeersReply) => res.toObject()),

    findPeer: (peerId: string) => {
      const req = new FindPeerRequest()
      req.setPeerid(peerId)
      return promise((cb) => client.findPeer(req, cb), (res: FindPeerReply) => res.toObject())
    },
    
    connectPeer: (peerInfo: PeerAddrInfo.AsObject) => {
      const info = new PeerAddrInfo()
      info.setId(peerInfo.id)
      info.setAddrsList(peerInfo.addrsList)
      const req = new ConnectPeerRequest()
      req.setPeerinfo(info)
      return promise((cb) => client.connectPeer(req, cb), (res: ConnectPeerReply) => res.toObject())
    },

    connectedness: (peerId: string) => {
      const req = new ConnectednessRequest()
      req.setPeerid(peerId)
      return promise((cb) => client.connectedness(req, cb), (res: ConnectednessReply) => res.toObject())
    },

    disconnectPeer: (peerId: string) => {
      const req = new DisconnectPeerRequest()
      req.setPeerid(peerId)
      return promise((cb) => client.disconnectPeer(req, cb), (res: DisconnectPeerReply) => res.toObject())
    }
  }
}
