import * as z from 'zod';
import { paramIdSchema } from '../../utils/model';

export const userLoginSchema = z.object({
  body: z.object({
    id: z.string().min(11).max(11),
    password: z.string().min(1).max(255),
  }),
});

export const userCreateSchema = z.object({
  body: z.object({
    id: z.string().min(11).max(11),
    name: z.string().min(3).max(255),
    email: z.string().email(),
    password: z.string().min(1).max(255).or(z.literal('')).optional(),
    subjectId: z.string().optional(),
    answers: z
      .array(
        z.object({
          questionId: z.string(),
          value: z.string(),
        }),
      )
      .optional(),
  }),
});

export const userUpdateSchema = paramIdSchema.merge(
  z.object({
    body: userCreateSchema.shape.body
      .omit({
        id: true,
      })
      .partial()
      .merge(
        z.object({
          approved: z.boolean().optional(),
        }),
      ),
  }),
);

export type UserCreateType = z.infer<typeof userCreateSchema>;
export type UserUpdateType = z.infer<typeof userUpdateSchema>;
export type UserLoginType = z.infer<typeof userLoginSchema>;
