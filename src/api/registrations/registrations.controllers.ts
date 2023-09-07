import { NextFunction, Request, Response } from 'express';
import { prisma } from '../../utils/prisma';

export async function readAll(req: Request, res: Response, next: NextFunction) {
  try {
    const registrations = await prisma.registration.findMany({
      include: {
        user: true,
        subject: true,
      },
    });

    return res.status(200).json(
      registrations.map((registration) => ({
        ...registration,
        user: {
          ...registration.user,
          password: undefined,
        },
      })),
    );
  } catch (error) {
    next(error);
  }
}
