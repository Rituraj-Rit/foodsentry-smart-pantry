import { Router } from 'express';
import { body } from 'express-validator';
import { currentUser, login, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.post('/register', [body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.'), body('email').trim().isEmail().withMessage('Enter a valid email address.'), body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters.')], validate, asyncHandler(register));
router.post('/login', [body('email').trim().isEmail().withMessage('Enter a valid email address.'), body('password').isString().notEmpty().withMessage('Password is required.')], validate, asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(currentUser));
export default router;
