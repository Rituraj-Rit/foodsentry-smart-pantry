import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppShell from './layouts/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AIRecipe from './pages/AIRecipe';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Pantry from './pages/Pantry';
import Profile from './pages/Profile';
import RecipeDetails from './pages/RecipeDetails';
import Recipes from './pages/Recipes';

export default function App() {
  return <BrowserRouter><AuthProvider><Routes>
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
  </Routes><ToastContainer position="bottom-right" autoClose={4500} newestOnTop closeOnClick theme="light" /></AuthProvider></BrowserRouter>;
}
