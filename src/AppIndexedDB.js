import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContextIndexedDB';
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
import InstellingenIndexedDB from './components/instellingen/InstellingenIndexedDB';
import MigrationWizard from './components/migration/MigrationWizard';
import { getMigrationStatus } from './utils/migratieIndexedDB';

function App() {
  const [showMigration, setShowMigration] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check of migratie nodig is
    const status = getMigrationStatus();

    if (status.migrated) {
      // Al gemigreerd, toon app direct
      setShowMigration(false);
    } else {
      // Check of er localStorage data is
      try {
        const localStorageData = localStorage.getItem('levenstracker-data');
        if (!localStorageData || localStorageData === 'null') {
          // Geen localStorage data, geen migratie nodig
          setShowMigration(false);
          // Markeer als gemigreerd zodat deze check niet meer gebeurt
          const { setMigrationStatus } = require('./utils/migratieIndexedDB');
          setMigrationStatus(true);
        }
      } catch (error) {
        console.error('Error checking localStorage:', error);
        setShowMigration(false);
      }
    }

    setChecking(false);
  }, []);

  const handleMigrationComplete = () => {
    setShowMigration(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Controleren...</div>
      </div>
    );
  }

  return (
    <AppProvider>
      <ThemeProvider>
        {showMigration ? (
          <MigrationWizard onComplete={handleMigrationComplete} />
        ) : (
          <BrowserRouter>
            <Routes>
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
                <Route path="instellingen" element={<InstellingenIndexedDB />} />
              </Route>
            </Routes>
          </BrowserRouter>
        )}
      </ThemeProvider>
    </AppProvider>
  );
}

export default App;
