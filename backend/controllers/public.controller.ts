import { view } from '../services/eta.service'
import type { ControllerContext } from '../../types/controller.types'

export const publicController = {
  async landing() {
    return view.render('index.html')
  },

  async home(ctx: ControllerContext) {
    return view.render('home.html')
  },

  async about(ctx: ControllerContext) {
    return view.render('about.html')
  },

  async pricing(ctx: ControllerContext) {
    return view.render('pricing.html')
  },

  async features(ctx: ControllerContext) {
    return view.render('features.html')
  },

  async contact(ctx: ControllerContext) {
    return view.render('contact.html')
  }
}
