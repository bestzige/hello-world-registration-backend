import { Router } from 'express';

import { isAuth, isRoles, schemaValition } from '../../middlewares';
import { paramIdSchema } from '../../utils/model';
import * as UserHandlers from './users.controllers';
import { userCreateSchema, userLoginSchema, userUpdateSchema } from './users.model';

const router = Router();

router.post('/login', schemaValition(userLoginSchema), UserHandlers.login);
router.post('/register', schemaValition(userCreateSchema), UserHandlers.register);

router.get('/', isAuth, isRoles(['ADMIN']), UserHandlers.readAll);
router.get('/:id', schemaValition(paramIdSchema), isAuth, isRoles(['ADMIN']), UserHandlers.readOne);
router.post('/', schemaValition(userCreateSchema), isAuth, isRoles(['ADMIN']), UserHandlers.create);
router.put('/:id', schemaValition(userUpdateSchema), isAuth, isRoles(['ADMIN']), UserHandlers.update);
router.delete('/:id', schemaValition(paramIdSchema), isAuth, isRoles(['ADMIN']), UserHandlers.remove);

export default router;
