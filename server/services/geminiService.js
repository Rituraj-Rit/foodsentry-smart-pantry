import { buildRecipePrompt } from './geminiPrompt.js';

function normalizeRecipe(candidate, servings, availableIngredients) {
  if (!candidate || typeof candidate !== 'object') return null;
  const strings = (value) => Array.isArray(value) ? value.filter((entry) => typeof entry === 'string' && entry.trim()).slice(0, 20) : [];
  const available = availableIngredients.map((name) => name.toLowerCase());
  const ingredients = Array.isArray(candidate.ingredients)
    ? candidate.ingredients.filter((item) => item && typeof item.name === 'string').slice(0, 30).map((item) => {
      const name = item.name.trim().slice(0, 100);
      const provided = available.some((providedName) => providedName === name.toLowerCase() || providedName.includes(name.toLowerCase()) || name.toLowerCase().includes(providedName));
      return {
        name,
        amount: typeof item.amount === 'string' ? item.amount.trim().slice(0, 60) : '',
        optional: item.optional === true || !provided,
      };
    })
    : [];
  if (typeof candidate.title !== 'string' || !candidate.title.trim() || ingredients.length === 0) return null;
  const nutrition = candidate.nutrition && typeof candidate.nutrition === 'object' ? candidate.nutrition : {};
  const text = (value, fallback = 'Not provided') => typeof value === 'string' ? value.trim().slice(0, 100) : fallback;
  return {
    title: candidate.title.trim().slice(0, 120),
    description: text(candidate.description, ''),
    ingredients,
    instructions: strings(candidate.instructions),
    prepTime: text(candidate.prepTime),
    cookTime: text(candidate.cookTime),
    servings,
    nutrition: {
      calories: text(nutrition.calories), protein: text(nutrition.protein),
      carbs: text(nutrition.carbs), fat: text(nutrition.fat),
    },
  };
}

export async function generateRecipe(options) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error('AI recipes are not configured yet. Add a Gemini API key on the server.');
    error.status = 503;
    throw error;
  }
  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const url = new URL(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`);
  url.searchParams.set('key', apiKey);
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: buildRecipePrompt(options) }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.6 },
      }),
    });
  } catch (error) {
    const failure = new Error(error.name === 'TimeoutError' ? 'AI recipe generation timed out.' : 'AI recipe service is unavailable.');
    failure.status = 502;
    throw failure;
  }
  if (response.status === 429) {
    const error = new Error('AI recipe generation is busy. Please try again shortly.');
    error.status = 429;
    throw error;
  }
  if (!response.ok) {
    const error = new Error(response.status >= 500 ? 'AI recipe service returned an error.' : 'AI recipe generation could not be completed.');
    error.status = response.status === 401 || response.status === 403 ? 503 : 502;
    throw error;
  }
  const payload = await response.json().catch(() => null);
  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
  if (!text) {
    const error = new Error('AI returned an empty recipe. Please try again.');
    error.status = 502;
    throw error;
  }
  let parsed;
  try {
    parsed = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ''));
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { parsed = JSON.parse(match[0]); } catch { parsed = null; }
    }
  }
  const recipe = normalizeRecipe(parsed, options.servings, options.ingredients);
  if (!recipe || !recipe.instructions.length) {
    const error = new Error('AI returned a recipe in an unexpected format. Please try again.');
    error.status = 502;
    throw error;
  }
  return recipe;
}
