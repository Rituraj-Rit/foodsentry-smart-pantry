import { Router } from 'express';
import { body } from 'express-validator';
import { getPreferences, sendTestExpiryEmail, updatePreferences } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);
router.get('/preferences', asyncHandler(getPreferences));
router.put('/preferences', [
  body('emailNotificationsEnabled').isBoolean().withMessage('emailNotificationsEnabled must be true or false.'),
], validate, asyncHandler(updatePreferences));

if (process.env.NODE_ENV !== 'production') {
  router.post('/test-expiry-email', [
    body('pantryItemIds').isArray({ min: 1, max: 50 }).withMessage('Select 1 to 50 pantry items.'),
    body('pantryItemIds.*').isMongoId().withMessage('Each pantry item ID must be valid.'),
  ], validate, asyncHandler(sendTestExpiryEmail));
}

export default router;
