import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { createPantryItem, deletePantryItem, getPantryItem, listPantry, updatePantryItem } from '../controllers/pantryController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { CATEGORIES, UNITS } from '../models/PantryItem.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const itemFields = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1 to 100 characters.'),
  body('category').optional().isIn(CATEGORIES).withMessage('Choose a valid category.'),
  body('quantity').optional().isFloat({ min: 0.01, max: 100000 }).withMessage('Quantity must be a positive number.'),
  body('unit').optional().isIn(UNITS).withMessage('Choose a valid unit.'),
  body('purchaseDate').optional().isISO8601().withMessage('Purchase date must be a valid date.'),
  body('expiryDate').optional().isISO8601().withMessage('Expiry date must be a valid date.'),
  body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters.'),
];
const createFields = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1 to 100 characters.'),
  body('category').optional().isIn(CATEGORIES).withMessage('Choose a valid category.'),
  body('quantity').isFloat({ min: 0.01, max: 100000 }).withMessage('Quantity must be a positive number.'),
  body('unit').optional().isIn(UNITS).withMessage('Choose a valid unit.'),
  body('purchaseDate').optional().isISO8601().withMessage('Purchase date must be a valid date.'),
  body('expiryDate').isISO8601().withMessage('Enter a valid expiry date.'),
  body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters.'),
];
router.use(requireAuth);
router.get('/', [query('search').optional().isString().isLength({ max: 100 }), query('sort').optional().isIn(['expiry', 'name', 'recent']), query('status').optional().isIn(['ALL', 'EXPIRED', 'EXPIRING_SOON', 'EXPIRING_THIS_WEEK', 'FRESH']), query('category').optional().isIn(['ALL', ...CATEGORIES])], validate, asyncHandler(listPantry));
router.post('/', createFields, validate, asyncHandler(createPantryItem));
router.get('/:id', [param('id').isMongoId()], validate, asyncHandler(getPantryItem));
router.put('/:id', [param('id').isMongoId(), ...itemFields], validate, asyncHandler(updatePantryItem));
router.delete('/:id', [param('id').isMongoId()], validate, asyncHandler(deletePantryItem));
export default router;
