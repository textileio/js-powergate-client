import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/net/rpc/rpc_pb_service"
import {
  PeersRequest,
  PeersResponse,
  ListenAddrRequest,
  ListenAddrResponse,
  FindPeerRequest,
  FindPeerResponse,
  ConnectPeerRequest,
  PeerAddrInfo,
  DisconnectPeerRequest,
  ConnectednessRequest,
  ConnectednessResponse,
} from "@textile/grpc-powergate-client/dist/net/rpc/rpc_pb"
import { promise } from "../util"
import { Config } from "../types"

/**
 * Creates the Net API client
 * @param config A config object that changes the behavior of the client
 * @returns The Net API client
 */
export const createNet = (config: Config) => {
  const client = new RPCServiceClient(config.host, config)
  return {
    /**
     * Get the listen address of the filecoin node
     * @returns The listen address info
     */
    listenAddr: () =>
      promise(
        (cb) => client.listenAddr(new ListenAddrRequest(), cb),
        (res: ListenAddrResponse) => res.toObject(),
      ),

    /**
     * List filecoin peers
     * @returns A list of filecoin peers
     */
    peers: () =>
      promise(
        (cb) => client.peers(new PeersRequest(), cb),
        (res: PeersResponse) => res.toObject(),
      ),

    /**
     * Find a peer by peer id
     * @param peerId The peer id to find info for
     * @returns The peer info
     */
    findPeer: (peerId: string) => {
      const req = new FindPeerRequest()
      req.setPeerId(peerId)
      return promise(
        (cb) => client.findPeer(req, cb),
        (res: FindPeerResponse) => res.toObject(),
      )
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
      req.setPeerInfo(info)
      return promise(
        (cb) => client.connectPeer(req, cb),
        () => {
          // nothing to return
        },
      )
    },

    /**
     * Get the current connectedness state to a peer
     * @param peerId The peer id
     * @returns Information about the connectedness to the peer
     */
    connectedness: (peerId: string) => {
      const req = new ConnectednessRequest()
      req.setPeerId(peerId)
      return promise(
        (cb) => client.connectedness(req, cb),
        (res: ConnectednessResponse) => res.toObject(),
      )
    },

    /**
     * Disconnect from a peer
     * @param peerId The peer id to disconnect from
     */
    disconnectPeer: (peerId: string) => {
      const req = new DisconnectPeerRequest()
      req.setPeerId(peerId)
      return promise(
        (cb) => client.disconnectPeer(req, cb),
        () => {
          // nothing to return
        },
      )
    },
  }
}
