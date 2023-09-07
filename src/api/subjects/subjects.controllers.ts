import { NextFunction, Request, Response } from 'express';
import { ParamIdType } from '../../utils/model';
import { prisma } from '../../utils/prisma';
import { SubjectCreateType } from './subjects.model';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    return res.status(200).json(subjects);
  } catch (error) {
    next(error);
  }
}

export async function info(req: Request<ParamIdType, unknown, unknown>, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: {
        id,
      },
      include: {
        questions: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!subject) {
      res.status(404);
      throw new Error(`Subject with id "${id}" not found.`);
    }

    return res.status(200).json(subject);
  } catch (error) {
    next(error);
  }
}

export async function readAll(req: Request, res: Response, next: NextFunction) {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    return res.status(200).json(subjects);
  } catch (error) {
    next(error);
  }
}

export async function readOne(req: Request<ParamIdType, unknown, unknown>, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!subject) {
      res.status(404);
      throw new Error(`Subject with id "${id}" not found.`);
    }

    return res.status(200).json(subject);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request<unknown, unknown, SubjectCreateType['body']>, res: Response, next: NextFunction) {
  try {
    const { name, description, id, background, image, startDate, endDate, registrationLimit, acceptingLimit } = req.body;

    const subject = await prisma.subject.create({
      data: {
        id,
        name,
        description,
        background,
        image,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        registrationLimit,
        acceptingLimit,
      },
    });

    return res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request<ParamIdType, unknown, SubjectCreateType['body']>, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, description, background, image, startDate, endDate, registrationLimit, acceptingLimit } = req.body;

    // check if subject exists
    const ckSubject = await prisma.subject.findUnique({
      where: {
        id,
      },
    });

    if (!ckSubject) {
      res.status(404);
      throw new Error(`Subject with id "${id}" not found.`);
    }

    const subject = await prisma.subject.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        background,
        image,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        registrationLimit,
        acceptingLimit,
      },
    });

    return res.status(200).json(subject);
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request<ParamIdType, unknown, unknown>, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    // check if subject exists
    const ckSubject = await prisma.subject.findUnique({
      where: {
        id,
      },
    });

    if (!ckSubject) {
      res.status(404);
      throw new Error(`Subject with id "${id}" not found.`);
    }

    await prisma.subject.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({ message: `Subject with id "${id}" deleted.` });
  } catch (error) {
    next(error);
  }
}
