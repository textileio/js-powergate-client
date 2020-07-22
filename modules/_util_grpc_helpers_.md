[Powergate Client](../README.md) › [Globals](../globals.md) › ["util/grpc-helpers"](_util_grpc_helpers_.md)

# Module: "util/grpc-helpers"

## Index

### Variables

* [host](_util_grpc_helpers_.md#const-host)

### Functions

* [getTransport](_util_grpc_helpers_.md#const-gettransport)
* [promise](_util_grpc_helpers_.md#promise)
* [useToken](_util_grpc_helpers_.md#const-usetoken)

## Variables

### `Const` host

• **host**: *"http://0.0.0.0:6002"* = "http://0.0.0.0:6002"

*Defined in [src/util/grpc-helpers.ts:5](https://github.com/textileio/js-powergate-client/blob/master/src/util/grpc-helpers.ts#L5)*

## Functions

### `Const` getTransport

▸ **getTransport**(): *undefined | TransportFactory*

*Defined in [src/util/grpc-helpers.ts:45](https://github.com/textileio/js-powergate-client/blob/master/src/util/grpc-helpers.ts#L45)*

**Returns:** *undefined | TransportFactory*

___

###  promise

▸ **promise**‹**U**, **V**, **W**›(`handler`: function, `mapper`: function): *Promise‹W›*

*Defined in [src/util/grpc-helpers.ts:9](https://github.com/textileio/js-powergate-client/blob/master/src/util/grpc-helpers.ts#L9)*

**Type parameters:**

▪ **U**

▪ **V**

▪ **W**

**Parameters:**

▪ **handler**: *function*

▸ (`callback`: function): *void*

**Parameters:**

▪ **callback**: *function*

▸ (`error`: V | null, `resp`: U | null): *void*

**Parameters:**

Name | Type |
------ | ------ |
`error` | V &#124; null |
`resp` | U &#124; null |

▪ **mapper**: *function*

▸ (`resp`: U): *W*

**Parameters:**

Name | Type |
------ | ------ |
`resp` | U |

**Returns:** *Promise‹W›*

___

### `Const` useToken

▸ **useToken**(`initialToken?`: undefined | string): *object*

*Defined in [src/util/grpc-helpers.ts:27](https://github.com/textileio/js-powergate-client/blob/master/src/util/grpc-helpers.ts#L27)*

**Parameters:**

Name | Type |
------ | ------ |
`initialToken?` | undefined &#124; string |

**Returns:** *object*
