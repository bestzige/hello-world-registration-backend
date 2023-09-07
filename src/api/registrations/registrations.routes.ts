import { Router } from 'express';

import { isAuth, isRoles } from '../../middlewares';
import * as RegistrationHandlers from './registrations.controllers';

const router = Router();

router.get('/', isAuth, isRoles(['ADMIN', 'STAFF']), RegistrationHandlers.readAll);

export default router;
