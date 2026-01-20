import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContextIndexedDB';
import { useTheme } from '../../contexts/ThemeContext';
import { requestNotificationPermission, sendTestNotification } from '../../utils/notifications';
import { exportData, importData, clearAllData, getStorageSize } from '../../utils/indexedDB';

export default function Instellingen() {
  const { data, updateSettings } = useApp();
  const { theme, setTheme } = useTheme();
  const [storageSize, setStorageSize] = useState(0);

  useEffect(() => {
    const updateSize = async () => {
      const size = await getStorageSize();
      setStorageSize(size);
    };
    updateSize();
  }, [data]);

  const handleNotificationToggle = async () => {
    if (!data.settings.notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        updateSettings({ notificationsEnabled: true });
      }
    } else {
      updateSettings({ notificationsEnabled: false });
    }
  };

  const handleTestNotification = () => {
    sendTestNotification();
  };

  const handleExport = async () => {
    await exportData();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      importData(file)
        .then(() => {
          alert('Data succesvol geïmporteerd! Herlaad de pagina.');
          window.location.reload();
        })
        .catch((error) => {
          alert('Fout bij importeren: ' + error.message);
        });
    }
  };

  const handleClearData = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Weet je ZEKER dat je alle data wilt wissen? Dit kan niet ongedaan worden!')) {
      // eslint-disable-next-line no-restricted-globals
      if (confirm('Laatste bevestiging: alle data wordt permanent verwijderd!')) {
        await clearAllData();
      }
    }
  };

  // Bereken limiet percentage (100MB als voorbeeld, maar kan veel hoger zijn)
  const estimatedLimit = 100000; // 100MB in KB
  const percentageUsed = (storageSize / estimatedLimit) * 100;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Instellingen</h1>

      {/* Thema */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Thema</h2>
        <div className="space-y-3">
          {['light', 'dark', 'system'].map((t) => (
            <label key={t} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="theme"
                value={t}
                checked={theme === t}
                onChange={(e) => setTheme(e.target.value)}
                className="w-5 h-5"
              />
              <span className="capitalize">
                {t === 'light' ? 'Licht' : t === 'dark' ? 'Donker' : 'Systeem'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Notificaties */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Notificaties</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.settings.notificationsEnabled}
              onChange={handleNotificationToggle}
              className="w-5 h-5"
            />
            <span>Notificaties inschakelen</span>
          </label>

          {data.settings.notificationsEnabled && (
            <button onClick={handleTestNotification} className="btn-secondary">
              Test Notificatie
            </button>
          )}
        </div>
      </div>

      {/* Data Beheer */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Data Beheer</h2>

        {/* Opslaggrootte indicator */}
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Opslaggebruik (IndexedDB)</span>
            <span className="text-sm font-bold">{storageSize} KB / ~{estimatedLimit} KB</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                percentageUsed > 80 ? 'bg-danger' : percentageUsed > 60 ? 'bg-warning' : 'bg-success'
              }`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
          <div className="mt-2 text-xs space-y-1">
            <p className="text-green-600 dark:text-green-400">
              ✓ Je gebruikt IndexedDB met veel meer capaciteit dan localStorage (was 5MB)
            </p>
            {percentageUsed > 80 && (
              <p className="text-danger">
                ⚠️ Je bereikt de geschatte limiet. Maak een backup en verwijder oude data.
              </p>
            )}
            {percentageUsed > 60 && percentageUsed <= 80 && (
              <p className="text-warning">
                Opslaggebruik loopt op. Overweeg regelmatig backups te maken.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <button onClick={handleExport} className="btn-primary w-full">
            Exporteer Alle Data (JSON)
          </button>

          <div>
            <label className="btn-secondary w-full cursor-pointer block text-center">
              Importeer Data (JSON)
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          <button onClick={handleClearData} className="btn-secondary w-full bg-danger text-white hover:bg-red-600">
            Wis Alle Data
          </button>
        </div>
      </div>

      {/* Over */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Over</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Persoonlijke Levenstracker v2.0.0 (IndexedDB)
        </p>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gebouwd met React, Tailwind CSS, Dexie.js en liefde
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          IndexedDB upgrade: 50MB-1GB opslagruimte
        </p>
      </div>
    </div>
  );
}
