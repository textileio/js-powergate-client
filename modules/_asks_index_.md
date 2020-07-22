[Powergate Client](../README.md) › [Globals](../globals.md) › ["asks/index"](_asks_index_.md)

# Module: "asks/index"

## Index

### Functions

* [createAsks](_asks_index_.md#const-createasks)

## Functions

### `Const` createAsks

▸ **createAsks**(`config`: [Config](../interfaces/_types_.config.md)): *object*

*Defined in [src/asks/index.ts:12](https://github.com/textileio/js-powergate-client/blob/master/src/asks/index.ts#L12)*

Creates the Asks API client

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`config` | [Config](../interfaces/_types_.config.md) | A config object that changes the behavior of the client |

**Returns:** *object*

The Asks API client

* **get**(): *Promise‹object›*

* **query**(`query`: asksTypes.Query.AsObject): *Promise‹object›*
