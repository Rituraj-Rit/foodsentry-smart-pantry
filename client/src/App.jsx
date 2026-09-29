import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { MotionConfig } from 'motion/react';
import 'react-toastify/dist/ReactToastify.css';
import AppShell from './layouts/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import EmailConsentPrompt from './components/EmailConsentPrompt';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const AIRecipe = lazy(() => import('./pages/AIRecipe'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Landing = lazy(() => import('./pages/Landing'));
const Pantry = lazy(() => import('./pages/Pantry'));
const Profile = lazy(() => import('./pages/Profile'));
const RecipeDetails = lazy(() => import('./pages/RecipeDetails'));
const Recipes = lazy(() => import('./pages/Recipes'));

function AppContent() {
  const { theme } = useTheme();
  return <MotionConfig reducedMotion="user"><BrowserRouter><AuthProvider><Suspense fallback={<div className="page-loading"><span className="spinner" />Loading FoodSentry…</div>}><Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route element={<ProtectedRoute />}><Route element={<AppShell />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/pantry" element={<Pantry />} />
      <Route path="/recipes" element={<Recipes />} />
      <Route path="/recipes/:id" element={<RecipeDetails />} />
      <Route path="/ai-recipe" element={<AIRecipe />} />
      <Route path="/profile" element={<Profile />} />
    </Route></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense><EmailConsentPrompt /><ToastContainer position="bottom-right" autoClose={4500} newestOnTop closeOnClick theme={theme} /></AuthProvider></BrowserRouter></MotionConfig>;
}

export default function App() {
  return <ThemeProvider><AppContent /></ThemeProvider>;
}
