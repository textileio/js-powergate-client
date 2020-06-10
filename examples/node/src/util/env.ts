import dotenv from "dotenv"
import fs from "fs"
import logger from "./logger"

if (fs.existsSync(".env")) {
  logger.debug("Using .env file to supply config environment variables")
  dotenv.config({ path: ".env" })
} else {
  logger.debug("Using .env.example file to supply config environment variables")
  dotenv.config({ path: ".env.example" }) // you can delete this after you create your own .env file!
}

export const ENV = process.env.NODE_ENV
export const PROD = ENV === "production" // Anything else is treated as 'dev'

export const EXPRESS_PORT = process.env["EXPRESS_PORT"]

export const POW_HOST = process.env["POW_HOST"]

export const SESSION_SECRET = mustResolve("SESSION_SECRET")

export const GITHUB_CLIENT_ID = mustResolve("GITHUB_CLIENT_ID")

export const GITHUB_CLIENT_SECRET = mustResolve("GITHUB_CLIENT_SECRET")

function mustResolve(name: string) {
  const value = process.env[name]
  if (!value) {
    logger.error(`No value for ${name}. Set ${name} environment variable.`)
    return process.exit(1)
  }
  return value
}
