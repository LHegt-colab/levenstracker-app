import { loadData as loadFromLocalStorage } from './localStorage';
import { saveDataToIndexedDB, loadDataFromIndexedDB } from './indexedDB';

const MIGRATION_KEY = 'levenstracker_migration_status';

export const getMigrationStatus = () => {
  try {
    const status = localStorage.getItem(MIGRATION_KEY);
    return status ? JSON.parse(status) : { migrated: false, date: null };
  } catch (error) {
    return { migrated: false, date: null };
  }
};

export const setMigrationStatus = (migrated) => {
  const status = {
    migrated,
    date: new Date().toISOString(),
  };
  localStorage.setItem(MIGRATION_KEY, JSON.stringify(status));
};

export const migrateLocalStorageToIndexedDB = async () => {
  try {
    console.log('Starting migration from localStorage to IndexedDB...');

    // Laad huidige localStorage data
    const localStorageData = loadFromLocalStorage();

    if (!localStorageData) {
      throw new Error('Geen data gevonden in localStorage');
    }

    console.log('LocalStorage data geladen, grootte:', JSON.stringify(localStorageData).length, 'characters');

    // Sla op in IndexedDB
    const success = await saveDataToIndexedDB(localStorageData);

    if (!success) {
      throw new Error('Kon data niet opslaan in IndexedDB');
    }

    console.log('Data succesvol gemigreerd naar IndexedDB');

    // Markeer migratie als voltooid
    setMigrationStatus(true);

    return {
      success: true,
      message: 'Data succesvol gemigreerd naar IndexedDB',
    };
  } catch (error) {
    console.error('Migratie fout:', error);
    return {
      success: false,
      message: `Migratie mislukt: ${error.message}`,
      error,
    };
  }
};

export const checkAndMigrate = async () => {
  const status = getMigrationStatus();

  if (status.migrated) {
    console.log('Data is al gemigreerd op:', status.date);
    return { alreadyMigrated: true };
  }

  // Check of er localStorage data is
  try {
    const localStorageData = localStorage.getItem('levenstracker-data');
    if (!localStorageData || localStorageData === 'null') {
      console.log('Geen localStorage data gevonden, gebruik IndexedDB direct');
      setMigrationStatus(true);
      return { alreadyMigrated: true };
    }
  } catch (error) {
    console.error('Error checking localStorage:', error);
  }

  // Voer migratie uit
  console.log('LocalStorage data gevonden, migratie nodig');
  return { alreadyMigrated: false };
};

export const createBackup = () => {
  try {
    const localStorageData = loadFromLocalStorage();
    const backup = {
      data: localStorageData,
      timestamp: new Date().toISOString(),
      source: 'localStorage',
    };

    const dataStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `levenstracker-localStorage-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error creating backup:', error);
    return false;
  }
};

export const verifyMigration = async () => {
  try {
    const localStorageData = loadFromLocalStorage();
    const indexedDBData = await loadDataFromIndexedDB();

    // Vergelijk aantal entries
    const localEntries = Object.keys(localStorageData.dagboek.entries || {}).length;
    const indexedEntries = Object.keys(indexedDBData.dagboek.entries || {}).length;

    const localIdeas = localStorageData.ideeen.ideas?.length || 0;
    const indexedIdeas = indexedDBData.ideeen.ideas?.length || 0;

    const localEvents = localStorageData.kalender.events?.length || 0;
    const indexedEvents = indexedDBData.kalender.events?.length || 0;

    console.log('Verificatie resultaten:');
    console.log('Dagboek entries:', { localStorage: localEntries, indexedDB: indexedEntries });
    console.log('Ideeën:', { localStorage: localIdeas, indexedDB: indexedIdeas });
    console.log('Kalender events:', { localStorage: localEvents, indexedDB: indexedEvents });

    return {
      success: true,
      matches: {
        dagboek: localEntries === indexedEntries,
        ideeen: localIdeas === indexedIdeas,
        kalender: localEvents === indexedEvents,
      },
      counts: {
        localStorage: { dagboek: localEntries, ideeen: localIdeas, kalender: localEvents },
        indexedDB: { dagboek: indexedEntries, ideeen: indexedIdeas, kalender: indexedEvents },
      },
    };
  } catch (error) {
    console.error('Verificatie fout:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
