import * as z from 'zod';

export const paramIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export type ParamIdType = z.infer<typeof paramIdSchema>['params'];
