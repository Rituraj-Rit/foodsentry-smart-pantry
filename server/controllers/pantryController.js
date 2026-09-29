import PantryItem from '../models/PantryItem.js';
import { getExpiryStatus } from '../utils/expiry.js';
import { sendSuccess } from '../utils/apiResponse.js';

function withStatus(item) {
  const value = item.toObject ? item.toObject() : item;
  return { ...value, expiryStatus: getExpiryStatus(value.expiryDate) };
}

export async function listPantry(req, res) {
  const query = { userId: req.user.id };
  if (req.query.search) query.name = { $regex: req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  const sortOptions = {
    expiry: { expiryDate: 1 }, name: { name: 1 }, recent: { createdAt: -1 },
  };
  const items = await PantryItem.find(query).sort(sortOptions[req.query.sort] || sortOptions.expiry);
  const filtered = req.query.status && req.query.status !== 'ALL'
    ? items.filter((item) => getExpiryStatus(item.expiryDate) === req.query.status)
    : items;
  return sendSuccess(res, { items: filtered.map(withStatus) });
}

export async function getPantryItem(req, res) {
  const item = await PantryItem.findOne({ _id: req.params.id, userId: req.user.id });
  if (!item) return res.status(404).json({ success: false, message: 'Pantry item not found.' });
  return sendSuccess(res, { item: withStatus(item) });
}

export async function createPantryItem(req, res) {
  const item = await PantryItem.create({ ...req.body, userId: req.user.id });
  return sendSuccess(res, { item: withStatus(item) }, 201);
}

export async function updatePantryItem(req, res) {
  const allowed = ['name', 'category', 'quantity', 'unit', 'purchaseDate', 'expiryDate', 'notes'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const item = await PantryItem.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id }, updates,
    { new: true, runValidators: true },
  );
  if (!item) return res.status(404).json({ success: false, message: 'Pantry item not found.' });
  return sendSuccess(res, { item: withStatus(item) });
}

export async function deletePantryItem(req, res) {
  const item = await PantryItem.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!item) return res.status(404).json({ success: false, message: 'Pantry item not found.' });
  return sendSuccess(res, { id: item.id });
}
