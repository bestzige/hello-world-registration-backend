import { Router } from 'express';

import { isAuth, isRoles, schemaValition } from '../../middlewares';
import { paramIdSchema } from '../../utils/model';
import * as SubjectHandlers from './subjects.controllers';
import { subjectCreateSchema, subjectUpdateSchema } from './subjects.model';

const router = Router();

router.get('/list', SubjectHandlers.list);
router.get('/info/:id', schemaValition(paramIdSchema), SubjectHandlers.info);

router.get('/', isAuth, isRoles(['ADMIN']), SubjectHandlers.readAll);
router.get('/:id', schemaValition(paramIdSchema), isAuth, isRoles(['ADMIN']), SubjectHandlers.readOne);
router.post('/', schemaValition(subjectCreateSchema), isAuth, isRoles(['ADMIN']), SubjectHandlers.create);
router.put('/:id', schemaValition(subjectUpdateSchema), isAuth, isRoles(['ADMIN']), SubjectHandlers.update);
router.delete('/:id', schemaValition(paramIdSchema), isAuth, isRoles(['ADMIN']), SubjectHandlers.remove);

export default router;
