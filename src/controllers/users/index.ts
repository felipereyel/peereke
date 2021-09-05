import express from 'express';

import auth from '../../middleware/auth';

import register from './register';
import login from './login';
import listUsers from './listUsers';

const router = express.Router();

router.put('/', register);
router.post('/login', login);
router.get('/', auth, listUsers);

export default router;
