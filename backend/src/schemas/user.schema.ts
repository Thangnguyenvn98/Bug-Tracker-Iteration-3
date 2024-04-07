import { object, string, TypeOf } from "zod";

export const createUserSchema = object({
  body: object({
    username: string({
      required_error: "username is required",
    }),
    password: string({
      required_error: "password is required",
    }).min(8, "password too short - should be 8 chars minimum"),
    passwordConfirmation: string({
      required_error: "passwordConfirmation is required",
    }),
    email: string({
      required_error: "Email is required",
    }).email("Not a valid email"),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  }),
});

export const loginUserSchema = object({
  body: object({
    username: string({
      required_error: "username is required",
    }),
    password: string({
      required_error: "password is required",
    }).min(8, "Password with 8 or more characters required"),
  }),
});

export type loginUser = TypeOf<typeof loginUserSchema>;
export type CreateUserInput = TypeOf<typeof createUserSchema>;
