import express from 'express';

import MessageResponse from '../interfaces/MessageResponse';
import questions from './questions/questions.routes';
import registrations from './registrations/registrations.routes';
import subjects from './subjects/subjects.routes';
import users from './users/users.routes';

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/users', users);
router.use('/registrations', registrations);
router.use('/subjects', subjects);
router.use('/questions', questions);

export default router;
