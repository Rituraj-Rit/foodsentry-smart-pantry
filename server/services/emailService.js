import nodemailer from 'nodemailer';

let transporter;

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function formatDate(value, timeZone = 'UTC') {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone,
  }).format(new Date(value));
}

export function buildExpiryReminderEmail(userName, expiringItems, clientUrl = 'http://localhost:5173', daysRemaining = 2) {
  const safeName = escapeHtml(userName || 'there');
  const pantryUrl = `${clientUrl.replace(/\/$/, '')}/pantry`;
  const reminderDays = daysRemaining;
  const reminderText = reminderDays === 0 ? 'today' : reminderDays === 1 ? '1 day' : `${reminderDays} days`;
  const subject = reminderDays === 0
    ? 'FoodSentry Reminder: Your food expires today ⚠️'
    : reminderDays === 1
      ? 'FoodSentry Reminder: Your food expires tomorrow ⚠️'
      : `FoodSentry Reminder: Your food expires in ${reminderText} ⚠️`;
  const itemRows = expiringItems.map((item) => {
    const name = escapeHtml(item.name);
    const unit = item.unit === 'litre' && Number(item.quantity) !== 1 ? 'litres' : item.unit;
    const quantity = escapeHtml(`${item.quantity} ${unit}`);
    const expiryDate = escapeHtml(formatDate(item.expiryDate, 'UTC'));
    return `<tr><td style="padding:12px 10px;border-bottom:1px solid #e7ece6;color:#26382d;font-size:14px">${name}</td><td style="padding:12px 10px;border-bottom:1px solid #e7ece6;color:#59675c;font-size:13px">${quantity}</td><td style="padding:12px 10px;border-bottom:1px solid #e7ece6;color:#a7503f;font-size:13px">${expiryDate}</td></tr>`;
  }).join('');
  const textItems = expiringItems.map((item) => {
    const unit = item.unit === 'litre' && Number(item.quantity) !== 1 ? 'litres' : item.unit;
    return `- ${item.name} — ${item.quantity} ${unit} (expires ${formatDate(item.expiryDate, 'UTC')})`;
  }).join('\n');
  const plural = expiringItems.length === 1 ? 'ingredient' : 'ingredients';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@media(max-width:600px){.email-shell{width:100%!important}.email-pad{padding:24px 18px!important}.email-title{font-size:23px!important}}</style></head><body style="margin:0;padding:0;background:#f4f6f1;font-family:Arial,Helvetica,sans-serif;color:#26382d"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f1;padding:24px 10px"><tr><td align="center"><table role="presentation" class="email-shell" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e3e9e1;border-radius:8px;overflow:hidden"><tr><td style="padding:20px 30px;background:#244d38;color:#ffffff"><span style="font-size:18px;font-weight:700;letter-spacing:.2px">FoodSentry</span><span style="float:right;font-size:12px;color:#dce9dc">A thoughtful pantry</span></td></tr><tr><td class="email-pad" style="padding:34px 32px 28px"><p style="margin:0 0 9px;color:#788579;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase">A FRIENDLY PANTRY REMINDER</p><h1 class="email-title" style="margin:0 0 15px;color:#244d38;font-size:27px;line-height:1.25">A few ingredients need your attention</h1><p style="margin:0 0 22px;color:#536157;font-size:15px;line-height:1.65">Hello ${safeName},</p><p style="margin:0 0 18px;color:#536157;font-size:14px;line-height:1.65">The following ${plural} in your FoodSentry pantry will expire in ${escapeHtml(reminderText)}:</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><thead><tr><th align="left" style="padding:10px;color:#768176;background:#f5f7f3;font-size:11px;text-transform:uppercase">Ingredient</th><th align="left" style="padding:10px;color:#768176;background:#f5f7f3;font-size:11px;text-transform:uppercase">Quantity</th><th align="left" style="padding:10px;color:#768176;background:#f5f7f3;font-size:11px;text-transform:uppercase">Expiry date</th></tr></thead><tbody>${itemRows}</tbody></table><p style="margin:22px 0;color:#536157;font-size:14px;line-height:1.65">Please consider using these ingredients soon to reduce food waste.</p><p style="margin:0 0 24px;color:#536157;font-size:14px;line-height:1.65">Open FoodSentry and discover recipes using these ingredients.</p><table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#345f45" style="border-radius:5px"><a href="${escapeHtml(pantryUrl)}" style="display:inline-block;padding:13px 20px;border:1px solid #345f45;border-radius:5px;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none">View My Pantry</a></td></tr></table><p style="margin:28px 0 0;color:#657166;font-size:13px;line-height:1.6">Regards,<br><strong>FoodSentry</strong></p></td></tr><tr><td style="padding:15px 30px;border-top:1px solid #e7ece6;color:#899389;font-size:11px;line-height:1.5">You received this reminder because email expiry notifications are enabled in your FoodSentry profile.</td></tr></table></td></tr></table></body></html>`;
  const text = `Hello ${userName || 'there'},\n\nThe following ${plural} in your FoodSentry pantry will expire in ${reminderText}:\n\n${textItems}\n\nPlease consider using these ingredients soon to reduce food waste.\n\nOpen FoodSentry and discover recipes using these ingredients: ${pantryUrl}\n\nRegards,\nFoodSentry`;
  return { subject, text, html };
}

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    const error = new Error('Email reminders are not configured. Set EMAIL_USER and EMAIL_APP_PASSWORD on the server.');
    error.code = 'EMAIL_CONFIG_MISSING';
    throw error;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD },
    });
  }
  return transporter;
}

export async function sendExpiryReminderEmail(userEmail, userName, expiringItems, options = {}) {
  if (!Array.isArray(expiringItems) || expiringItems.length === 0) {
    throw new TypeError('At least one expiring pantry item is required.');
  }
  const message = buildExpiryReminderEmail(
    userName,
    expiringItems,
    options.clientUrl || process.env.CLIENT_URL || 'http://localhost:5173',
    options.daysRemaining ?? 2,
  );
  return getTransporter().sendMail({
    from: { name: 'FoodSentry', address: process.env.EMAIL_USER },
    to: userEmail,
    ...message,
  });
}
