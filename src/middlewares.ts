/* eslint-disable @typescript-eslint/indent */
import { NextFunction, Request, Response } from 'express';

import { UserRole } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { AnyZodObject, ZodError } from 'zod';
import ErrorResponse from './interfaces/ErrorResponse';
import { prisma } from './utils/prisma';

export const schemaValition = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    next();
  } catch (error) {
    console.log(error);
    if (error instanceof ZodError) {
      return res.status(400).json(
        error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        })),
      );
    }
    return res.status(400).json({ message: 'internal server error' });
  }
};

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1] || '';
  if (!token || token === '') {
    res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    res.locals.user = decoded;
  } catch (error) {
    return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
  }

  // const { id } = decoded as { id: string };
  // const newToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET!, {
  //   expiresIn: process.env.TOKEN_EXPIRES_IN!,
  // });
  // res.setHeader('Authorization', `Bearer ${newToken}`);

  next();
};

export const isRoles = (roles: UserRole[]) => async (req: Request, res: Response, next: NextFunction) => {
  const { id } = res.locals.user;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return res.status(401).json({ message: 'ไม่พบผู้ใช้งาน' });
  }

  if (!roles.includes(user.role)) {
    return res.status(403).json({ message: 'ไม่มีสิทธิ์ในการเข้าถึง' });
  }

  next();
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response<ErrorResponse>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};
