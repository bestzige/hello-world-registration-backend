import * as z from 'zod';

export const subjectCreateSchema = z.object({
  body: z.object({
    id: z.string().min(1).max(255),
    name: z.string().min(3).max(255),
    description: z.string(),
    image: z.string().or(z.literal('')).optional(),
    background: z.string().or(z.literal('')).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    registrationLimit: z.number().default(-1),
    acceptingLimit: z.number().default(-1),
  }),
});

export const subjectUpdateSchema = z.object({
  body: subjectCreateSchema.shape.body
    .omit({
      id: true,
    })
    .partial(),
});

export type SubjectCreateType = z.infer<typeof subjectCreateSchema>;
export type SubjectUpdateType = z.infer<typeof subjectUpdateSchema>;
