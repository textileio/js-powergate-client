[Powergate Client](../README.md) › [Globals](../globals.md) › ["net/index"](_net_index_.md)

# Module: "net/index"

## Index

### Functions

* [createNet](_net_index_.md#const-createnet)

## Functions

### `Const` createNet

▸ **createNet**(`config`: [Config](../interfaces/_types_.config.md)): *object*

*Defined in [src/net/index.ts:10](https://github.com/textileio/js-powergate-client/blob/master/src/net/index.ts#L10)*

Creates the Net API client

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`config` | [Config](../interfaces/_types_.config.md) | A config object that changes the behavior of the client |

**Returns:** *object*

The Net API client

* **connectPeer**(`peerInfo`: netTypes.PeerAddrInfo.AsObject): *Promise‹void›*

* **connectedness**(`peerId`: string): *Promise‹object›*

* **disconnectPeer**(`peerId`: string): *Promise‹void›*

* **findPeer**(`peerId`: string): *Promise‹object›*

* **listenAddr**(): *Promise‹object›*

* **peers**(): *Promise‹object›*
