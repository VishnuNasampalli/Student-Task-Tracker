import express from 'express';

const router = express.Router();

import { login, register, logout,checkUser } from '../controllers/auth.controller.js';
import { protectedRoute } from '../middlewares/protectedRoute.js';

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check-user', protectedRoute, checkUser);

export {router as authRoutes};