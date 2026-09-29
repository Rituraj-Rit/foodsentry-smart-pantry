import { useEffect, useState } from 'react';
import { BellRing, CircleUserRound, LogOut, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import api, { getErrorMessage } from '../services/api';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(user?.emailNotificationsEnabled !== false);
  const [preferenceLoading, setPreferenceLoading] = useState(true);
  const [preferenceSaving, setPreferenceSaving] = useState(false);
  const [preferenceError, setPreferenceError] = useState('');
  useEffect(() => {
    let active = true;
    api.get('/notifications/preferences').then(({ data }) => {
      if (active) setEmailNotificationsEnabled(data.data.emailNotificationsEnabled);
    }).catch((error) => {
      if (active) setPreferenceError(getErrorMessage(error));
    }).finally(() => {
      if (active) setPreferenceLoading(false);
    });
    return () => { active = false; };
  }, []);
  async function updateEmailPreference(event) {
    const nextValue = event.target.checked;
    const previousValue = emailNotificationsEnabled;
    setEmailNotificationsEnabled(nextValue);
    setPreferenceSaving(true);
    setPreferenceError('');
    try {
      const { data } = await api.put('/notifications/preferences', { emailNotificationsEnabled: nextValue });
      setEmailNotificationsEnabled(data.data.emailNotificationsEnabled);
      updateUser({
        emailNotificationsEnabled: data.data.emailNotificationsEnabled,
        emailNotificationConsentGiven: data.data.emailNotificationConsentGiven,
      });
      toast.success('Email notification preference updated.');
    } catch (error) {
      setEmailNotificationsEnabled(previousValue);
      setPreferenceError(getErrorMessage(error));
    } finally {
      setPreferenceSaving(false);
    }
  }
  function signOut() { logout(); navigate('/'); }
  return <div className="page-container profile-page">
    <section className="page-heading-row"><div><span className="eyebrow">YOUR FOODSENTRY ACCOUNT</span><h1>Profile & settings</h1><p>Your account details and session settings.</p></div></section>
    <section className="profile-panel">
      <div className="profile-panel-title"><CircleUserRound size={20} /><div><h2>Account details</h2><p>Only you can see this information.</p></div></div>
      <div className="profile-info"><span className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</span><div><span>Name</span><strong>{user?.name}</strong></div><div><span>Email address</span><strong>{user?.email}</strong></div></div>
      <div className="profile-security"><ShieldCheck size={18} /><span>Your password is securely hashed and never displayed here.</span></div>
    </section>
    <section className="profile-panel notification-preferences">
      <div className="profile-panel-title"><BellRing size={20} /><div><h2>Notification Settings</h2><p>Choose which pantry reminders you receive.</p></div></div>
      <label className="notification-setting" htmlFor="expiry-email-toggle"><span><strong>Email expiry reminders</strong><small>One combined email 2 days before ingredients expire.</small></span><span className="notification-switch"><input id="expiry-email-toggle" type="checkbox" checked={emailNotificationsEnabled} onChange={updateEmailPreference} disabled={preferenceLoading || preferenceSaving} /><span aria-hidden="true" /></span><span className="notification-state">{emailNotificationsEnabled ? 'ON' : 'OFF'}</span></label>
      {preferenceLoading && <p className="preference-status">Loading notification preference…</p>}
      {preferenceSaving && <p className="preference-status" role="status">Saving…</p>}
      {preferenceError && <p className="preference-error" role="alert">{preferenceError}</p>}
    </section>
    <section className="profile-panel signout-panel"><div className="profile-panel-title"><LogOut size={19} /><div><h2>Sign out</h2><p>You'll need to sign in again to access your pantry.</p></div></div>{confirming ? <div className="profile-confirm"><span>Ready to sign out?</span><Button variant="secondary" onClick={() => setConfirming(false)}>Stay signed in</Button><Button variant="danger" onClick={signOut}>Sign out</Button></div> : <Button variant="secondary" onClick={() => setConfirming(true)}>Sign out</Button>}</section>
  </div>;
}
