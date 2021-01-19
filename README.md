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

Most Powergate APIs require authorization in the form of a user auth token. Users are created using the `admin` API. Powergate's backend may be configured to secure the `admin` API with an auth token, and in that case, you'll neeed to set the admin auth token on the client as shown below.

```typescript
import { createPow } from "@textile/powergate-client"

const host = "http://0.0.0.0:6002" // or whatever powergate instance you want

const pow = createPow({ host })

// Set the admin auth token if required.
pow.setAdminToken("<an admin auth token>")

async function exampleCode () {
  const { user } = await pow.admin.users.create() // save this token for later use!
  return user?.token
}
```

The returned auth token is the only thing that gives access to the corresponding user at a later time, so be sure to save it securely.

A user auth token can later be set for the Powergate client so that the client authenticates with the user associated with the auth token.

```typescript
import { createPow } from "@textile/powergate-client"

const host = "http://0.0.0.0:6002" // or whatever powergate instance you want

const pow = createPow({ host })

const token = "<previously generated user auth token>"

pow.setToken(token)
```

Now, all authenticated APIs are available for you to use.

```typescript
import fs from "fs"
import { createPow, powTypes } from "@textile/powergate-client"

const host = "http://0.0.0.0:6002" // or whatever powergate instance you want

const pow = createPow({ host })

async function exampleCode() {
  // get wallet addresses associated with the user
  const { addressesList } = await pow.wallet.addresses()

  // create a new address associated with the user
  const { address } = await pow.wallet.newAddress("my new address")

  // get build information about the powergate server
  const res = await pow.buildInfo()

  // cache data in IPFS in preparation to store it
  const buffer = fs.readFileSync(`path/to/a/file`)
  const { cid } = await pow.data.stage(buffer)

  // store the data using the default storage configuration
  const { jobId } = await pow.storageConfig.apply(cid)

  // watch the job status to see the storage process progressing
  const jobsCancel = pow.storageJobs.watch((job) => {
    if (job.status === powTypes.JobStatus.JOB_STATUS_CANCELED) {
      console.log("job canceled")
    } else if (job.status === powTypes.JobStatus.JOB_STATUS_FAILED) {
      console.log("job failed")
    } else if (job.status === powTypes.JobStatus.JOB_STATUS_SUCCESS) {
      console.log("job success!")
    }
  }, jobId)

  // watch all log events for a cid
  const logsCancel = pow.data.watchLogs((logEvent) => {
    console.log(`received event for cid ${logEvent.cid}`)
  }, cid)

  // get information about the latest applied storage configuration,
  // current storage state, and all related Powegate storage jobs
  const { cidInfo } = await pow.data.cidInfo(cid)

  // retrieve data stored in the user by cid
  const bytes = await pow.data.get(cid)

  // send FIL from an address managed by the user to any other address
  await pow.wallet.sendFil(addressesList[0].address, "<some other address>", BigInt(1000))
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
