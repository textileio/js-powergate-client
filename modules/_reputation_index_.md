[Powergate Client](../README.md) › [Globals](../globals.md) › ["reputation/index"](_reputation_index_.md)

# Module: "reputation/index"

## Index

### Functions

* [createReputation](_reputation_index_.md#const-createreputation)

## Functions

### `Const` createReputation

▸ **createReputation**(`config`: [Config](../interfaces/_types_.config.md)): *object*

*Defined in [src/reputation/index.ts:11](https://github.com/textileio/js-powergate-client/blob/master/src/reputation/index.ts#L11)*

Creates the Reputation API client

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`config` | [Config](../interfaces/_types_.config.md) | A config object that changes the behavior of the client |

**Returns:** *object*

The Reputation API client

* **addSource**(`id`: string, `multiaddress`: string): *Promise‹void›*

* **getTopMiners**(`limit`: number): *Promise‹object›*
