import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContextSupabase';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/common/Layout';
import Dashboard from './components/dashboard/Dashboard';
import Dagboek from './components/dagboek/Dagboek';
import Verzameling from './components/verzameling/Verzameling';
import Ideeen from './components/ideeen/Ideeen';
import Kalender from './components/kalender/Kalender';
import Gewoontes from './components/gewoontes/Gewoontes';
import Doelen from './components/doelen/Doelen';
import Reflectie from './components/reflectie/Reflectie';
import Overzichten from './components/overzichten/Overzichten';
import Voeding from './components/voeding/Voeding';
import Instellingen from './components/instellingen/Instellingen';
import Login from './components/auth/Login';

const ProtectedRoute = () => {
  const { session, loading } = useApp();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Laden...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <AppContextProviderWithRouter />
  );
}

function AppContextProviderWithRouter() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="dagboek" element={<Dagboek />} />
                <Route path="verzameling" element={<Verzameling />} />
                <Route path="ideeen" element={<Ideeen />} />
                <Route path="kalender" element={<Kalender />} />
                <Route path="gewoontes" element={<Gewoontes />} />
                <Route path="doelen" element={<Doelen />} />
                <Route path="reflectie" element={<Reflectie />} />
                <Route path="overzichten" element={<Overzichten />} />
                <Route path="voeding" element={<Voeding />} />
                <Route path="instellingen" element={<Instellingen />} />
              </Route>
            </Route>
          </Routes>
        </ThemeProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
