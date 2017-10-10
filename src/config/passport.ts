import * as passport from 'passport'
import { Profile, Strategy as TwitterStrategy } from 'passport-twitter'
import { Request, Response, NextFunction } from 'express'
import User from '../models/User'

const callbackURL = process.env.NODE_ENV === 'production'
  ? 'https://observe2ch.gutchom.com/auth/twitter/callback'
  : 'http://localhost:8080/auth/twitter/callback'

export interface TwitterProfile extends Profile {
  id: string
  token: string
  username: string
  displayName: string
}

passport.serializeUser<any, any>((user, done) => {
  done(undefined, user.id)
})

passport.deserializeUser((id: number, done) => {
  User.findOne({where: {uid: id}})
    .then((user: User) => done(null, user.get({plain: true})))
    .catch(err => done(err, undefined))
})

/**
 * Sign in with Twitter.
 */
passport.use(new TwitterStrategy({
  consumerKey: process.env.OBSERVE2CH_TWITTER_CONSUMER as string,
  consumerSecret: process.env.OBSERVE2CH_TWITTER_CONSUMER_SECRET as string,
  callbackURL,
}, (token, tokenSecret, profile, done) => {
  console.log(profile)
  User
    .findOrCreate({
      where: {uid: profile.id},
      defaults: {
        uid: profile.id,
        token,
        user_name: profile.username,
        display_name: profile.displayName,
        profile_image_url: typeof profile.photos === 'undefined' ? '' : profile.photos[0].value,
      }
    })
    .spread((user: User, created) => {
      if (created) {
        done(null, profile)
      } else {
        user.uid = profile.id
        user.token = token
        user.user_name = profile.username
        user.display_name = profile.displayName
        user.profile_image_url = typeof profile.photos === 'undefined' ? '' : profile.photos[0].value
        user.save()
          .then(() => done(null, profile))
          .catch(console.error)
      }
    })
    .catch(console.error)
}))

/**
 * Login Required middleware.
 */
export let isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/')
}
