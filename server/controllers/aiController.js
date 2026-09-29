import PantryItem from '../models/PantryItem.js';
import { generateRecipe } from '../services/geminiService.js';
import { getExpiryStatus } from '../utils/expiry.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function generate(req, res) {
  const ingredients = [...new Set(req.body.ingredients.map((name) => name.trim()).filter(Boolean))].slice(0, 20);
  if (!ingredients.length) return res.status(400).json({ success: false, message: 'Add at least one ingredient.' });
  const pantryItems = await PantryItem.find({ userId: req.user.id }).select('name expiryDate');
  const expired = pantryItems.filter((item) => getExpiryStatus(item.expiryDate) === 'EXPIRED');
  const expiredNames = new Set(expired.map((item) => item.name.toLowerCase()));
  const unsafe = ingredients.filter((name) => expiredNames.has(name.toLowerCase()));
  if (unsafe.length) {
    return res.status(400).json({ success: false, message: `Remove expired ingredients before generating a recipe: ${unsafe.join(', ')}.` });
  }
  const recipe = await generateRecipe({
    ingredients,
    diet: req.body.diet?.trim().slice(0, 60) || '',
    cuisine: req.body.cuisine?.trim().slice(0, 60) || '',
    servings: Number(req.body.servings),
  });
  return sendSuccess(res, { recipe });
}
