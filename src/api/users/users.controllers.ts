import argon2 from 'argon2';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { ParamIdType } from '../../utils/model';
import { prisma } from '../../utils/prisma';
import { UserCreateType, UserLoginType, UserUpdateType } from './users.model';

async function addUser(req: Request<unknown, unknown, UserCreateType['body']>, res: Response, next: NextFunction, subjectRequired: boolean) {
  try {
    const { id, name, email, password, subjectId, answers } = req.body;

    // check if user exists
    const ckUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (ckUser) {
      res.status(409);
      throw new Error(`User with id "${id}" was already registered.`);
    }

    if (subjectRequired && !subjectId) {
      res.status(400);
      throw new Error('Subject is required.');
    }

    // check if subject exists
    let answersMap: { questionId: string; value: string }[] | undefined = [];
    if (subjectId) {
      const ckSubject = await prisma.subject.findUnique({
        where: {
          id: subjectId,
        },
        include: {
          questions: true,
        },
      });

      if (subjectRequired || ckSubject) {
        if (!ckSubject) {
          res.status(404);
          throw new Error(`Subject with id "${subjectId}" not found.`);
        }

        // check if subject is published
        if (!ckSubject.startDate || ckSubject.startDate > new Date() || (ckSubject.endDate && ckSubject.endDate < new Date())) {
          res.status(403);
          throw new Error(`Subject with id "${subjectId}" is not published.`);
        }

        // check if all required questions are answered
        const requiredQuestions = ckSubject.questions.filter((question) => question.required);
        const answeredQuestions = answers?.length || 0;
        if (answeredQuestions < requiredQuestions.length) {
          res.status(400);
          throw new Error(`You must answer all required questions. ${requiredQuestions.length} questions are required, but you answered ${answeredQuestions}.`);
        }

        // map answers to questions
        answersMap = answers?.map((answer) => {
          const question = ckSubject.questions.find((item) => item.id === answer.questionId);

          if (!question) {
            res.status(404);
            throw new Error(`Question with id "${answer.questionId}" not found in subject with id "${subjectId}".`);
          }

          if (question.required && (!answer.value || answer.value === '')) {
            res.status(400);
            throw new Error(`Question with id "${answer.questionId}" is required.`);
          }

          return {
            questionId: answer.questionId,
            name: question.name,
            value: answer.value,
          };
        });
      }
    }

    // transaction for creating user and registration
    const randomPassword = Math.random().toString(36).slice(-8); // generate random password for user
    const hash = await argon2.hash(password || randomPassword);
    return await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          id,
          name,
          email,
          password: hash || '',
          registration: {
            create: {
              subject: subjectId ? { connect: { id: subjectId } } : undefined,
              data: answersMap ? JSON.stringify(answersMap) : undefined,
            },
          },
        },
      });

      return res.status(201).json({
        ...created,
        password: undefined,
      });
    });
  } catch (error) {
    next(error);
  }
}

export async function register(req: Request<unknown, unknown, UserCreateType['body']>, res: Response, next: NextFunction) {
  try {
    return await addUser(req, res, next, true);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request<unknown, unknown, UserLoginType['body']>, res: Response, next: NextFunction) {
  try {
    const { id, password } = req.body;

    // check if user exists
    const ckUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!ckUser) {
      res.status(404);
      throw new Error(`User with id "${id}" not found.`);
    }

    // check if password is correct
    const isPasswordCorrect = await argon2.verify(ckUser.password || '', password);

    if (!isPasswordCorrect) {
      res.status(401);
      throw new Error('Wrong password.');
    }

    //Sing JWT
    const token = jwt.sign(
      {
        id: ckUser.id,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: process.env.TOKEN_EXPIRES_IN!,
      },
    );

    //Send the jwt in the response
    return res.status(200).json({
      token,
    });
  } catch (error) {
    next(error);
  }
}

// Require Roles
export async function create(req: Request<unknown, unknown, UserCreateType['body']>, res: Response, next: NextFunction) {
  try {
    return await addUser(req, res, next, false);
  } catch (error) {
    next(error);
  }
}

export async function readAll(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany();

    return res.status(200).json(users.map((user) => ({ ...user, password: undefined })));
  } catch (error) {
    next(error);
  }
}

export async function readOne(req: Request<ParamIdType, unknown, unknown>, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        registration: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404);
      throw new Error(`User with id "${id}" not found.`);
    }

    return res.status(200).json({
      ...user,
      password: undefined,
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request<UserUpdateType['params'], unknown, UserUpdateType['body']>, res: Response, next: NextFunction) {
  try {
    console.log(req.params);
    const { id } = req.params;
    const { name, email, password, subjectId, approved } = req.body;

    // check if user exists
    const ckUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!ckUser) {
      res.status(404);
      throw new Error(`User with id "${id}" not found.`);
    }

    if (subjectId) {
      const ckSubject = await prisma.subject.findUnique({
        where: {
          id: subjectId,
        },
        include: {
          questions: true,
        },
      });

      if (!ckSubject) {
        res.status(404);
        throw new Error(`Subject with id "${subjectId}" not found.`);
      }
    }

    // transaction for updating user and registration
    const hash = await argon2.hash(password || '');
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: {
          id,
        },
        data: {
          name,
          email,
          password: password && password !== '' ? hash : undefined,
          registration: {
            update: {
              approved,
              subject: subjectId ? { connect: { id: subjectId } } : undefined,
            },
          },
        },
        include: {
          registration: {
            include: {
              subject: true,
            },
          },
        },
      });

      return res.status(200).json({
        ...updated,
        password: undefined,
      });
    });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request<ParamIdType, unknown, unknown>, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    // check if user exists
    const ckUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!ckUser) {
      res.status(404);
      throw new Error(`User with id "${id}" not found.`);
    }

    // delete user
    const deleted = await prisma.user.delete({
      where: {
        id,
      },
      include: {
        registration: {
          include: {
            subject: true,
          },
        },
      },
    });

    return res.status(200).json({
      ...deleted,
      password: undefined,
    });
  } catch (error) {
    next(error);
  }
}
