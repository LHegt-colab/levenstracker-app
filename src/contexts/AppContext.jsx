import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadData, saveData, debouncedSave } from '../utils/localStorage';
import { startNotificationService } from '../utils/notifications';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp moet binnen AppProvider gebruikt worden');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Laad data bij mount
  useEffect(() => {
    const loadedData = loadData();
    setData(loadedData);
    setLoading(false);
  }, []);

  // Sla data op bij wijzigingen
  useEffect(() => {
    if (data && !loading) {
      debouncedSave(data);
    }
  }, [data, loading]);

  // Start notificatie service
  useEffect(() => {
    if (data && !loading) {
      const cleanup = startNotificationService(
        () => data.kalender.events,
        data.settings
      );
      return () => {
        if (cleanup && typeof cleanup === 'function') {
          cleanup();
        }
      };
    }
  }, [data, loading]);

  // Update functie voor data
  const updateData = useCallback((updater) => {
    setData(prev => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return { ...prev, ...updater };
    });
  }, []);

  // Settings functies
  const updateSettings = useCallback((newSettings) => {
    updateData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  }, [updateData]);

  // Dagboek functies
  const addDagboekEntry = useCallback((date, entry) => {
    updateData(prev => {
      const dateEntries = prev.dagboek[date] || { entries: [], daySummary: null };
      return {
        ...prev,
        dagboek: {
          ...prev.dagboek,
          [date]: {
            ...dateEntries,
            entries: [...dateEntries.entries, { ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() }]
          }
        }
      };
    });
  }, [updateData]);

  const updateDagboekEntry = useCallback((date, entryId, updates) => {
    updateData(prev => {
      const dateEntries = prev.dagboek[date];
      if (!dateEntries) return prev;

      return {
        ...prev,
        dagboek: {
          ...prev.dagboek,
          [date]: {
            ...dateEntries,
            entries: dateEntries.entries.map(e =>
              e.id === entryId ? { ...e, ...updates } : e
            )
          }
        }
      };
    });
  }, [updateData]);

  const deleteDagboekEntry = useCallback((date, entryId) => {
    updateData(prev => {
      const dateEntries = prev.dagboek[date];
      if (!dateEntries) return prev;

      return {
        ...prev,
        dagboek: {
          ...prev.dagboek,
          [date]: {
            ...dateEntries,
            entries: dateEntries.entries.filter(e => e.id !== entryId)
          }
        }
      };
    });
  }, [updateData]);

  const setDaySummary = useCallback((date, summary) => {
    updateData(prev => {
      const dateEntries = prev.dagboek[date] || { entries: [] };
      return {
        ...prev,
        dagboek: {
          ...prev.dagboek,
          [date]: {
            ...dateEntries,
            daySummary: summary
          }
        }
      };
    });
  }, [updateData]);

  // Verzameling functies
  const addVerzamelingItem = useCallback((item) => {
    updateData(prev => ({
      ...prev,
      verzameling: {
        ...prev.verzameling,
        items: [...prev.verzameling.items, { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
      }
    }));
  }, [updateData]);

  const updateVerzamelingItem = useCallback((id, updates) => {
    updateData(prev => ({
      ...prev,
      verzameling: {
        ...prev.verzameling,
        items: prev.verzameling.items.map(item =>
          item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
        )
      }
    }));
  }, [updateData]);

  const deleteVerzamelingItem = useCallback((id) => {
    updateData(prev => ({
      ...prev,
      verzameling: {
        ...prev.verzameling,
        items: prev.verzameling.items.filter(item => item.id !== id)
      }
    }));
  }, [updateData]);

  const addVerzamelingCategory = useCallback((category) => {
    updateData(prev => ({
      ...prev,
      verzameling: {
        ...prev.verzameling,
        categories: [...prev.verzameling.categories, { ...category, id: crypto.randomUUID() }]
      }
    }));
  }, [updateData]);

  // Ideeën functies
  const addIdee = useCallback((idea) => {
    updateData(prev => ({
      ...prev,
      ideeen: {
        ...prev.ideeen,
        items: [...prev.ideeen.items, { ...idea, id: crypto.randomUUID(), status: idea.status || 'backlog', notes: [], relatedLinks: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
      }
    }));
  }, [updateData]);

  const updateIdee = useCallback((id, updates) => {
    updateData(prev => ({
      ...prev,
      ideeen: {
        ...prev.ideeen,
        items: prev.ideeen.items.map(item =>
          item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
        )
      }
    }));
  }, [updateData]);

  const deleteIdee = useCallback((id) => {
    updateData(prev => ({
      ...prev,
      ideeen: {
        ...prev.ideeen,
        items: prev.ideeen.items.filter(item => item.id !== id)
      }
    }));
  }, [updateData]);

  // Kalender functies
  const addEvent = useCallback((event) => {
    updateData(prev => ({
      ...prev,
      kalender: {
        ...prev.kalender,
        events: [...prev.kalender.events, { ...event, id: crypto.randomUUID(), createdAt: new Date().toISOString(), notificationSent: false }]
      }
    }));
  }, [updateData]);

  const updateEvent = useCallback((id, updates) => {
    updateData(prev => ({
      ...prev,
      kalender: {
        ...prev.kalender,
        events: prev.kalender.events.map(event =>
          event.id === id ? { ...event, ...updates } : event
        )
      }
    }));
  }, [updateData]);

  const deleteEvent = useCallback((id) => {
    updateData(prev => ({
      ...prev,
      kalender: {
        ...prev.kalender,
        events: prev.kalender.events.filter(event => event.id !== id)
      }
    }));
  }, [updateData]);

  // Gewoontes functies
  const addHabit = useCallback((habit) => {
    updateData(prev => ({
      ...prev,
      gewoontes: {
        ...prev.gewoontes,
        habits: [...prev.gewoontes.habits, { ...habit, id: crypto.randomUUID(), createdAt: new Date().toISOString(), active: true }]
      }
    }));
  }, [updateData]);

  const updateHabit = useCallback((id, updates) => {
    updateData(prev => ({
      ...prev,
      gewoontes: {
        ...prev.gewoontes,
        habits: prev.gewoontes.habits.map(habit =>
          habit.id === id ? { ...habit, ...updates } : habit
        )
      }
    }));
  }, [updateData]);

  const logHabit = useCallback((date, habitId, log) => {
    updateData(prev => ({
      ...prev,
      gewoontes: {
        ...prev.gewoontes,
        logs: {
          ...prev.gewoontes.logs,
          [date]: {
            ...prev.gewoontes.logs[date],
            [habitId]: log
          }
        }
      }
    }));
  }, [updateData]);

  // Doelen functies
  const addDoel = useCallback((goal) => {
    updateData(prev => ({
      ...prev,
      doelen: {
        ...prev.doelen,
        goals: [...prev.doelen.goals, { ...goal, id: crypto.randomUUID(), milestones: goal.milestones || [], progressHistory: [], completed: false, createdAt: new Date().toISOString() }]
      }
    }));
  }, [updateData]);

  const updateDoel = useCallback((id, updates) => {
    updateData(prev => ({
      ...prev,
      doelen: {
        ...prev.doelen,
        goals: prev.doelen.goals.map(goal =>
          goal.id === id ? { ...goal, ...updates } : goal
        )
      }
    }));
  }, [updateData]);

  const deleteDoel = useCallback((id) => {
    updateData(prev => ({
      ...prev,
      doelen: {
        ...prev.doelen,
        goals: prev.doelen.goals.filter(goal => goal.id !== id)
      }
    }));
  }, [updateData]);

  const toggleMilestone = useCallback((goalId, milestoneIdx) => {
    updateData(prev => ({
      ...prev,
      doelen: {
        ...prev.doelen,
        goals: prev.doelen.goals.map(goal =>
          goal.id === goalId
            ? {
                ...goal,
                milestones: goal.milestones.map((m, i) =>
                  i === milestoneIdx ? { ...m, completed: !m.completed } : m
                )
              }
            : goal
        )
      }
    }));
  }, [updateData]);

  // Reflectie functies
  const addDailyReflectie = useCallback((date, reflection) => {
    updateData(prev => ({
      ...prev,
      reflecties: {
        ...prev.reflecties,
        daily: {
          ...prev.reflecties.daily,
          [date]: { ...reflection, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        }
      }
    }));
  }, [updateData]);

  const updateDailyReflectie = useCallback((date, reflection) => {
    updateData(prev => ({
      ...prev,
      reflecties: {
        ...prev.reflecties,
        daily: {
          ...prev.reflecties.daily,
          [date]: { ...prev.reflecties.daily[date], ...reflection, updatedAt: new Date().toISOString() }
        }
      }
    }));
  }, [updateData]);

  const deleteDailyReflectie = useCallback((date) => {
    updateData(prev => {
      const { [date]: removed, ...remaining } = prev.reflecties.daily;
      return {
        ...prev,
        reflecties: {
          ...prev.reflecties,
          daily: remaining
        }
      };
    });
  }, [updateData]);

  const addWeeklyReflection = useCallback((reflection) => {
    updateData(prev => ({
      ...prev,
      reflecties: {
        ...prev.reflecties,
        weekly: [...prev.reflecties.weekly, { ...reflection, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      }
    }));
  }, [updateData]);

  const updateWeeklyReflection = useCallback((id, updates) => {
    updateData(prev => ({
      ...prev,
      reflecties: {
        ...prev.reflecties,
        weekly: prev.reflecties.weekly.map(ref =>
          ref.id === id ? { ...ref, ...updates, updatedAt: new Date().toISOString() } : ref
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
        monthly: [...prev.reflecties.monthly, { ...reflection, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      }
    }));
  }, [updateData]);

  const updateMonthlyReflection = useCallback((id, updates) => {
    updateData(prev => ({
      ...prev,
      reflecties: {
        ...prev.reflecties,
        monthly: prev.reflecties.monthly.map(ref =>
          ref.id === id ? { ...ref, ...updates, updatedAt: new Date().toISOString() } : ref
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
