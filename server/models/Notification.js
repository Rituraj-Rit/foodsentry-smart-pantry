import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pantryItemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PantryItem', required: true }],
  type: { type: String, enum: ['expiry_2_days'], required: true },
  scheduledFor: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'sending', 'sent', 'failed'], required: true, default: 'pending' },
  sentAt: { type: Date, default: null },
  lastErrorCode: { type: String, maxlength: 80, default: null },
}, { timestamps: true });

notificationSchema.index({ userId: 1, type: 1, scheduledFor: 1 }, { unique: true });
notificationSchema.index({ status: 1, scheduledFor: 1 });

export default mongoose.model('Notification', notificationSchema);
