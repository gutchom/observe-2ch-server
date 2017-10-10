import * as path from 'path'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as session from 'express-session'
import * as passport from 'passport'

/**
 * Create database connection
 */
import { createClient } from 'redis'
export const redis = createClient('//' + process.env.REDIS_HOST as string + ':6379')

import 'reflect-metadata'
import { Sequelize } from 'sequelize-typescript'
import dbConfig from './config/config'
export const sequelize = new Sequelize(dbConfig[process.env.NODE_ENV as string])

/**
 * Create session store
 */
import * as connect from 'connect-redis'
const RedisStore = connect(session)

/**
 * Controllers (route handlers).
 */
import * as pageController from './controllers/page'
import * as apiController from './controllers/api'

/**
 * Create Express server.
 */
const app = express()

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'pug')
app.use(cookieParser('hoge'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  store: new RedisStore({
    client: redis,
    prefix: 'sid:',
  }),
}))
app.use(passport.initialize())
app.use(passport.session())
app.use((req, res, next) => {
  res.locals.user = req.user
  next()
})

/**
 * API keys and Passport configuration.
 */
import { isAuthenticated } from './config/passport'

/**
 * Primary app routes.
 */
app.route('/')
  .get(pageController.index)

app.route('/logout')
  .get(pageController.logout)
app.route('/api/search')
  .post(isAuthenticated, apiController.search)


/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/twitter', passport.authenticate('twitter'))
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/',
  failureRedirect: '/',
}))

/**
 * Start Express server.
 */
export const server = app.listen(app.get('port'), () => {
  console.log(('  App is running at http://localhost:%d in %s mode'), app.get('port'), app.get('env'))
  console.log('  Press CTRL-C to stop\n')
})

process.on('SIGINT', () => {
  server.close(() => {
    sequelize.close()
    redis.quit()
    setTimeout(() => process.exit(0), 300)
  })
})
