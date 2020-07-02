# Powergate + Node.js Example

This example project shows one way you can integrate Textile's [Powergate](https://github.com/textileio/powergate) into a Node.js Express web application. The project skeleton was based on the [Microsoft TypeScript Node Starter](https://github.com/microsoft/TypeScript-Node-Starter) repo, so please reference that repo for general information about getting setup with Node, TypeScript, and related tooling.

# Table of Contents:

- [Pre-reqs](#pre-reqs)
- [Getting started](#getting-started)
- [How it Works](#how-it-works)
- [Relevant Project Structure](#relevant-project-structure)

# Pre-Reqs
To build and run this app locally you will need a few things:
- Install [Node.js](https://nodejs.org/en/)
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)

# Getting Started
Clone the repository.

```
git clone --depth=1 https://github.com/textileio/js-powergate-client.git
```

Install dependencies for this example project.

```
cd js-powergate-client/examples/node
npm install
```

This example uses GitHub as an authentication provider, so you'll need to generate a new OAuth app in your GitHub developer settings and take note of the generated client id and secret.

Copy `env.example` to `.env` and update `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` with the values from the above step.

**Note:** Be sure not to commit your `.env` file to any public repository because it contains application secrets.

This example app needs to connect to a Powergate instance, so update `.env` with your `POW_HOST` address. This would correspond to an instance of Powergate you have running somewhere. 

**- OR -**

Easily fire up a local Powergate instance in localnet mode (along with its dependencies of IPFS and Lotus) using Docker. In the root of this example project's parent repo, run:

```
npm run localnet:up
```

The default settings for `POW_HOST` will connect to this locally running Powergate instance.

Next, start up the example Node.js app. Back in the root of this example app, run:

```
npm run build
npm start
```

Finally, navigate to `http://localhost:3000` and you should see the app being running locally!

# How it Works

Powergate is designed to be integrated into other applications. The primary Powergate API is called Filecoin File System (FFS), and Powergate can create and manage one or many FFS instances. These FFS instances map nicely onto the concept of "users" in a typical application -- Each user is given a FFS instance that manages their set of wallet addresses and the data they store in Powergate. This example app demonstrates that exact setup using GitHub OAuth as an authentication provider, creating an FFS instance for each authenticated user, and persisting the association between users and FFS instances.

There are many things you can do with the FFS API as well as the other APIs provided by the Powergate client, but the keys to the integration shown in this example app are as follows:

On the main landing page of the web app, we render some basic information about the Powergate instance using some of our Powergate client `pow`'s APIs. These API calls aren't associated with a particular user and don't require any authentication:

```typescript
const [respPeers, respAddr, respHealth, respMiners] = await Promise.all([
  pow.net.peers(),
  pow.net.listenAddr(),
  pow.health.check(),
  pow.miners.get(),
])
```

Here is the code from `src/models/user.ts` that defines our `User` model:

```typescript
type User = {
  gitHubId: string
  email: string
  ffsToken?: string
}
```

`gitHubId` is provided by the GitHub OAuth mechanism. `ffsToken` is a token provided by Powergate when we create a new FFS instance and is uniquely associated with that single FFS instance. We save off the user `email` that comes back from the GitHub authentication just to have something nice to display in the we UI.

Most of the magic happens after a user authenticates and we recognize that they don't yet have a FFS instance created. From the authentication callback middleware in `app.ts`, after a user is successfully authenticated and we see they are a new user with no FFS instance:

```typescript
const createResp = await pow.ffs.create()
user.ffsToken = createResp.token
await save(user)
pow.setToken(user.ffsToken)
```

Using our Powergate client `pow`, we create a new FFS instance, set the `ffsToken` property of our user with the token that was returned, and save our user in the underlying SQLite database. We then pass the same token into our Powergate client's `setToken` function so that the client, by default, will communicate with this user's FFS instance. Whenever a previously created user authenticates again, the persisted FFS token with be set on the Powergate client using `setToken` and they will resume using their unique FFS instance.

# Relevant Project Structure

Below, we point out some important pieces of the project and how they relate to our integration of Powergate. Refer to the [Microsoft TypeScript Node Starter](https://github.com/microsoft/TypeScript-Node-Starter) for a full description of all project contents.

| Name                       | Description                                                                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **src/config**/passport.ts | [Passport](http://www.passportjs.org) configuration to authenticate to GitHub and establish user identity                                     |
| **src/models**/user.ts     | Our `User` definition and persistence API                                                                                                     |
| **src**/app.ts             | Entry point and router for the Express app plus interactions with the Powergate client API                                                    |
| **views**                  | Views to render basic information about the Powergate instance and user                                                                       |
| .env.example               | Example API keys, tokens, passwords, and Powergate connection info. Copy this to `.env` and customize, but don't check it in to public repos. |
| package.json               | File that contains npm dependencies including the Powergate client `@textile/powergate-client`                                                |

# License
Copyright (c) Textile. All rights reserved.
Licensed under the [MIT](LICENSE.txt) License.
