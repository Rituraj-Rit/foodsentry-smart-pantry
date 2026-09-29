import { Router } from 'express';
import { query } from 'express-validator';
import { details, search } from '../controllers/recipeController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);
router.get('/search', [query('ingredients').isString().isLength({ min: 1, max: 1200 }).withMessage('Provide up to 20 ingredients.'), query('number').optional().isInt({ min: 1, max: 24 })], validate, asyncHandler(search));
router.get('/:id', asyncHandler(details));
export default router;
