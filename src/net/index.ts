import { RPCClient } from '@textile/grpc-powergate-client/dist/net/rpc/rpc_pb_service'
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
import { promise } from '../util'
import { Config } from '..'

/**
 * Creates the Net API client
 * @param config A config object that changes the behavior of the client
 * @returns The Net API client
 */
export const net = (config: Config) => {
  let client = new RPCClient(config.host, config)
  return {
    /**
     * Get the listen address of the filecoin node
     * @returns The listen address info
     */
    listenAddr: () => promise((cb) => client.listenAddr(new ListenAddrRequest(), cb), (res: ListenAddrReply) => res.toObject()),

    /**
     * List filecoin peers
     * @returns A list of filecoin peers
     */
    peers: () => promise((cb) => client.peers(new PeersRequest(), cb), (res: PeersReply) => res.toObject()),

    /**
     * Find a peer by peer id
     * @param peerId The peer id to find info for
     * @returns The peer info
     */
    findPeer: (peerId: string) => {
      const req = new FindPeerRequest()
      req.setPeerid(peerId)
      return promise((cb) => client.findPeer(req, cb), (res: FindPeerReply) => res.toObject())
    },
    
    /**
     * Connect to a peer
     * @param peerInfo The peer info specifying the peer to connect to
     */
    connectPeer: (peerInfo: PeerAddrInfo.AsObject) => {
      const info = new PeerAddrInfo()
      info.setId(peerInfo.id)
      info.setAddrsList(peerInfo.addrsList)
      const req = new ConnectPeerRequest()
      req.setPeerinfo(info)
      return promise((cb) => client.connectPeer(req, cb), (res: ConnectPeerReply) => {})
    },

    /**
     * Get the current connectedness state to a peer
     * @param peerId The peer id
     * @returns Information about the connectedness to the peer
     */
    connectedness: (peerId: string) => {
      const req = new ConnectednessRequest()
      req.setPeerid(peerId)
      return promise((cb) => client.connectedness(req, cb), (res: ConnectednessReply) => res.toObject())
    },

    /**
     * Disconnect from a peer
     * @param peerId The peer id to disconnect from
     */
    disconnectPeer: (peerId: string) => {
      const req = new DisconnectPeerRequest()
      req.setPeerid(peerId)
      return promise((cb) => client.disconnectPeer(req, cb), (res: DisconnectPeerReply) => {})
    }
  }
}
