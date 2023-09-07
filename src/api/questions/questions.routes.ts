import { Router } from 'express';

import { isAuth, isRoles, schemaValition } from '../../middlewares';
import { paramIdSchema } from '../../utils/model';
import * as RegistrationHandlers from './questions.controllers';
import { questionCreateSchema, questionUpdateSchema } from './questions.model';

const router = Router();

router.post('/', schemaValition(questionCreateSchema), isAuth, isRoles(['ADMIN']), RegistrationHandlers.create);
router.put('/:id', schemaValition(questionUpdateSchema), isAuth, isRoles(['ADMIN']), RegistrationHandlers.update);
router.delete('/:id', schemaValition(paramIdSchema), isAuth, isRoles(['ADMIN']), RegistrationHandlers.remove);

export default router;
