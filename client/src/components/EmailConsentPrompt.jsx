import { useState } from 'react';
import { BellRing, ShieldCheck } from 'lucide-react';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import api, { getErrorMessage } from '../services/api';

export default function EmailConsentPrompt() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const visible = user && user.emailNotificationConsentGiven !== true;

  async function choosePreference(enabled) {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put('/notifications/preferences', { emailNotificationsEnabled: enabled });
      updateUser({
        emailNotificationsEnabled: data.data.emailNotificationsEnabled,
        emailNotificationConsentGiven: data.data.emailNotificationConsentGiven,
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  if (!visible) return null;
  return <div className="modal-backdrop consent-backdrop">
    <section className="form-modal email-consent-panel" role="dialog" aria-modal="true" aria-labelledby="email-consent-title" aria-describedby="email-consent-description">
      <span className="consent-icon"><BellRing size={22} /></span>
      <span className="eyebrow">A FRIENDLY PANTRY REMINDER</span>
      <h2 id="email-consent-title">Would you like to receive email reminders 2 days before your ingredients expire?</h2>
      <p id="email-consent-description">We’ll send one email with the ingredients that share an expiry date. You can change this preference later in Profile.</p>
      <div className="consent-privacy"><ShieldCheck size={15} /><span>Email only. No browser notification permission is needed.</span></div>
      {error && <p className="preference-error" role="alert">{error}</p>}
      <div className="consent-actions">
        <Button onClick={() => choosePreference(true)} disabled={saving}>{saving ? 'Saving…' : 'Yes, notify me'}</Button>
        <Button variant="secondary" onClick={() => choosePreference(false)} disabled={saving}>No, maybe later</Button>
      </div>
    </section>
  </div>;
}
