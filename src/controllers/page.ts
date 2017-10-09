import { Request, Response } from 'express'

export let index = (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.render('app.pug', { userInfo: JSON.stringify({ ...req.user }) })
  } else {
    res.render('home.pug')
  }
  return
}

export let logout = (req: Request, res: Response) => {
  req.logout()
  res.redirect('/')
  return
}
