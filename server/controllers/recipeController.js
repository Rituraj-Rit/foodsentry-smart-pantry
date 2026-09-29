import { searchRecipes, getRecipeDetails } from '../services/spoonacularService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function search(req, res) {
  const ingredients = [...new Set(req.query.ingredients.split(',').map((name) => name.trim().toLowerCase()).filter(Boolean))].slice(0, 20);
  if (!ingredients.length || ingredients.some((name) => name.length > 60)) {
    return res.status(400).json({ success: false, message: 'Provide between 1 and 20 valid ingredients.' });
  }
  const recipes = await searchRecipes(ingredients, Math.min(Number(req.query.number) || 12, 24));
  return sendSuccess(res, { recipes });
}

export async function details(req, res) {
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid recipe ID.' });
  return sendSuccess(res, { recipe: await getRecipeDetails(req.params.id) });
}
