import Dexie from 'dexie';

const STORAGE_VERSION = 1;

// Maak database instance
const db = new Dexie('LeventrackerDB');

// Definieer database schema
db.version(STORAGE_VERSION).stores({
  // Settings - key-value pairs
  settings: 'key',

  // Dagboek - indexed op datum en tags
  dagboek: '++id, date, *tags, timestamp',
  dagboekSummaries: 'date',

  // Verzameling - indexed op category en tags
  verzameling: '++id, category, *tags, createdAt',
  verzamelingCategories: '++id, name',

  // Ideeën - indexed op status en tags
  ideeen: '++id, status, *tags, createdAt',

  // Kalender - indexed op datum en category
  kalender: '++id, date, category, startTime',

  // Gewoontes
  gewoontes: '++id, name',
  gewoonteLog: '[habitId+date], habitId, date',

  // Doelen - indexed op tags
  doelen: '++id, *tags, createdAt, deadline',

  // Reflecties - indexed op datum en type
  reflecties: '++id, date, type, createdAt',

  // Voeding - indexed op datum
  voeding: '++id, date, type, timestamp'
});

// Helper functies voor data conversie
export const getInitialData = () => ({
  version: STORAGE_VERSION,
  settings: {
    notificationsEnabled: false,
  },
  dagboek: {
    entries: {},
    daySummaries: {},
  },
  verzameling: {
    items: [],
    categories: ['Artikel', 'Video', 'Boek', 'Website', 'Podcast', 'Anders'],
  },
  ideeen: {
    ideas: [],
  },
  kalender: {
    events: [],
  },
  gewoontes: {
    habits: [],
    logs: {},
  },
  doelen: {
    goals: [],
  },
  reflecties: {
    daily: [],
    weekly: [],
    monthly: [],
  },
  voeding: {
    meals: {},
    targetKcal: 2000,
  },
});

// Laad alle data uit IndexedDB
export const loadDataFromIndexedDB = async () => {
  try {
    // Settings
    const settingsData = await db.settings.toArray();
    const settings = settingsData.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    // Dagboek
    const dagboekEntries = await db.dagboek.toArray();
    const dagboekSummaries = await db.dagboekSummaries.toArray();

    const dagboekData = {};
    dagboekEntries.forEach(entry => {
      if (!dagboekData[entry.date]) {
        dagboekData[entry.date] = { entries: [], daySummary: null };
      }
      dagboekData[entry.date].entries.push(entry);
    });

    dagboekSummaries.forEach(summary => {
      if (dagboekData[summary.date]) {
        dagboekData[summary.date].daySummary = summary.summary;
      }
    });

    // Verzameling
    const verzamelingItems = await db.verzameling.toArray();
    const verzamelingCategories = await db.verzamelingCategories.toArray();

    // Ideeën
    const ideeen = await db.ideeen.toArray();

    // Kalender
    const kalenderEvents = await db.kalender.toArray();

    // Gewoontes
    const gewoontes = await db.gewoontes.toArray();
    const gewoonteLogEntries = await db.gewoonteLog.toArray();

    const gewoonteLog = {};
    gewoonteLogEntries.forEach(log => {
      if (!gewoonteLog[log.date]) {
        gewoonteLog[log.date] = [];
      }
      gewoonteLog[log.date].push(log.habitId);
    });

    // Doelen
    const doelen = await db.doelen.toArray();

    // Reflecties
    const reflectiesAll = await db.reflecties.toArray();
    const reflecties = {
      daily: reflectiesAll.filter(r => r.type === 'daily'),
      weekly: reflectiesAll.filter(r => r.type === 'weekly'),
      monthly: reflectiesAll.filter(r => r.type === 'monthly'),
    };

    // Voeding
    const voedingEntries = await db.voeding.toArray();
    const voedingMeals = {};
    voedingEntries.forEach(meal => {
      if (!voedingMeals[meal.date]) {
        voedingMeals[meal.date] = { meals: [] };
      }
      voedingMeals[meal.date].meals.push(meal);
    });

    // Haal targetKcal op uit settings
    const targetKcal = settings.targetKcal || 2000;

    return {
      version: STORAGE_VERSION,
      settings: {
        notificationsEnabled: settings.notificationsEnabled || false,
      },
      dagboek: {
        entries: dagboekData,
        daySummaries: Object.fromEntries(
          dagboekSummaries.map(s => [s.date, s.summary])
        ),
      },
      verzameling: {
        items: verzamelingItems,
        categories: verzamelingCategories.map(c => c.name),
      },
      ideeen: {
        ideas: ideeen,
      },
      kalender: {
        events: kalenderEvents,
      },
      gewoontes: {
        habits: gewoontes,
        logs: gewoonteLog,
      },
      doelen: {
        goals: doelen,
      },
      reflecties,
      voeding: {
        meals: voedingMeals,
        targetKcal,
      },
    };
  } catch (error) {
    console.error('Error loading data from IndexedDB:', error);
    return getInitialData();
  }
};

// Sla data op in IndexedDB
export const saveDataToIndexedDB = async (data) => {
  try {
    await db.transaction('rw', [
      db.settings,
      db.dagboek,
      db.dagboekSummaries,
      db.verzameling,
      db.verzamelingCategories,
      db.ideeen,
      db.kalender,
      db.gewoontes,
      db.gewoonteLog,
      db.doelen,
      db.reflecties,
      db.voeding,
    ], async () => {
      // Settings
      await db.settings.clear();
      await db.settings.bulkAdd([
        { key: 'notificationsEnabled', value: data.settings.notificationsEnabled },
        { key: 'targetKcal', value: data.voeding.targetKcal },
      ]);

      // Dagboek
      await db.dagboek.clear();
      await db.dagboekSummaries.clear();

      const dagboekEntries = [];
      const summaries = [];

      Object.entries(data.dagboek.entries).forEach(([date, dayData]) => {
        if (dayData.entries) {
          dayData.entries.forEach(entry => {
            dagboekEntries.push({ ...entry, date });
          });
        }
        if (dayData.daySummary) {
          summaries.push({ date, summary: dayData.daySummary });
        }
      });

      if (dagboekEntries.length > 0) await db.dagboek.bulkAdd(dagboekEntries);
      if (summaries.length > 0) await db.dagboekSummaries.bulkAdd(summaries);

      // Verzameling
      await db.verzameling.clear();
      await db.verzamelingCategories.clear();

      if (data.verzameling.items.length > 0) {
        await db.verzameling.bulkAdd(data.verzameling.items);
      }
      if (data.verzameling.categories.length > 0) {
        await db.verzamelingCategories.bulkAdd(
          data.verzameling.categories.map((name, index) => ({ id: index + 1, name }))
        );
      }

      // Ideeën
      await db.ideeen.clear();
      if (data.ideeen.ideas.length > 0) {
        await db.ideeen.bulkAdd(data.ideeen.ideas);
      }

      // Kalender
      await db.kalender.clear();
      if (data.kalender.events.length > 0) {
        await db.kalender.bulkAdd(data.kalender.events);
      }

      // Gewoontes
      await db.gewoontes.clear();
      await db.gewoonteLog.clear();

      if (data.gewoontes.habits.length > 0) {
        await db.gewoontes.bulkAdd(data.gewoontes.habits);
      }

      const gewoonteLogEntries = [];
      Object.entries(data.gewoontes.logs).forEach(([date, habitIds]) => {
        habitIds.forEach(habitId => {
          gewoonteLogEntries.push({ habitId, date });
        });
      });

      if (gewoonteLogEntries.length > 0) {
        await db.gewoonteLog.bulkAdd(gewoonteLogEntries);
      }

      // Doelen
      await db.doelen.clear();
      if (data.doelen.goals.length > 0) {
        await db.doelen.bulkAdd(data.doelen.goals);
      }

      // Reflecties
      await db.reflecties.clear();
      const allReflecties = [
        ...data.reflecties.daily.map(r => ({ ...r, type: 'daily' })),
        ...data.reflecties.weekly.map(r => ({ ...r, type: 'weekly' })),
        ...data.reflecties.monthly.map(r => ({ ...r, type: 'monthly' })),
      ];

      if (allReflecties.length > 0) {
        await db.reflecties.bulkAdd(allReflecties);
      }

      // Voeding
      await db.voeding.clear();
      const voedingEntries = [];

      Object.entries(data.voeding.meals).forEach(([date, dayData]) => {
        if (dayData.meals) {
          dayData.meals.forEach(meal => {
            voedingEntries.push({ ...meal, date });
          });
        }
      });

      if (voedingEntries.length > 0) {
        await db.voeding.bulkAdd(voedingEntries);
      }
    });

    return true;
  } catch (error) {
    console.error('Error saving data to IndexedDB:', error);
    return false;
  }
};

// Bereken database grootte
export const getStorageSize = async () => {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const usageInKB = Math.round((estimate.usage || 0) / 1024);
      return usageInKB;
    }
    return 0;
  } catch (error) {
    console.error('Error getting storage size:', error);
    return 0;
  }
};

// Export/Import functies
export const exportData = async () => {
  try {
    const data = await loadDataFromIndexedDB();
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
    console.error('Error exporting data:', error);
    return false;
  }
};

export const importData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        await saveDataToIndexedDB(data);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Bestand kon niet worden gelezen'));
    reader.readAsText(file);
  });
};

export const clearAllData = async () => {
  try {
    await db.delete();
    window.location.reload();
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

export default db;
