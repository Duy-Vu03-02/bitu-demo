import express, { Router } from 'express';
import { UserController } from './user.controller';

const router = express.Router();

router.post('/auth/login', UserController.login);
router.post('/auth/register', UserController.register);
router.post('/auth/token', UserController.loginByToken);
router.post('/auth/logout', UserController.logout);

export default router;
