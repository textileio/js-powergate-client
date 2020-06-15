import { createPow } from "@textile/powergate-client"
import express from "express"
import session from "express-session"
import passport from "passport"
import path from "path"
import * as passportConfig from "./config/passport"
import { save, User } from "./models/user"
import { EXPRESS_PORT, POW_HOST, SESSION_SECRET } from "./util/env"

// Create the Powergate client
const pow = createPow({ host: POW_HOST })

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
    const [respPeers, respAddr, respHealth, respMiners] = await Promise.all([
      pow.net.peers(),
      pow.net.listenAddr(),
      pow.health.check(),
      pow.miners.get(),
    ])
    res.render("home", {
      title: "Home",
      peers: respPeers.peersList,
      listenAddr: respAddr.addrInfo,
      health: respHealth,
      miners: respMiners.index,
    })
  } catch (e) {
    next(e)
  }
})

app.get("/user", passportConfig.isAuthenticated, async (_, res, next) => {
  try {
    const info = await pow.ffs.info()
    res.render("user", {
      title: "User",
      info: info.info,
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
      if (user.ffsToken) {
        pow.setToken(user.ffsToken)
        return next()
      } else {
        try {
          const createResp = await pow.ffs.create()
          user.ffsToken = createResp.token
          await save(user)
          pow.setToken(user.ffsToken)
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
