import mongoose from 'mongoose';

export const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Grains', 'Snacks', 'Spices', 'Beverages', 'Other'];
export const UNITS = ['kg', 'g', 'litre', 'ml', 'pieces', 'packets', 'bottles', 'cans'];

const pantryItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
  category: { type: String, enum: CATEGORIES, default: 'Other' },
  quantity: { type: Number, required: true, min: 0.01, max: 100000 },
  unit: { type: String, enum: UNITS, default: 'pieces' },
  purchaseDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  notes: { type: String, trim: true, maxlength: 500, default: '' },
}, { timestamps: true });

pantryItemSchema.index({ userId: 1, expiryDate: 1 });
pantryItemSchema.index({ userId: 1, name: 1 });

export default mongoose.model('PantryItem', pantryItemSchema);
