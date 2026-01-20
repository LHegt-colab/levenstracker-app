const STORAGE_KEY = 'persoonlijke-levenstracker';
const STORAGE_VERSION = '1.0.0';

// Initiële data structuur
const getInitialData = () => ({
  version: STORAGE_VERSION,
  settings: {
    theme: 'system', // light, dark, system
    notificationsEnabled: false,
    defaultView: 'dashboard',
  },
  dagboek: {},
  verzameling: {
    items: [],
    categories: [
      { id: crypto.randomUUID(), name: 'Websites', color: '#3B82F6', icon: 'globe' },
      { id: crypto.randomUUID(), name: 'Artikelen', color: '#10B981', icon: 'file-text' },
      { id: crypto.randomUUID(), name: "Video's", color: '#EF4444', icon: 'video' },
      { id: crypto.randomUUID(), name: 'Tools/Software', color: '#F59E0B', icon: 'wrench' },
      { id: crypto.randomUUID(), name: 'Boeken', color: '#8B5CF6', icon: 'book' },
      { id: crypto.randomUUID(), name: 'Podcasts', color: '#EC4899', icon: 'mic' },
      { id: crypto.randomUUID(), name: 'Tutorials', color: '#14B8A6', icon: 'graduation-cap' },
      { id: crypto.randomUUID(), name: 'Recepten', color: '#F97316', icon: 'utensils' },
      { id: crypto.randomUUID(), name: 'Overig', color: '#6B7280', icon: 'folder' },
    ],
  },
  ideeen: {
    items: [],
    categories: [
      { id: crypto.randomUUID(), name: 'Muziek/Liedjes', color: '#EC4899', icon: 'music' },
      { id: crypto.randomUUID(), name: 'Projecten', color: '#3B82F6', icon: 'briefcase' },
      { id: crypto.randomUUID(), name: 'Apps/Software', color: '#10B981', icon: 'smartphone' },
      { id: crypto.randomUUID(), name: 'Business ideeën', color: '#F59E0B', icon: 'trending-up' },
      { id: crypto.randomUUID(), name: 'Creatief/Kunst', color: '#8B5CF6', icon: 'palette' },
      { id: crypto.randomUUID(), name: 'Verbeteringen', color: '#14B8A6', icon: 'lightbulb' },
      { id: crypto.randomUUID(), name: 'Uitvindingen', color: '#EF4444', icon: 'zap' },
      { id: crypto.randomUUID(), name: 'Overig', color: '#6B7280', icon: 'folder' },
    ],
  },
  kalender: {
    events: [],
  },
  gewoontes: {
    habits: [
      { id: crypto.randomUUID(), name: 'Zweeds gestudeerd', icon: 'book', color: '#FBBF24', frequency: 'daily', weeklyGoal: 7, active: true, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Geprogrammeerd / coding geleerd', icon: 'code', color: '#3B82F6', frequency: 'daily', weeklyGoal: 7, active: true, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Iets gedaan met AI', icon: 'cpu', color: '#8B5CF6', frequency: 'daily', weeklyGoal: 7, active: true, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Muziek gemaakt (FL Studio)', icon: 'music', color: '#EC4899', frequency: 'daily', weeklyGoal: 5, active: true, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Gitaar geoefend', icon: 'guitar', color: '#F97316', frequency: 'daily', weeklyGoal: 5, active: true, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Piano geoefend', icon: 'piano', color: '#06B6D4', frequency: 'daily', weeklyGoal: 5, active: true, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Boek gelezen', icon: 'book-open', color: '#10B981', frequency: 'daily', weeklyGoal: 7, active: true, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Gesport', icon: 'dumbbell', color: '#EF4444', frequency: 'daily', weeklyGoal: 4, active: true, createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Gemediteerd', icon: 'brain', color: '#14B8A6', frequency: 'daily', weeklyGoal: 7, active: true, createdAt: new Date().toISOString() },
    ],
    logs: {},
  },
  doelen: {
    goals: [],
  },
  reflecties: {
    daily: {},
    weekly: [],
    monthly: [],
  },
  voeding: {
    meals: {}, // { 'yyyy-mm-dd': { meals: [...], totalKcal: 0 } }
    targetKcal: 2000, // Standaard streefhoeveelheid
  },
});

// Laad data uit localStorage
export const loadData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const initialData = getInitialData();
      saveData(initialData);
      return initialData;
    }

    const parsed = JSON.parse(stored);

    // Migratie logica indien nodig
    if (parsed.version !== STORAGE_VERSION) {
      // Voer migraties uit indien nodig
      parsed.version = STORAGE_VERSION;

      // Voeg voeding structuur toe als deze nog niet bestaat
      if (!parsed.voeding) {
        parsed.voeding = {
          meals: {},
          targetKcal: 2000,
        };
      }

      saveData(parsed);
    }

    // Voeg voeding structuur toe als deze nog niet bestaat (ook voor huidige versie)
    if (!parsed.voeding) {
      parsed.voeding = {
        meals: {},
        targetKcal: 2000,
      };
      saveData(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('Fout bij laden van data:', error);
    return getInitialData();
  }
};

// Bereken huidige opslaggrootte
export const getStorageSize = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return 0;
    // Bereken grootte in bytes
    const sizeInBytes = new Blob([data]).size;
    // Converteer naar KB
    return Math.round(sizeInBytes / 1024);
  } catch (error) {
    return 0;
  }
};

// Sla data op in localStorage
export const saveData = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    const sizeInKB = Math.round(new Blob([jsonString]).size / 1024);

    localStorage.setItem(STORAGE_KEY, jsonString);

    // Waarschuw bij > 4MB (80% van typische 5MB limiet)
    if (sizeInKB > 4096) {
      console.warn(`Opslaggebruik: ${sizeInKB}KB. Overweeg data te exporteren en oude entries te verwijderen.`);
    }

    return true;
  } catch (error) {
    console.error('Fout bij opslaan van data:', error);

    // Check voor quota overschrijding
    if (error.name === 'QuotaExceededError') {
      const currentSize = getStorageSize();
      alert(`Opslaglimiet bereikt!\n\nHuidige opslag: ${currentSize}KB\nMaximum: ~5000KB\n\nGa naar Instellingen om:\n- Een backup te maken (Export Data)\n- Oude entries te verwijderen\n- Data op te schonen`);
    }

    return false;
  }
};

// Exporteer alle data als JSON bestand
export const exportData = () => {
  try {
    const data = loadData();
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `levenstracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Fout bij exporteren van data:', error);
    return false;
  }
};

// Importeer data uit JSON bestand
export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        // Valideer data structuur
        if (!imported.version || !imported.settings) {
          throw new Error('Ongeldig data formaat');
        }

        saveData(imported);
        resolve(imported);
      } catch (error) {
        console.error('Fout bij importeren van data:', error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Fout bij lezen van bestand'));
    };

    reader.readAsText(file);
  });
};

// Wis alle data
export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Fout bij wissen van data:', error);
    return false;
  }
};

// Debounced save functie
let saveTimeout = null;
export const debouncedSave = (data, delay = 500) => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    saveData(data);
  }, delay);
};
