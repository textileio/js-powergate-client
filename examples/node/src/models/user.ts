import { Database, open } from "sqlite"
import sqlite3 from "sqlite3"
import logger from "../util/logger"

let db: Database
;(async () => {
  try {
    db = await open({
      filename: ":memory:",
      driver: sqlite3.Database,
    })
    const create = `
            CREATE TABLE IF NOT EXISTS users (
                gitHubId TEXT NOT NULL PRIMARY KEY,
                email TEXT,
                authToken TEXT
            );
        `
    await db.run(create)
  } catch (e) {
    logger.error("Unable to create database.", e)
    process.exit(1)
  }
})()

export type User = {
  gitHubId: string
  email: string
  authToken?: string
}

export const findOne = async function (where: string): Promise<User | undefined> {
  const q = `SELECT gitHubId, email, authToken FROM users WHERE ${where}`
  const row = await db.get(q)
  if (!row) {
    return undefined
  } else {
    const user: User = {
      gitHubId: row.gitHubId,
      email: row.email,
      authToken: row.authToken,
    }
    return user
  }
}

export const findByGithubId = async function (gitHubId: string): Promise<User | undefined> {
  const q = "SELECT gitHubId, email, authToken FROM users WHERE gitHubId = ?"
  const row = await db.get(q, gitHubId)
  if (!row) {
    return undefined
  } else {
    const user: User = {
      gitHubId: row.gitHubId,
      email: row.email,
      authToken: row.authToken,
    }
    return user
  }
}

export const save = async function (user: User): Promise<void> {
  const existingUser = await findByGithubId(user.gitHubId)
  if (existingUser) {
    const sql = `
            UPDATE users
            SET email = ?,
                authToken = ?
            WHERE gitHubId = ?
        `
    await db.run(sql, user.email, user.authToken, user.gitHubId)
  } else {
    const sql = `
            INSERT INTO users(gitHubId, email, authToken)
            VALUES
                (?, ?, ?)
        `
    await db.run(sql, user.gitHubId, user.email, user.authToken)
  }
}

export const remove = async function (gitHubId: string): Promise<void> {
  const sql = "DELETE FROM users WHERE gitHubId = ?"
  await db.run(sql, gitHubId)
}
