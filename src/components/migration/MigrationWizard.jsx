import { useState, useEffect } from 'react';
import { Database, Download, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import {
  checkAndMigrate,
  migrateLocalStorageToIndexedDB,
  createBackup,
  verifyMigration,
} from '../../utils/migratieIndexedDB';

export default function MigrationWizard({ onComplete }) {
  const [step, setStep] = useState('checking'); // checking, ready, migrating, success, error
  const [error, setError] = useState(null);
  const [backupCreated, setBackupCreated] = useState(false);
  const [verification, setVerification] = useState(null);

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    const result = await checkAndMigrate();

    if (result.alreadyMigrated) {
      // Data is al gemigreerd of er is geen localStorage data
      onComplete();
      return;
    }

    // Er is localStorage data die gemigreerd moet worden
    setStep('ready');
  };

  const handleCreateBackup = () => {
    const success = createBackup();
    if (success) {
      setBackupCreated(true);
      alert('Backup succesvol gedownload! Bewaar dit bestand op een veilige plek.');
    } else {
      alert('Fout bij maken van backup. Probeer opnieuw.');
    }
  };

  const handleMigrate = async () => {
    setStep('migrating');
    setError(null);

    try {
      // Wacht even voor visuele feedback
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Voer migratie uit
      const result = await migrateLocalStorageToIndexedDB();

      if (!result.success) {
        throw new Error(result.message);
      }

      // Verificatie
      const verify = await verifyMigration();
      setVerification(verify);

      setStep('success');
    } catch (err) {
      setError(err.message);
      setStep('error');
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  if (step === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-lg">Controleren van data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Database size={64} className="mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Upgrade naar IndexedDB</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Je data wordt geüpgraded naar een nieuw opslagsysteem met meer capaciteit
          </p>
        </div>

        {/* Ready Step */}
        {step === 'ready' && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Wat gebeurt er?
              </h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>• Je huidige data wordt overgezet naar IndexedDB</li>
                <li>• Je krijgt 50MB-1GB opslagruimte (nu: 5MB)</li>
                <li>• Alle data blijft behouden</li>
                <li>• Dit duurt ongeveer 10-30 seconden</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                ⚠️ Belangrijk
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                Maak eerst een backup van je huidige data voordat je migreert.
              </p>
              <button
                onClick={handleCreateBackup}
                className="btn-secondary flex items-center gap-2"
                disabled={backupCreated}
              >
                <Download size={18} />
                {backupCreated ? 'Backup gemaakt ✓' : 'Download Backup'}
              </button>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleMigrate}
                className="btn-primary"
                disabled={!backupCreated}
              >
                Start Migratie
              </button>
            </div>

            {!backupCreated && (
              <p className="text-sm text-center text-gray-500">
                Maak eerst een backup voordat je kunt migreren
              </p>
            )}
          </div>
        )}

        {/* Migrating Step */}
        {step === 'migrating' && (
          <div className="text-center space-y-4">
            <Loader className="animate-spin mx-auto text-primary" size={48} />
            <h3 className="text-xl font-semibold">Data wordt gemigreerd...</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Dit kan 10-30 seconden duren. Sluit dit venster niet.
            </p>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="mx-auto text-success mb-4" size={64} />
              <h3 className="text-2xl font-bold mb-2">Migratie geslaagd!</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Je data is succesvol overgezet naar IndexedDB
              </p>
            </div>

            {verification && verification.success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Verificatie resultaten:
                </h4>
                <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <p>
                    Dagboek entries: {verification.counts.indexedDB.dagboek}{' '}
                    {verification.matches.dagboek ? '✓' : '⚠️'}
                  </p>
                  <p>
                    Ideeën: {verification.counts.indexedDB.ideeen}{' '}
                    {verification.matches.ideeen ? '✓' : '⚠️'}
                  </p>
                  <p>
                    Kalender events: {verification.counts.indexedDB.kalender}{' '}
                    {verification.matches.kalender ? '✓' : '⚠️'}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Wat is er nieuw?
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>✓ 50MB-1GB opslagruimte (was: 5MB)</li>
                <li>✓ Betere prestaties</li>
                <li>✓ Alle je data is behouden</li>
                <li>✓ Foto's kunnen nu weer toegevoegd worden</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={handleComplete} className="btn-primary">
                Start de app
              </button>
            </div>
          </div>
        )}

        {/* Error Step */}
        {step === 'error' && (
          <div className="space-y-6">
            <div className="text-center">
              <AlertCircle className="mx-auto text-danger mb-4" size={64} />
              <h3 className="text-2xl font-bold mb-2">Migratie mislukt</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Er is een fout opgetreden tijdens de migratie
              </p>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-left">
                  <p className="text-sm text-red-800 dark:text-red-200 font-mono">
                    {error}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                Geen zorgen!
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Je originele data in localStorage is niet aangetast. Je kunt de app gewoon blijven
                gebruiken met localStorage, of opnieuw proberen te migreren.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setStep('ready')} className="btn-secondary">
                Opnieuw proberen
              </button>
              <button onClick={onComplete} className="btn-primary">
                Gebruik localStorage
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
