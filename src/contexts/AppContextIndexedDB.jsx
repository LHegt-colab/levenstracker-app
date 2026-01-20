import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadDataFromIndexedDB, saveDataToIndexedDB, getStorageSize as getIndexedDBSize } from '../utils/indexedDB';
import { startNotificationService } from '../utils/notifications';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp moet binnen AppProvider gebruikt worden');
  }
  return context;
};

let saveTimeout = null;

const debouncedSaveIndexedDB = (data) => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveDataToIndexedDB(data);
  }, 1000);
};

export const AppProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Laad data bij mount - ASYNC voor IndexedDB
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const loadedData = await loadDataFromIndexedDB();
        setData(loadedData);
      } catch (error) {
        console.error('Error loading data:', error);
        // Gebruik fallback als laden mislukt
        const { getInitialData } = require('../utils/indexedDB');
        setData(getInitialData());
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Sla data op bij wijzigingen
  useEffect(() => {
    if (data && !loading) {
      debouncedSaveIndexedDB(data);
    }
  }, [data, loading]);

  // Start notificatie service
  useEffect(() => {
    if (data?.settings?.notificationsEnabled) {
      startNotificationService(data.kalender.events);
    }
  }, [data?.settings?.notificationsEnabled, data?.kalender?.events]);

  const updateData = useCallback((updater) => {
    setData((prevData) => {
      if (typeof updater === 'function') {
        return updater(prevData);
      }
      return { ...prevData, ...updater };
    });
  }, []);

  const updateSettings = useCallback((newSettings) => {
    updateData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  }, [updateData]);

  // Dagboek functies
  const addDagboekEntry = useCallback((date, entry) => {
    updateData((prev) => {
      const dayData = prev.dagboek.entries[date] || { entries: [], daySummary: null };
      return {
        ...prev,
        dagboek: {
          ...prev.dagboek,
          entries: {
            ...prev.dagboek.entries,
            [date]: {
              ...dayData,
              entries: [
                ...dayData.entries,
                {
                  ...entry,
                  id: crypto.randomUUID(),
                  timestamp: new Date().toISOString(),
                },
              ],
            },
          },
        },
      };
    });
  }, [updateData]);

  const updateDagboekEntry = useCallback((date, entryId, updates) => {
    updateData((prev) => {
      const dayData = prev.dagboek.entries[date];
      if (!dayData) return prev;

      return {
        ...prev,
        dagboek: {
          ...prev.dagboek,
          entries: {
            ...prev.dagboek.entries,
            [date]: {
              ...dayData,
              entries: dayData.entries.map((entry) =>
                entry.id === entryId ? { ...entry, ...updates } : entry
              ),
            },
          },
        },
      };
    });
  }, [updateData]);

  const deleteDagboekEntry = useCallback((date, entryId) => {
    updateData((prev) => {
      const dayData = prev.dagboek.entries[date];
      if (!dayData) return prev;

      const updatedEntries = dayData.entries.filter((entry) => entry.id !== entryId);

      if (updatedEntries.length === 0 && !dayData.daySummary) {
        const { [date]: removed, ...remainingEntries } = prev.dagboek.entries;
        return {
          ...prev,
          dagboek: {
            ...prev.dagboek,
            entries: remainingEntries,
          },
        };
      }

      return {
        ...prev,
        dagboek: {
          ...prev.dagboek,
          entries: {
            ...prev.dagboek.entries,
            [date]: {
              ...dayData,
              entries: updatedEntries,
            },
          },
        },
      };
    });
  }, [updateData]);

  const setDaySummary = useCallback((date, summary) => {
    updateData((prev) => {
      const dayData = prev.dagboek.entries[date] || { entries: [], daySummary: null };
      return {
        ...prev,
        dagboek: {
          ...prev.dagboek,
          entries: {
            ...prev.dagboek.entries,
            [date]: {
              ...dayData,
              daySummary: summary,
            },
          },
        },
      };
    });
  }, [updateData]);

  // Verzameling functies
  const addVerzamelingItem = useCallback((item) => {
    updateData((prev) => ({
      ...prev,
      verzameling: {
        ...prev.verzameling,
        items: [
          ...prev.verzameling.items,
          {
            ...item,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          },
        ],
      },
    }));
  }, [updateData]);

  const updateVerzamelingItem = useCallback((id, updates) => {
    updateData((prev) => ({
      ...prev,
      verzameling: {
        ...prev.verzameling,
        items: prev.verzameling.items.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      },
    }));
  }, [updateData]);

  const deleteVerzamelingItem = useCallback((id) => {
    updateData((prev) => ({
      ...prev,
      verzameling: {
        ...prev.verzameling,
        items: prev.verzameling.items.filter((item) => item.id !== id),
      },
    }));
  }, [updateData]);

  const addVerzamelingCategory = useCallback((category) => {
    updateData((prev) => {
      if (prev.verzameling.categories.includes(category)) return prev;
      return {
        ...prev,
        verzameling: {
          ...prev.verzameling,
          categories: [...prev.verzameling.categories, category],
        },
      };
    });
  }, [updateData]);

  // Ideeën functies
  const addIdee = useCallback((idea) => {
    updateData((prev) => ({
      ...prev,
      ideeen: {
        ...prev.ideeen,
        ideas: [
          ...prev.ideeen.ideas,
          {
            ...idea,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          },
        ],
      },
    }));
  }, [updateData]);

  const updateIdee = useCallback((id, updates) => {
    updateData((prev) => ({
      ...prev,
      ideeen: {
        ...prev.ideeen,
        ideas: prev.ideeen.ideas.map((idea) =>
          idea.id === id ? { ...idea, ...updates } : idea
        ),
      },
    }));
  }, [updateData]);

  const deleteIdee = useCallback((id) => {
    updateData((prev) => ({
      ...prev,
      ideeen: {
        ...prev.ideeen,
        ideas: prev.ideeen.ideas.filter((idea) => idea.id !== id),
      },
    }));
  }, [updateData]);

  // Kalender functies
  const addEvent = useCallback((event) => {
    updateData((prev) => ({
      ...prev,
      kalender: {
        ...prev.kalender,
        events: [
          ...prev.kalender.events,
          {
            ...event,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          },
        ],
      },
    }));
  }, [updateData]);

  const updateEvent = useCallback((id, updates) => {
    updateData((prev) => ({
      ...prev,
      kalender: {
        ...prev.kalender,
        events: prev.kalender.events.map((event) =>
          event.id === id ? { ...event, ...updates } : event
        ),
      },
    }));
  }, [updateData]);

  const deleteEvent = useCallback((id) => {
    updateData((prev) => ({
      ...prev,
      kalender: {
        ...prev.kalender,
        events: prev.kalender.events.filter((event) => event.id !== id),
      },
    }));
  }, [updateData]);

  // Gewoontes functies
  const addHabit = useCallback((habit) => {
    updateData((prev) => ({
      ...prev,
      gewoontes: {
        ...prev.gewoontes,
        habits: [
          ...prev.gewoontes.habits,
          {
            ...habit,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          },
        ],
      },
    }));
  }, [updateData]);

  const updateHabit = useCallback((id, updates) => {
    updateData((prev) => ({
      ...prev,
      gewoontes: {
        ...prev.gewoontes,
        habits: prev.gewoontes.habits.map((habit) =>
          habit.id === id ? { ...habit, ...updates } : habit
        ),
      },
    }));
  }, [updateData]);

  const logHabit = useCallback((habitId, date, completed) => {
    updateData((prev) => {
      const dayLogs = prev.gewoontes.logs[date] || [];
      let newLogs;

      if (completed) {
        if (!dayLogs.includes(habitId)) {
          newLogs = [...dayLogs, habitId];
        } else {
          return prev;
        }
      } else {
        newLogs = dayLogs.filter((id) => id !== habitId);
      }

      return {
        ...prev,
        gewoontes: {
          ...prev.gewoontes,
          logs: {
            ...prev.gewoontes.logs,
            [date]: newLogs,
          },
        },
      };
    });
  }, [updateData]);

  // Doelen functies
  const addDoel = useCallback((doel) => {
    updateData((prev) => ({
      ...prev,
      doelen: {
        ...prev.doelen,
        goals: [
          ...prev.doelen.goals,
          {
            ...doel,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          },
        ],
      },
    }));
  }, [updateData]);

  const updateDoel = useCallback((id, updates) => {
    updateData((prev) => ({
      ...prev,
      doelen: {
        ...prev.doelen,
        goals: prev.doelen.goals.map((goal) =>
          goal.id === id ? { ...goal, ...updates } : goal
        ),
      },
    }));
  }, [updateData]);

  const deleteDoel = useCallback((id) => {
    updateData((prev) => ({
      ...prev,
      doelen: {
        ...prev.doelen,
        goals: prev.doelen.goals.filter((goal) => goal.id !== id),
      },
    }));
  }, [updateData]);

  const toggleMilestone = useCallback((goalId, milestoneIndex) => {
    updateData((prev) => ({
      ...prev,
      doelen: {
        ...prev.doelen,
        goals: prev.doelen.goals.map((goal) => {
          if (goal.id === goalId) {
            const newMilestones = [...goal.milestones];
            newMilestones[milestoneIndex] = {
              ...newMilestones[milestoneIndex],
              completed: !newMilestones[milestoneIndex].completed,
            };
            return { ...goal, milestones: newMilestones };
          }
          return goal;
        }),
      },
    }));
  }, [updateData]);

  // Reflectie functies
  const addDailyReflectie = useCallback((reflectie) => {
    updateData((prev) => ({
      ...prev,
      reflecties: {
        ...prev.reflecties,
        daily: [
          ...prev.reflecties.daily,
          {
            ...reflectie,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          },
        ],
      },
    }));
  }, [updateData]);

  const updateDailyReflectie = useCallback((id, updates) => {
    updateData((prev) => ({
      ...prev,
      reflecties: {
        ...prev.reflecties,
        daily: prev.reflecties.daily.map((ref) =>
          ref.id === id ? { ...ref, ...updates } : ref
        ),
      },
    }));
  }, [updateData]);

  const deleteDailyReflectie = useCallback((id) => {
    updateData((prev) => ({
      ...prev,
      reflecties: {
        ...prev.reflecties,
        daily: prev.reflecties.daily.filter((ref) => ref.id !== id),
      },
    }));
  }, [updateData]);

  const addWeeklyReflection = useCallback((reflection) => {
    updateData((prev) => ({
      ...prev,
      reflecties: {
        ...prev.reflecties,
        weekly: [
          ...prev.reflecties.weekly,
          {
            ...reflection,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          },
        ],
      },
    }));
  }, [updateData]);

  const updateWeeklyReflection = useCallback((id, updates) => {
    updateData(prev => ({
      ...prev,
      reflecties: {
        ...prev.reflecties,
        weekly: prev.reflecties.weekly.map(ref =>
          ref.id === id ? { ...ref, ...updates } : ref
        )
      }
    }));
  }, [updateData]);

  const deleteWeeklyReflection = useCallback((id) => {
    updateData(prev => ({
      ...prev,
      reflecties: {
        ...prev.reflecties,
        weekly: prev.reflecties.weekly.filter(ref => ref.id !== id)
      }
    }));
  }, [updateData]);

  const addMonthlyReflection = useCallback((reflection) => {
    updateData(prev => ({
      ...prev,
      reflecties: {
        ...prev.reflecties,
        monthly: [
          ...prev.reflecties.monthly,
          {
            ...reflection,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
          }
        ]
      }
    }));
  }, [updateData]);

  const updateMonthlyReflection = useCallback((id, updates) => {
    updateData(prev => ({
      ...prev,
      reflecties: {
        ...prev.reflecties,
        monthly: prev.reflecties.monthly.map(ref =>
          ref.id === id ? { ...ref, ...updates } : ref
        )
      }
    }));
  }, [updateData]);

  const deleteMonthlyReflection = useCallback((id) => {
    updateData(prev => ({
      ...prev,
      reflecties: {
        ...prev.reflecties,
        monthly: prev.reflecties.monthly.filter(ref => ref.id !== id)
      }
    }));
  }, [updateData]);

  // Voeding functies
  const addMeal = useCallback((date, mealData) => {
    updateData(prev => {
      const dayMeals = prev.voeding.meals[date] || { meals: [] };
      return {
        ...prev,
        voeding: {
          ...prev.voeding,
          meals: {
            ...prev.voeding.meals,
            [date]: {
              meals: [...dayMeals.meals, {
                ...mealData,
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString()
              }]
            }
          }
        }
      };
    });
  }, [updateData]);

  const updateMeal = useCallback((date, mealId, updates) => {
    updateData(prev => {
      const dayData = prev.voeding.meals[date];
      if (!dayData) return prev;

      return {
        ...prev,
        voeding: {
          ...prev.voeding,
          meals: {
            ...prev.voeding.meals,
            [date]: {
              meals: dayData.meals.map(meal =>
                meal.id === mealId ? { ...meal, ...updates } : meal
              )
            }
          }
        }
      };
    });
  }, [updateData]);

  const deleteMeal = useCallback((date, mealId) => {
    updateData(prev => {
      const dayData = prev.voeding.meals[date];
      if (!dayData) return prev;

      const updatedMeals = dayData.meals.filter(meal => meal.id !== mealId);

      if (updatedMeals.length === 0) {
        const { [date]: removed, ...remainingMeals } = prev.voeding.meals;
        return {
          ...prev,
          voeding: {
            ...prev.voeding,
            meals: remainingMeals
          }
        };
      }

      return {
        ...prev,
        voeding: {
          ...prev.voeding,
          meals: {
            ...prev.voeding.meals,
            [date]: {
              meals: updatedMeals
            }
          }
        }
      };
    });
  }, [updateData]);

  const setKcalTarget = useCallback((targetKcal) => {
    updateData(prev => ({
      ...prev,
      voeding: {
        ...prev.voeding,
        targetKcal
      }
    }));
  }, [updateData]);

  const value = {
    data,
    loading,
    updateData,
    updateSettings,
    // Dagboek
    addDagboekEntry,
    updateDagboekEntry,
    deleteDagboekEntry,
    setDaySummary,
    // Verzameling
    addVerzamelingItem,
    updateVerzamelingItem,
    deleteVerzamelingItem,
    addVerzamelingCategory,
    // Ideeën
    addIdee,
    updateIdee,
    deleteIdee,
    // Kalender
    addEvent,
    updateEvent,
    deleteEvent,
    // Gewoontes
    addHabit,
    updateHabit,
    logHabit,
    // Doelen
    addDoel,
    updateDoel,
    deleteDoel,
    toggleMilestone,
    // Reflectie
    addDailyReflectie,
    updateDailyReflectie,
    deleteDailyReflectie,
    addWeeklyReflection,
    updateWeeklyReflection,
    deleteWeeklyReflection,
    addMonthlyReflection,
    updateMonthlyReflection,
    deleteMonthlyReflection,
    // Voeding
    addMeal,
    updateMeal,
    deleteMeal,
    setKcalTarget,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Laden...</div>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
