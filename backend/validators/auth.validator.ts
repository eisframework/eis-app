import { Type } from '@sinclair/typebox'

export const registerSchema = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 100 }),
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8 }),
  passwordConfirmation: Type.String()
})

export const loginSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String()
})

export type RegisterInput = typeof registerSchema.static
export type LoginInput = typeof loginSchema.static
