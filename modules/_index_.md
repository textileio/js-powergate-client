[Powergate Client](../README.md) › [Globals](../globals.md) › ["index"](_index_.md)

# Module: "index"

## Index

### Type aliases

* [POW](_index_.md#pow)

### Functions

* [createPow](_index_.md#const-createpow)

## Type aliases

###  POW

Ƭ **POW**: *ReturnType‹typeof createPow›*

*Defined in [src/index.ts:41](https://github.com/textileio/js-powergate-client/blob/master/src/index.ts#L41)*

## Functions

### `Const` createPow

▸ **createPow**(`config?`: Partial‹[Config](../interfaces/_types_.config.md)›): *object*

*Defined in [src/index.ts:49](https://github.com/textileio/js-powergate-client/blob/master/src/index.ts#L49)*

Creates a new Powergate client

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`config?` | Partial‹[Config](../interfaces/_types_.config.md)› | A config object that changes the behavior of the client |

**Returns:** *object*

A Powergate client API

* **asks**(): *object*

  * **get**(): *Promise‹object›*

  * **query**(`query`: asksTypes.Query.AsObject): *Promise‹object›*

* **faults**(): *object*

  * **get**(): *Promise‹object›*

* **ffs**(): *object*

  * **addrs**(): *Promise‹object›*

  * **cancelJob**(`jobId`: string): *Promise‹void›*

  * **close**(): *Promise‹void›*

  * **create**(): *Promise‹object›*

  * **createPayChannel**(`from`: string, `to`: string, `amt`: number): *Promise‹object›*

  * **defaultStorageConfig**(): *Promise‹object›*

  * **get**(`cid`: string): *Promise‹Uint8Array‹››*

  * **getStorageConfig**(`cid`: string): *Promise‹object›*

  * **id**(): *Promise‹object›*

  * **info**(): *Promise‹object›*

  * **list**(): *Promise‹object›*

  * **listPayChannels**(): *Promise‹object›*

  * **listRetrievalDealRecords**(...`opts`: [ListDealRecordsOption](_ffs_options_.md#listdealrecordsoption)[]): *Promise‹object›*

  * **listStorageDealRecords**(...`opts`: [ListDealRecordsOption](_ffs_options_.md#listdealrecordsoption)[]): *Promise‹object›*

  * **newAddr**(`name`: string, `type?`: "bls" | "secp256k1", `makeDefault?`: undefined | false | true): *Promise‹object›*

  * **pushStorageConfig**(`cid`: string, ...`opts`: [PushStorageConfigOption](_ffs_options_.md#pushstorageconfigoption)[]): *Promise‹object›*

  * **redeemPayChannel**(`payChannelAddr`: string): *Promise‹void›*

  * **remove**(`cid`: string): *Promise‹void›*

  * **replace**(`cid1`: string, `cid2`: string): *Promise‹object›*

  * **sendFil**(`from`: string, `to`: string, `amount`: number): *Promise‹void›*

  * **setDefaultStorageConfig**(`config`: ffsTypes.StorageConfig.AsObject): *Promise‹void›*

  * **show**(`cid`: string): *Promise‹object›*

  * **showAll**(): *Promise‹object›*

  * **stage**(`input`: Uint8Array): *Promise‹object›*

  * **watchJobs**(`handler`: function, ...`jobs`: string[]): *cancel*

  * **watchLogs**(`handler`: function, `cid`: string, ...`opts`: [WatchLogsOption](_ffs_options_.md#watchlogsoption)[]): *cancel*

* **health**(): *object*

  * **check**(): *Promise‹object›*

* **miners**(): *object*

  * **get**(): *Promise‹object›*

* **net**(): *object*

  * **connectPeer**(`peerInfo`: netTypes.PeerAddrInfo.AsObject): *Promise‹void›*

  * **connectedness**(`peerId`: string): *Promise‹object›*

  * **disconnectPeer**(`peerId`: string): *Promise‹void›*

  * **findPeer**(`peerId`: string): *Promise‹object›*

  * **listenAddr**(): *Promise‹object›*

  * **peers**(): *Promise‹object›*

* **reputation**(): *object*

  * **addSource**(`id`: string, `multiaddress`: string): *Promise‹void›*

  * **getTopMiners**(`limit`: number): *Promise‹object›*

* **setToken**: *setToken*

* **wallet**(): *object*

  * **balance**(`address`: string): *Promise‹object›*

  * **list**(): *Promise‹object›*

  * **newAddress**(`type`: "bls" | "secp256k1"): *Promise‹object›*

  * **sendFil**(`from`: string, `to`: string, `amount`: number): *Promise‹void›*
