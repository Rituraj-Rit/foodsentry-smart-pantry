import { Router } from 'express';
import { body } from 'express-validator';
import { generate } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.post('/generate-recipe', requireAuth, [body('ingredients').isArray({ min: 1, max: 20 }).withMessage('Provide 1 to 20 ingredients.'), body('ingredients.*').isString().trim().isLength({ min: 1, max: 60 }), body('diet').optional().isString().isLength({ max: 60 }), body('cuisine').optional().isString().isLength({ max: 60 }), body('servings').isInt({ min: 1, max: 12 }).withMessage('Servings must be between 1 and 12.')], validate, asyncHandler(generate));
export default router;
