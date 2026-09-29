import { useState } from 'react';
import { ArrowLeft, ArrowRight, Leaf } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

export default function AuthPage({ mode }) {
  const registering = mode === 'register';
  const { authenticate } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  function update(event) { setValues((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authenticate(registering ? 'register' : 'login', values);
      toast.success(registering ? 'Your pantry is ready.' : 'Welcome back.');
      navigate(params.get('next') || '/dashboard', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally { setLoading(false); }
  }
  return <main className="auth-screen"><section className="auth-story"><Logo light /><div className="auth-story-copy"><span className="eyebrow">A LITTLE LESS WASTE</span><h1>Keep good food<br />in good hands.</h1><p>FoodSentry helps you remember what you bought and find something lovely to cook with it.</p></div><div className="auth-story-bottom"><Leaf size={18} /><span>Your ingredients, thoughtfully looked after.</span></div></section><section className="auth-panel"><Link className="back-link" to="/"><ArrowLeft size={16} /> Back to home</Link><div className="auth-form-wrap"><span className="eyebrow">{registering ? 'MAKE ROOM FOR GOOD THINGS' : 'GOOD TO HAVE YOU BACK'}</span><h2>{registering ? 'Create your account' : 'Welcome back'}</h2><p className="auth-subtitle">{registering ? 'A more thoughtful pantry starts here.' : 'Sign in to pick up where you left off.'}</p><form className="auth-form" onSubmit={submit}>{registering && <label className="field">Your name<input name="name" value={values.name} onChange={update} autoComplete="name" required minLength="2" maxLength="80" /></label>}<label className="field">Email address<input type="email" name="email" value={values.email} onChange={update} autoComplete="email" required /></label><label className="field">Password<input type="password" name="password" value={values.password} onChange={update} autoComplete={registering ? 'new-password' : 'current-password'} required minLength={registering ? 8 : 1} maxLength="128" />{registering && <small>Use at least 8 characters.</small>}</label>{error && <p className="form-error" role="alert">{error}</p>}<Button className="auth-submit" type="submit" disabled={loading}>{loading ? 'One moment…' : registering ? 'Create account' : 'Sign in'} {!loading && <ArrowRight size={16} />}</Button></form><p className="auth-switch">{registering ? 'Already have an account?' : 'New to FoodSentry?'} <Link to={registering ? '/login' : '/register'}>{registering ? 'Sign in' : 'Create an account'}</Link></p></div><span className="auth-copyright">© {new Date().getFullYear()} FoodSentry</span></section></main>;
}
