import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PlayersPage from './pages/PlayersPage';
import PlayerProfilePage from './pages/PlayerProfilePage';
import FinesPage from './pages/FinesPage';
import MyFinesPage from './pages/MyFinesPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import PublicFinesPage from './pages/PublicFinesPage';
import RulesPage from './pages/RulesPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <Routes>
      <Route path="/offentleg" element={<PublicFinesPage />} />
      <Route path="/reglar" element={<RulesPage isPublic />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/spelarar" element={<PlayersPage />} />
        <Route path="/spelarar/:id" element={<PlayerProfilePage />} />
        <Route path="/boter" element={<FinesPage />} />
        <Route path="/mine-boter" element={<MyFinesPage />} />
        <Route path="/toppliste" element={<LeaderboardPage />} />
        <Route path="/profil" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/botsystemreglar" element={<RulesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <SpeedInsights />
        <Analytics />
      </AuthProvider>
    </BrowserRouter>
  );
}
