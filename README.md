Powergate JS Client _(@textile/powergate-client)_
===

[![GitHub license](https://img.shields.io/github/license/textileio/js-powergate-client.svg)](./LICENSE)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/textileio/js-powergate-client.svg?style=popout-square)](./package.json)
[![npm (scoped)](https://img.shields.io/npm/v/@textile/powergate-client.svg?style=popout-square)](https://www.npmjs.com/package/@textile/powergate-client)
[![Release](https://img.shields.io/github/release/textileio/js-powergate-client.svg)](https://github.com/textileio/js-powergate-client/releases/latest)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg)](https://github.com/RichardLitt/standard-readme)

![Tests](https://github.com/textileio/js-powergate-client/workflows/Test/badge.svg)
[![Docs](https://github.com/textileio/js-powergate-client/workflows/Docs/badge.svg)](https://textileio.github.io/js-powergate-client)

> Typescript/Javascript client for Textile's [Powergate](https://github.com/textileio/powergate).

Use Powergate's multi-tiered file storage API built on Filecoin and IPFS from javascript environments such as Node, React Native, web browsers, and more.

## Table of Contents

- [Powergate JS Client _(@textile/powergate-client)_](#powergate-js-client-textilepowergate-client)
  - [Background](#background)
  - [Install](#install)
  - [Usage](#usage)
  - [API](#api)
  - [Maintainers](#maintainers)
  - [Contributing](#contributing)
  - [License](#license)

## Background

The Powergate JS Client is built on top of the [Powergate](https://github.com/textileio/powergate/) gRPC APIs and contains the logic that makes it straight-forward to build those APIs into JavaScript-based systems. Using the Powergate JS Client requires access to a running instance of the Powergate. Find details on [setting up the Powergate here](https://github.com/textileio/powergate/#installation).

The JS Client provides access to the full Powergate API and therefore, does not directly manage access-control. If you plan to use the Powergate JS Client in user-facing systems, we recommend running additional middleware.

## Install

```
npm i @textile/powergate-client
```

## Usage

Start by creating an instance of the client.

```typescript
import { createPow } from "@textile/powergate-client"

const host = "http://0.0.0.0:6002" // or whatever powergate instance you want

const pow = createPow({ host })
```

Many APIs are immediately available and don't require authorization.

```typescript
import { createPow } from "@textile/powergate-client"

const host = "http://0.0.0.0:6002" // or whatever powergate instance you want

const pow = createPow({ host })

async function exampleCode () {
  const { status, messagesList } = await pow.health.check()

  const { peersList } = await pow.net.peers()
}
```

Other APIs require authorization. The main API you'll interact with is the Filecoin File System (FFS), and it requires authorization. First, create a new FFS instance.

```typescript
import { createPow } from "@textile/powergate-client"

const host = "http://0.0.0.0:6002" // or whatever powergate instance you want

const pow = createPow({ host })

async function exampleCode () {
  const { token } = await pow.ffs.create() // save this token for later use!
  return token
}
```

Currently, the returned auth token is the only thing that gives you access to your FFS instance at a later time, so be sure to save it securely.

Once you have an auth token, either by creating a new FFS instance or by reading one you previously saved, set the auth token you'd like the Powergate client to use.

```typescript
import { createPow } from "@textile/powergate-client"

const host = "http://0.0.0.0:6002" // or whatever powergate instance you want

const pow = createPow({ host })

const authToken = '<generated token>'

pow.setToken(authToken)
```

Now, the FFS API is available for you to use.

```typescript
import { JobStatus } from "@textile/grpc-powergate-client/dist/ffs/rpc/rpc_pb"
import fs from "fs"
import { createPow } from "@textile/powergate-client"

const host = "http://0.0.0.0:6002" // or whatever powergate instance you want

const pow = createPow({ host })

async function exampleCode() {
  // get wallet addresses associated with your FFS instance
  const { addrsList } = await pow.ffs.addrs()

  // create a new address associated with your ffs instance
  const { addr } = await pow.ffs.newAddr("my new addr")

  // get general info about your ffs instance
  const { info } = await pow.ffs.info()

  // cache data in IPFS in preparation to store it using FFS
  const buffer = fs.readFileSync(`path/to/a/file`)
  const { cid } = await pow.ffs.stage(buffer)

  // store the data in FFS using the default storage configuration
  const { jobId } = await pow.ffs.pushStorageConfig(cid)

  // watch the FFS job status to see the storage process progressing
  const jobsCancel = pow.ffs.watchJobs((job) => {
    if (job.status === JobStatus.JOB_STATUS_CANCELED) {
      console.log("job canceled")
    } else if (job.status === JobStatus.JOB_STATUS_FAILED) {
      console.log("job failed")
    } else if (job.status === JobStatus.JOB_STATUS_SUCCESS) {
      console.log("job success!")
    }
  }, jobId)

  // watch all FFS events for a cid
  const logsCancel = pow.ffs.watchLogs((logEvent) => {
    console.log(`received event for cid ${logEvent.cid}`)
  }, cid)

  // get the current desired storage configuration for a cid (this configuration may not be realized yet)
  const { config } = await pow.ffs.getStorageConfig(cid)

  // get the current actual storage configuration for a cid
  const { cidInfo } = await pow.ffs.show(cid)

  // retrieve data from FFS by cid
  const bytes = await pow.ffs.get(cid)

  // send FIL from an address managed by your FFS instance to any other address
  await pow.ffs.sendFil(addrsList[0].addr, "<some other address>", 1000)
}
```

See the [Node.js example app](https://github.com/textileio/js-powergate-client/tree/master/examples/node) in this repository's `examples` directory.

There are also several useful examples included in the `*.spec.ts` files of this repo.

## API

You can read the [generated API docs](https://textileio.github.io/js-powergate-client/) to see the available Powergate API.

## Maintainers

[Textile](https://github.com/textileio)

## Contributing

See [the contributing file](CONTRIBUTING.md)!

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

[MIT](LICENSE) (c) 2020 Textile
