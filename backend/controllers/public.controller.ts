import { view } from '../services/eta.service'
import type { ControllerContext } from '../../types/controller.types'
import authService from '../services/auth.service'

export const publicController = {
  async landing() {
    return view.render('index.html')
  },

  async home({ inertia, user }: ControllerContext) {
    return inertia('home', { auth: { user } })
  },

  async about() {
    return view.render('about.html')
  },

  async pricing() {
    return view.render('pricing.html')
  },

  async features() {
    return view.render('features.html')
  },

  async contact() {
    return view.render('contact.html')
  }
}
