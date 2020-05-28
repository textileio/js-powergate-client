# Powergate JS Client _(@textile/powergate-client)_

[![GitHub license](https://img.shields.io/github/license/textileio/js-powergate-client.svg)](./LICENSE)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/textileio/js-powergate-client.svg?style=popout-square)](./package.json)
[![npm (scoped)](https://img.shields.io/npm/v/@textile/powergate-client.svg?style=popout-square)](https://www.npmjs.com/package/@textile/powergate-client)
[![Release](https://img.shields.io/github/release/textileio/js-powergate-client.svg)](https://github.com/textileio/js-powergate-client/releases/latest)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg)](https://github.com/RichardLitt/standard-readme)

![Tests](https://github.com/textileio/js-powergate-client/workflows/Test/badge.svg)
[![Docs](https://github.com/textileio/js-powergate-client/workflows/Docs/badge.svg)](https://textileio.github.io/js-powergate-client)

> Typesctipt/Javascript client for Textile's [Powergate](https://github.com/textileio/powergate).

Use Powergate's multitiered file storage API built on Filecoin and IPFS from javascript environments such as Node, React Native, web browsers, and more.

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Background

TODO

## Install

```
npm i @textile/powergate-client
```

## Usage

Start by creating an instance of the client.

```typescript
import { createPow } from '@textile/powergate-client'

const host = 'http://0.0.0.0:6002' // or whatever powergate instance you want

const pow = createPow({ host })
```

Many APIs are immediately available and don't require authorization.

```typescript
const { status, messageList } = await pow.health.check()

const { peersList } = await pow.net.peers()
```

Other APIs require authorization. The main API you'll interact with is the Filecoin File System (FFS), and it requires authorization. First, create a new FFS instance.

```typescript
const { token } = await pow.ffs.create() // save this token for later use!
```

Currently, the returned auth token is the only thing that gives you access to your FFS instance at a later time, so be sure to save it securely.

Once you have an auth token, either by creating a new FFS instance or by reading one you previously saved, set the auth token you'd like the Powergate client to use.

```typescript
pow.setToken(authToken)
```

Now, the FFS API is available for you to use.

```typescript
import fs from 'fs'

// get wallet addresses associated with your FFS instance
const { addrsList } = await pow.ffs.addrs()

// create a new address associated with your ffs instance
const { addr } = await pow.ffs.newAddr('my new addr')

// get general info about your ffs instance
const { info } = await pow.ffs.info()

// cache data in IPFS in preparation to store it using FFS
const buffer = fs.readFileSync(`path/to/a/file`)
const { cid } = await pow.ffs.addToHot(buffer)

// store the data in FFS using the default storage configuration
const { jobId } = await pow.ffs.pushConfig(cid)

// watch the FFS job status to see the storage process progressing
const cancel = pow.ffs.watchJobs((job) => {
  if (job.status === JobStatus.CANCELED) {
    console.log('job canceled')
  } else if (job.status === JobStatus.FAILED) {
    console.log('job failed')
  } else if (job.status === JobStatus.SUCCESS) {
    console.log('job success!')
  }
}, jobId)

// watch all FFS events for a cid
const cancel = pow.ffs.watchLogs((logEvent) => {
  console.log(`received event for cid ${logEvent.cid}`)
}, cid)

// get the current desired storage configuration for a cid (this configuration may not be realized yet)
const { config } = await pow.ffs.getCidConfig(cid)

// get the current actual storage configuration for a cid
const { cidinfo } = await pow.ffs.show(cid)

// retreive data from FFS by cid
const bytes = await pow.ffs.get(cid)

// senf FIL from an address managed by your FFS instance to any other address
await pow.ffs.sendFil(addrsList[0].addr, '<some other address>', 1000)
```

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
