import { useState, useEffect } from 'react';
import { APP_VERSION } from '../../version';
import { useApp } from '../../contexts/AppContextSupabase';
import { useTheme } from '../../contexts/ThemeContext';
import { requestNotificationPermission, sendTestNotification } from '../../utils/notifications';
import { getStorageSize } from '../../utils/indexedDB';
import { supabase } from '../../utils/supabaseClient';
import SupabaseMigration from '../migration/SupabaseMigration';

export default function Instellingen() {
  const { data, updateSettings } = useApp();
  const { theme, setTheme } = useTheme();
  // eslint-disable-next-line
  const [storageSize, setStorageSize] = useState(0);

  useEffect(() => {
    // getStorageSize for IndexedDB might still be useful for reference but less relevant for Supabase app
    getStorageSize().then(setStorageSize);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Instellingen</h1>

      {/* Account */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Account</h2>
        <button onClick={handleLogout} className="btn-secondary w-full bg-red-500 text-white hover:bg-red-600">
          Uitloggen
        </button>
      </div>

      {/* Cloud Migratie */}
      <div className="card">
        <SupabaseMigration />
      </div>

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

      {/* Over */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Over</h2>
        <p className="text-gray-600 dark:text-gray-400">
          import {APP_VERSION} from '../../version';

        // ... (imports remain the same, just adding APP_VERSION import if not easy to insert at top, checking context)
        // actually I'll use multi_replace to be safe with imports.

        // Wait, I need to add the import first.

        </p>
      </div>
    </div>
  );
}
