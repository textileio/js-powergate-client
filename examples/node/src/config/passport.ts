import { NextFunction, Request, Response } from "express"
import passport from "passport"
import passportGithub from "passport-github2"
import oauth2 from "passport-oauth2"
import { findByGithubId, save, User } from "../models/user"
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "../util/env"

passport.serializeUser<User, string>((user, done) => {
  done(undefined, user.gitHubId)
})

passport.deserializeUser<User, string>(async (gitHubId, done) => {
  try {
    const user = await findByGithubId(gitHubId)
    done(undefined, user)
  } catch (e) {
    done(e)
  }
})

passport.use(
  new passportGithub.Strategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "http://127.0.0.1:3000/auth/github/callback",
    },
    async (
      _: string,
      __: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      profile: any,
      done: oauth2.VerifyCallback,
    ) => {
      try {
        let user: User = {
          gitHubId: profile.id,
          email: profile._json.email,
        }
        const existingUser = await findByGithubId(profile.id)
        if (existingUser) {
          user = { ...existingUser, ...user }
        }
        await save(user)
        return done(undefined, user)
      } catch (e) {
        done(e)
      }
    },
  ),
)

/**
 * Login Required middleware.
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect("/auth/github")
}
