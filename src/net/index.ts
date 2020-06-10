import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/net/rpc/rpc_pb_service"
import { Config, net } from "../types"
import { promise } from "../util"

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
        (cb) => client.listenAddr(new net.ListenAddrRequest(), cb),
        (res: net.ListenAddrResponse) => res.toObject(),
      ),

    /**
     * List filecoin peers
     * @returns A list of filecoin peers
     */
    peers: () =>
      promise(
        (cb) => client.peers(new net.PeersRequest(), cb),
        (res: net.PeersResponse) => res.toObject(),
      ),

    /**
     * Find a peer by peer id
     * @param peerId The peer id to find info for
     * @returns The peer info
     */
    findPeer: (peerId: string) => {
      const req = new net.FindPeerRequest()
      req.setPeerId(peerId)
      return promise(
        (cb) => client.findPeer(req, cb),
        (res: net.FindPeerResponse) => res.toObject(),
      )
    },

    /**
     * Connect to a peer
     * @param peerInfo The peer info specifying the peer to connect to
     */
    connectPeer: (peerInfo: net.PeerAddrInfo.AsObject) => {
      const info = new net.PeerAddrInfo()
      info.setId(peerInfo.id)
      info.setAddrsList(peerInfo.addrsList)
      const req = new net.ConnectPeerRequest()
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
      const req = new net.ConnectednessRequest()
      req.setPeerId(peerId)
      return promise(
        (cb) => client.connectedness(req, cb),
        (res: net.ConnectednessResponse) => res.toObject(),
      )
    },

    /**
     * Disconnect from a peer
     * @param peerId The peer id to disconnect from
     */
    disconnectPeer: (peerId: string) => {
      const req = new net.DisconnectPeerRequest()
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
