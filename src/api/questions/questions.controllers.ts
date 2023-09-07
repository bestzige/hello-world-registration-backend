import { NextFunction, Request, Response } from 'express';
import { ParamIdType } from '../../utils/model';
import { prisma } from '../../utils/prisma';
import { QuestionCreateType } from './questions.model';

export async function create(req: Request<unknown, unknown, QuestionCreateType['body']>, res: Response, next: NextFunction) {
  try {
    const { name, description, subjectId, image, options, type, defaultValue } = req.body;

    const question = await prisma.question.create({
      data: {
        name,
        description,
        subjectId,
        image,
        options: options ? JSON.stringify(options) : undefined,
        type,
        defaultValue,
      },
    });

    return res.status(201).json(question);
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request<ParamIdType, unknown, QuestionCreateType['body']>, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, description, subjectId, image, options, type, defaultValue } = req.body;

    // check if question exists
    const ckQuestion = await prisma.question.findUnique({
      where: {
        id,
      },
    });

    if (!ckQuestion) {
      res.status(404);
      throw new Error(`Question with id "${id}" not found.`);
    }

    const question = await prisma.question.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        subjectId,
        image,
        options: options ? JSON.stringify(options) : undefined,
        type,
        defaultValue,
      },
    });

    return res.status(200).json(question);
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request<ParamIdType, unknown, unknown>, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    // check if question exists
    const ckQuestion = await prisma.question.findUnique({
      where: {
        id,
      },
    });

    if (!ckQuestion) {
      res.status(404);
      throw new Error(`Question with id "${id}" not found.`);
    }

    await prisma.question.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({ message: `Question with id "${id}" deleted.` });
  } catch (error) {
    next(error);
  }
}
