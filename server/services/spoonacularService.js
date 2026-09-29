const BASE_URL = 'https://api.spoonacular.com';

async function spoonacularFetch(path, params = {}) {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    const error = new Error('Recipe search is not configured yet. Add a Spoonacular API key on the server.');
    error.status = 503;
    throw error;
  }
  const url = new URL(`${BASE_URL}${path}`);
  url.search = new URLSearchParams({ ...params, apiKey }).toString();
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(12000) });
  } catch (error) {
    const failure = new Error(error.name === 'TimeoutError' ? 'Recipe service timed out. Please try again.' : 'Recipe service is unavailable.');
    failure.status = 502;
    throw failure;
  }
  if (response.status === 429) {
    const error = new Error('Recipe search is busy. Please try again shortly.');
    error.status = 429;
    throw error;
  }
  if (!response.ok) {
    const error = new Error(response.status >= 500 ? 'Recipe service returned an error.' : 'Recipe search could not be completed.');
    error.status = response.status === 401 || response.status === 403 ? 503 : 502;
    throw error;
  }
  try { return await response.json(); } catch {
    const error = new Error('Recipe service returned an invalid response.');
    error.status = 502;
    throw error;
  }
}

export async function searchRecipes(ingredients, number = 12) {
  const data = await spoonacularFetch('/recipes/findByIngredients', {
    ingredients: ingredients.join(','), number: String(number), ranking: '2', ignorePantry: 'true',
  });
  if (!Array.isArray(data)) {
    const error = new Error('Recipe service returned an unexpected response.');
    error.status = 502;
    throw error;
  }
  return data.map((recipe) => ({
    id: recipe.id,
    title: recipe.title || 'Untitled recipe',
    image: recipe.image || '',
    usedIngredients: (Array.isArray(recipe.usedIngredients) ? recipe.usedIngredients : []).map((item) => item.name).filter(Boolean),
    missedIngredients: (Array.isArray(recipe.missedIngredients) ? recipe.missedIngredients : []).map((item) => item.name).filter(Boolean),
    unusedIngredients: (Array.isArray(recipe.unusedIngredients) ? recipe.unusedIngredients : []).map((item) => item.name).filter(Boolean),
  }));
}

export async function getRecipeDetails(id) {
  const recipe = await spoonacularFetch(`/recipes/${encodeURIComponent(id)}/information`, { includeNutrition: 'false' });
  if (!recipe || !recipe.id) {
    const error = new Error('Recipe details were not found.');
    error.status = 404;
    throw error;
  }
  return {
    id: recipe.id,
    title: recipe.title || 'Untitled recipe',
    image: recipe.image || '',
    summary: typeof recipe.summary === 'string' ? recipe.summary.replace(/<[^>]*>/g, '') : '',
    readyInMinutes: Number.isFinite(recipe.readyInMinutes) ? recipe.readyInMinutes : null,
    servings: Number.isFinite(recipe.servings) ? recipe.servings : null,
    ingredients: (Array.isArray(recipe.extendedIngredients) ? recipe.extendedIngredients : []).map((item) => item.original || item.name).filter(Boolean),
    instructions: typeof recipe.instructions === 'string' ? recipe.instructions.replace(/<[^>]*>/g, '') : '',
    sourceUrl: recipe.sourceUrl || '',
  };
}
