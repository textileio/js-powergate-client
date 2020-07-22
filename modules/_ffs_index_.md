[Powergate Client](../README.md) › [Globals](../globals.md) › ["ffs/index"](_ffs_index_.md)

# Module: "ffs/index"

## Index

### Functions

* [createFFS](_ffs_index_.md#const-createffs)

## Functions

### `Const` createFFS

▸ **createFFS**(`config`: [Config](../interfaces/_types_.config.md), `getMeta`: function): *object*

*Defined in [src/ffs/index.ts:17](https://github.com/textileio/js-powergate-client/blob/master/src/ffs/index.ts#L17)*

Creates the FFS API client

**Parameters:**

▪ **config**: *[Config](../interfaces/_types_.config.md)*

A config object that changes the behavior of the client

▪ **getMeta**: *function*

A function that returns request metadata

▸ (): *grpc.Metadata*

**Returns:** *object*

The FFS API client

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
