import { useState } from 'react';
import { CircleUserRound, LogOut, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  function signOut() { logout(); navigate('/'); }
  return <div className="page-container profile-page"><section className="page-heading-row"><div><span className="eyebrow">YOUR FOODSentRY ACCOUNT</span><h1>Profile & settings</h1><p>Your account details and session settings.</p></div></section><section className="profile-panel"><div className="profile-panel-title"><CircleUserRound size={20} /><div><h2>Account details</h2><p>Only you can see this information.</p></div></div><div className="profile-info"><span className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</span><div><span>Name</span><strong>{user?.name}</strong></div><div><span>Email address</span><strong>{user?.email}</strong></div></div><div className="profile-security"><ShieldCheck size={18} /><span>Your password is securely hashed and never displayed here.</span></div></section><section className="profile-panel signout-panel"><div className="profile-panel-title"><LogOut size={19} /><div><h2>Sign out</h2><p>You'll need to sign in again to access your pantry.</p></div></div>{confirming ? <div className="profile-confirm"><span>Ready to sign out?</span><Button variant="secondary" onClick={() => setConfirming(false)}>Stay signed in</Button><Button variant="danger" onClick={signOut}>Sign out</Button></div> : <Button variant="secondary" onClick={() => setConfirming(true)}>Sign out</Button>}</section></div>;
}
