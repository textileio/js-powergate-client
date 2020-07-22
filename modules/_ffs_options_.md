[Powergate Client](../README.md) › [Globals](../globals.md) › ["ffs/options"](_ffs_options_.md)

# Module: "ffs/options"

## Index

### Type aliases

* [ListDealRecordsOption](_ffs_options_.md#listdealrecordsoption)
* [PushStorageConfigOption](_ffs_options_.md#pushstorageconfigoption)
* [WatchLogsOption](_ffs_options_.md#watchlogsoption)

### Functions

* [withAscending](_ffs_options_.md#const-withascending)
* [withDataCids](_ffs_options_.md#const-withdatacids)
* [withFromAddresses](_ffs_options_.md#const-withfromaddresses)
* [withHistory](_ffs_options_.md#const-withhistory)
* [withIncludeFinal](_ffs_options_.md#const-withincludefinal)
* [withIncludePending](_ffs_options_.md#const-withincludepending)
* [withJobId](_ffs_options_.md#const-withjobid)
* [withOverride](_ffs_options_.md#const-withoverride)
* [withStorageConfig](_ffs_options_.md#const-withstorageconfig)

## Type aliases

###  ListDealRecordsOption

Ƭ **ListDealRecordsOption**: *function*

*Defined in [src/ffs/options.ts:64](https://github.com/textileio/js-powergate-client/blob/master/src/ffs/options.ts#L64)*

#### Type declaration:

▸ (`req`: ListDealRecordsConfig): *void*

**Parameters:**

Name | Type |
------ | ------ |
`req` | ListDealRecordsConfig |

___

###  PushStorageConfigOption

Ƭ **PushStorageConfigOption**: *function*

*Defined in [src/ffs/options.ts:4](https://github.com/textileio/js-powergate-client/blob/master/src/ffs/options.ts#L4)*

#### Type declaration:

▸ (`req`: PushStorageConfigRequest): *void*

**Parameters:**

Name | Type |
------ | ------ |
`req` | PushStorageConfigRequest |

___

###  WatchLogsOption

Ƭ **WatchLogsOption**: *function*

*Defined in [src/ffs/options.ts:40](https://github.com/textileio/js-powergate-client/blob/master/src/ffs/options.ts#L40)*

#### Type declaration:

▸ (`res`: WatchLogsRequest): *void*

**Parameters:**

Name | Type |
------ | ------ |
`res` | WatchLogsRequest |

## Functions

### `Const` withAscending

▸ **withAscending**(`ascending`: boolean): *[ListDealRecordsOption](_ffs_options_.md#listdealrecordsoption)*

*Defined in [src/ffs/options.ts:121](https://github.com/textileio/js-powergate-client/blob/master/src/ffs/options.ts#L121)*

Specifies to sort the results in ascending order
Default is descending order
Records are sorted by timestamp

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`ascending` | boolean | Whether or not to sort the results in ascending order |

**Returns:** *[ListDealRecordsOption](_ffs_options_.md#listdealrecordsoption)*

The resulting option

___

### `Const` withDataCids

▸ **withDataCids**(...`cids`: string[]): *[ListDealRecordsOption](_ffs_options_.md#listdealrecordsoption)*

*Defined in [src/ffs/options.ts:82](https://github.com/textileio/js-powergate-client/blob/master/src/ffs/options.ts#L82)*

Limits the results to deals for the provided data cids

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`...cids` | string[] | The list of cids |

**Returns:** *[ListDealRecordsOption](_ffs_options_.md#listdealrecordsoption)*

The resulting option

___

### `Const` withFromAddresses

▸ **withFromAddresses**(...`addresses`: string[]): *[ListDealRecordsOption](_ffs_options_.md#listdealrecordsoption)*

*Defined in [src/ffs/options.ts:71](https://github.com/textileio/js-powergate-client/blob/master/src/ffs/options.ts#L71)*

Limits the results deals initiated from the provided wallet addresses

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`...addresses` | string[] | The list of addresses |

**Returns:** *[ListDealRecordsOption](_ffs_options_.md#listdealrecordsoption)*

The resulting option

___

### `Const` withHistory

▸ **withHistory**(`includeHistory`: boolean): *[WatchLogsOption](_ffs_options_.md#watchlogsoption)*

*Defined in [src/ffs/options.ts:47](https://github.com/textileio/js-powergate-client/blob/master/src/ffs/options.ts#L47)*

Control whether or not to include the history of log events

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`includeHistory` | boolean | Whether or not to include the history of log events |

**Returns:** *[WatchLogsOption](_ffs_options_.md#watchlogsoption)*

The resulting option

___

### `Const` withIncludeFinal

▸ **withIncludeFinal**(`includeFinal`: boolean): *[ListDealRecordsOption](_ffs_options_.md#listdealrecordsoption)*

*Defined in [src/ffs/options.ts:108](https://github.com/textileio/js-powergate-client/blob/master/src/ffs/options.ts#L108)*

Specifies whether or not to include final deals in the results
Default is false
Ignored for listRetrievalDealRecords

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`includeFinal` | boolean | Whether or not to include final deal records |

**Returns:** *[ListDealRecordsOption](_ffs_options_.md#listdealrecordsoption)*

The resulting option

___

### `Const` withIncludePending

▸ **withIncludePending**(`includePending`: boolean): *[ListDealRecordsOption](_ffs_options_.md#listdealrecordsoption)*

*Defined in [src/ffs/options.ts:95](https://github.com/textileio/js-powergate-client/blob/master/src/ffs/options.ts#L95)*

Specifies whether or not to include pending deals in the results
Default is false
Ignored for listRetrievalDealRecords

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`includePending` | boolean | Whether or not to include pending deal records |

**Returns:** *[ListDealRecordsOption](_ffs_options_.md#listdealrecordsoption)*

The resulting option

___

### `Const` withJobId

▸ **withJobId**(`jobId`: string): *[WatchLogsOption](_ffs_options_.md#watchlogsoption)*

*Defined in [src/ffs/options.ts:58](https://github.com/textileio/js-powergate-client/blob/master/src/ffs/options.ts#L58)*

Filter log events to only those associated with the provided job id

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`jobId` | string | The job id to show events for |

**Returns:** *[WatchLogsOption](_ffs_options_.md#watchlogsoption)*

The resulting option

___

### `Const` withOverride

▸ **withOverride**(`override`: boolean): *[PushStorageConfigOption](_ffs_options_.md#pushstorageconfigoption)*

*Defined in [src/ffs/options.ts:11](https://github.com/textileio/js-powergate-client/blob/master/src/ffs/options.ts#L11)*

Allows you to override an existing storage configuration

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`override` | boolean | Whether or not to override any existing storage configuration |

**Returns:** *[PushStorageConfigOption](_ffs_options_.md#pushstorageconfigoption)*

The resulting option

___

### `Const` withStorageConfig

▸ **withStorageConfig**(`config`: ffsTypes.StorageConfig.AsObject): *[PushStorageConfigOption](_ffs_options_.md#pushstorageconfigoption)*

*Defined in [src/ffs/options.ts:23](https://github.com/textileio/js-powergate-client/blob/master/src/ffs/options.ts#L23)*

Allows you to override the default storage config with a custom one

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`config` | ffsTypes.StorageConfig.AsObject | The storage configuration to use |

**Returns:** *[PushStorageConfigOption](_ffs_options_.md#pushstorageconfigoption)*

The resulting option
