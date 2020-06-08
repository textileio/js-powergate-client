# Powergate + Node.js Example

This example project shows one way you can integrate Textile's [Powergate](https://github.com/textileio/powergate) into a Node.js Express web application. The project skeleton was based on the [Microsoft TypeScript Node Starter](https://github.com/microsoft/TypeScript-Node-Starter) repo, so please reference that repo for general information about getting setup with Node, TypeScript, and related tooling.

# Table of Contents:

- [Pre-reqs](#pre-reqs)
- [Getting started](#getting-started)
- [Relevant Project Structure](#relevant-project-structure)

# Pre-Reqs
To build and run this app locally you will need a few things:
- Install [Node.js](https://nodejs.org/en/)
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)

# Getting Started
- Clone the repository
```
git clone --depth=1 https://github.com/textileio/js-powergate-client.git
```
- Install dependencies
```
cd js-powergate-client/examples/node
npm install
```
- With Docker already running, build and run the project
```
npm run build
npm start
```

Finally, navigate to `http://localhost:3000` and you should see the app being running locally!

Note: Something about using the Dockerized powergate or how to override it

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

## License
Copyright (c) Textile. All rights reserved.
Licensed under the [MIT](LICENSE.txt) License.
