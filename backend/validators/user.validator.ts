import { Type } from '@sinclair/typebox'

export const createUserSchema = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 100 }),
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8 })
})

export const updateUserSchema = Type.Partial(
  Type.Object({
    name: Type.String({ minLength: 2, maxLength: 100 }),
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8 })
  })
)

export type CreateUserInput = typeof createUserSchema.static
export type UpdateUserInput = typeof updateUserSchema.static
