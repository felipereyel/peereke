import express from 'express';

import auth from '../../middleware/auth';

import register from './register';
import login from './login';
import oneUser from './oneUser';
import allUsers from './allUsers';

const router = express.Router();

router.put('/', register);
router.post('/login', login);

router.get('/:id', auth, oneUser);
router.get('/', auth, allUsers);

export default router;
