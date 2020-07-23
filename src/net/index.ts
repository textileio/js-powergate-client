import {
  ConnectednessRequest,
  ConnectednessResponse,
  ConnectPeerRequest,
  DisconnectPeerRequest,
  FindPeerRequest,
  FindPeerResponse,
  ListenAddrRequest,
  ListenAddrResponse,
  PeerAddrInfo,
  PeersRequest,
  PeersResponse,
} from "@textile/grpc-powergate-client/dist/net/rpc/rpc_pb"
import { RPCServiceClient } from "@textile/grpc-powergate-client/dist/net/rpc/rpc_pb_service"
import { Config } from "../types"
import { promise } from "../util"

export interface Net {
  /**
   * Get the listen address of the filecoin node.
   * @returns The listen address info.
   */
  listenAddr: () => Promise<ListenAddrResponse.AsObject>

  /**
   * List filecoin peers.
   * @returns A list of filecoin peers.
   */
  peers: () => Promise<PeersResponse.AsObject>

  /**
   * Find a peer by peer id.
   * @param peerId The peer id to find info for.
   * @returns The peer info.
   */
  findPeer: (peerId: string) => Promise<FindPeerResponse.AsObject>

  /**
   * Connect to a peer.
   * @param peerInfo The peer info specifying the peer to connect to.
   */
  connectPeer: (peerInfo: PeerAddrInfo.AsObject) => Promise<void>

  /**
   * Get the current connectedness state to a peer.
   * @param peerId The peer id.
   * @returns Information about the connectedness to the peer.
   */
  connectedness: (peerId: string) => Promise<ConnectednessResponse.AsObject>

  /**
   * Disconnect from a peer.
   * @param peerId The peer id to disconnect from.
   */
  disconnectPeer: (peerId: string) => Promise<void>
}

/**
 * @ignore
 */
export const createNet = (config: Config): Net => {
  const client = new RPCServiceClient(config.host, config)
  return {
    listenAddr: () =>
      promise(
        (cb) => client.listenAddr(new ListenAddrRequest(), cb),
        (res: ListenAddrResponse) => res.toObject(),
      ),

    peers: () =>
      promise(
        (cb) => client.peers(new PeersRequest(), cb),
        (res: PeersResponse) => res.toObject(),
      ),

    findPeer: (peerId: string) => {
      const req = new FindPeerRequest()
      req.setPeerId(peerId)
      return promise(
        (cb) => client.findPeer(req, cb),
        (res: FindPeerResponse) => res.toObject(),
      )
    },

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

    connectedness: (peerId: string) => {
      const req = new ConnectednessRequest()
      req.setPeerId(peerId)
      return promise(
        (cb) => client.connectedness(req, cb),
        (res: ConnectednessResponse) => res.toObject(),
      )
    },

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
