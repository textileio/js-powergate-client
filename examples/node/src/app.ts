import { createPow } from "@textile/powergate-client"
import express from "express"
import session from "express-session"
import passport from "passport"
import path from "path"
import * as passportConfig from "./config/passport"
import { save, User } from "./models/user"
import { EXPRESS_PORT, POW_ADMIN_TOKEN, POW_HOST, SESSION_SECRET } from "./util/env"

// Create the Powergate client
const pow = createPow({ host: POW_HOST })
if (POW_ADMIN_TOKEN) {
  pow.setAdminToken(POW_ADMIN_TOKEN)
}

// Create Express server
const app = express()

// Express configuration
app.set("port", EXPRESS_PORT || 3000)
app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }))
app.set("views", path.join(__dirname, "../views"))
app.set("view engine", "pug")
app.use(session({ resave: false, saveUninitialized: false, secret: SESSION_SECRET }))
app.use(passport.initialize())
app.use(passport.session())
app.use((req, res, next) => {
  res.locals.user = req.user
  next()
})

/**
 * Primary app routes.
 */
app.get("/", async (_, res, next) => {
  try {
    const { buildDate, gitBranch, gitCommit, gitState, gitSummary, version } = await pow.buildInfo()
    const host = pow.host
    res.render("home", {
      title: "Home",
      host,
      buildDate,
      gitBranch,
      gitCommit,
      gitState,
      gitSummary,
      version,
    })
  } catch (e) {
    next(e)
  }
})

app.get("/user", passportConfig.isAuthenticated, async (_, res, next) => {
  try {
    const { id } = await pow.userId()
    const { addressesList } = await pow.wallet.addresses()
    res.render("user", {
      title: "User",
      id,
      addressesList,
    })
  } catch (e) {
    next(e)
  }
})

app.get("/logout", (req, res) => {
  req.logout()
  res.redirect("/")
})

/**
 * OAuth authentication routes. (Sign in)
 */
app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }))
app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  async (req, _, next) => {
    if (req.user) {
      const user = req.user as User
      if (user.authToken) {
        pow.setToken(user.authToken)
        return next()
      } else {
        try {
          const createResp = await pow.admin.users.create()
          user.authToken = createResp.user?.token
          await save(user)
          if (user.authToken) {
            pow.setToken(user.authToken)
          } else {
            throw new Error("no auth token for user")
          }
          next()
        } catch (e) {
          next(e)
        }
      }
    } else {
      next(new Error("no user found in session"))
    }
  },
  (_, res) => {
    res.redirect("/user")
  },
)

export default app
