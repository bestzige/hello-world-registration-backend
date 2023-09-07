import { QuestionFieldType } from '@prisma/client';
import * as z from 'zod';

export const questionCreateSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(255),
    description: z.string(),
    type: z
      .enum([
        QuestionFieldType.TEXT,
        QuestionFieldType.CHECKBOX,
        QuestionFieldType.COLOR,
        QuestionFieldType.DATE,
        QuestionFieldType.DATETIME,
        QuestionFieldType.EMAIL,
        QuestionFieldType.NUMBER,
        QuestionFieldType.PASSWORD,
        QuestionFieldType.RADIO,
        QuestionFieldType.RANGE,
        QuestionFieldType.TEL,
        QuestionFieldType.TIME,
        QuestionFieldType.URL,
        QuestionFieldType.WEEK,
        QuestionFieldType.TEXTAREA,
        QuestionFieldType.SELECT,
        QuestionFieldType.HIDDEN,
        QuestionFieldType.MONTH,
      ])
      .default(QuestionFieldType.TEXT)
      .optional(),
    defaultValue: z.string().optional(),
    options: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    image: z.string().or(z.literal('')).optional(),
    subjectId: z.string(),
  }),
});

export const questionUpdateSchema = z.object({
  body: questionCreateSchema.shape.body.partial(),
});

export type QuestionCreateType = z.infer<typeof questionCreateSchema>;
export type QuestionUpdateType = z.infer<typeof questionUpdateSchema>;
