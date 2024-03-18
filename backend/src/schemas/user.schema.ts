import { object, string, TypeOf } from "zod";

const createUserInputSchema = {
  body: object({
    username: string({
      required_error: "username is required",
    }),
    password: string({
      required_error: "password is required",
    }).min(8, "password too short - should be 8 chars minimum"),
  })
}

const createUserInput = object(createUserInputSchema)
export type CreateUserInput = TypeOf<typeof createUserInput>