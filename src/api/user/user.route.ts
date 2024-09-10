import express, { Request, Response } from 'express';
import { UserController } from './user.controller';

const router = express.Router();

router.post('/auth/login', UserController.login);
router.post('/auth/register', UserController.register);
router.post('/auth/token', UserController.loginByToken);
router.post('/auth/logout', UserController.logout);
router.post('/auth/forgot-pass', UserController.forgotPassword);
router.post('/auth/verify-otp', UserController.verifyOTP);

export default router;
