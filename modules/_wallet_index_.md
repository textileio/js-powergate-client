[Powergate Client](../README.md) › [Globals](../globals.md) › ["wallet/index"](_wallet_index_.md)

# Module: "wallet/index"

## Index

### Functions

* [createWallet](_wallet_index_.md#const-createwallet)

## Functions

### `Const` createWallet

▸ **createWallet**(`config`: [Config](../interfaces/_types_.config.md)): *object*

*Defined in [src/wallet/index.ts:11](https://github.com/textileio/js-powergate-client/blob/master/src/wallet/index.ts#L11)*

Creates the Wallet API client

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`config` | [Config](../interfaces/_types_.config.md) | A config object that changes the behavior of the client |

**Returns:** *object*

The Wallet API client

* **balance**(`address`: string): *Promise‹object›*

* **list**(): *Promise‹object›*

* **newAddress**(`type`: "bls" | "secp256k1"): *Promise‹object›*

* **sendFil**(`from`: string, `to`: string, `amount`: number): *Promise‹void›*
