import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        settings: { notificationsEnabled: false, targetKcal: 2000 },
        dagboek: { entries: {}, daySummaries: {} },
        verzameling: { items: [], categories: [] },
        ideeen: { ideas: [] },
        kalender: { events: [] },
        gewoontes: { habits: [], logs: {} },
        doelen: { goals: [] },
        reflecties: { daily: [], weekly: [], monthly: [] },
        voeding: { meals: {}, targetKcal: 2000 },
    });

    // Auth Handling
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Data Fetching
    const loadData = useCallback(async () => {
        if (!session?.user) return;
        setLoading(true);

        try {
            const { data: settings } = await supabase.from('settings').select('*').single();
            const { data: dagboekEntries } = await supabase.from('dagboek_entries').select('*');
            const { data: dagboekSummaries } = await supabase.from('dagboek_summaries').select('*');
            const { data: verzamelingItems } = await supabase.from('verzameling_items').select('*');
            const { data: verzamelingCategories } = await supabase.from('verzameling_categories').select('*');
            const { data: ideeen } = await supabase.from('ideeen').select('*');
            const { data: kalenderEvents } = await supabase.from('kalender_events').select('*');
            const { data: gewoontes } = await supabase.from('gewoontes').select('*');
            const { data: gewoonteLogs } = await supabase.from('gewoonte_logs').select('*');
            const { data: doelen } = await supabase.from('doelen').select('*');
            const { data: reflecties } = await supabase.from('reflecties').select('*');
            const { data: voedingMeals } = await supabase.from('voeding_meals').select('*');

            // Transform raw data to app state structure
            // DAGBOEK
            const transformedDagboekEntries = {};
            dagboekEntries?.forEach(entry => {
                if (!transformedDagboekEntries[entry.date]) transformedDagboekEntries[entry.date] = { entries: [], daySummary: null };
                transformedDagboekEntries[entry.date].entries.push(entry);
            });
            dagboekSummaries?.forEach(summary => {
                if (!transformedDagboekEntries[summary.date]) transformedDagboekEntries[summary.date] = { entries: [], daySummary: null };
                transformedDagboekEntries[summary.date].daySummary = summary.summary;
            });

            // GEWOONTES
            const transformedGewoonteLogs = {};
            gewoonteLogs?.forEach(log => {
                if (!transformedGewoonteLogs[log.date]) transformedGewoonteLogs[log.date] = [];
                if (log.completed) transformedGewoonteLogs[log.date].push(log.habit_id);
            });

            // REFLECTIES
            const transformedReflecties = {
                daily: reflecties?.filter(r => r.type === 'daily') || [],
                weekly: reflecties?.filter(r => r.type === 'weekly') || [],
                monthly: reflecties?.filter(r => r.type === 'monthly') || [],
            };

            // VOEDING
            const transformedVoedingMeals = {};
            voedingMeals?.forEach(meal => {
                if (!transformedVoedingMeals[meal.date]) transformedVoedingMeals[meal.date] = { meals: [] };
                transformedVoedingMeals[meal.date].meals.push(meal);
            });

            setData({
                settings: settings || { notificationsEnabled: false, targetKcal: 2000 },
                dagboek: { entries: transformedDagboekEntries, daySummaries: {} }, // Summaries already merged into entries structure in App logic, but checking state shape
                verzameling: {
                    items: verzamelingItems || [],
                    categories: verzamelingCategories?.map(c => c.name) || [] // App expects simple array of strings for now? Check usages.
                },
                ideeen: { ideas: ideeen || [] },
                kalender: { events: kalenderEvents || [] },
                gewoontes: {
                    habits: gewoontes || [],
                    logs: transformedGewoonteLogs
                },
                doelen: { goals: doelen || [] },
                reflecties: transformedReflecties,
                voeding: {
                    meals: transformedVoedingMeals,
                    targetKcal: settings?.target_kcal || 2000
                }
            });
        } catch (error) {
            console.error('Error fetching Supabase data:', error);
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        if (session) loadData();
    }, [session, loadData]);

    // MUTATION FUNCTIONS - Directly calling Supabase
    // In a real app we might use optimistic updates, but for now we'll do simple async calls
    // and reload data or update local state.

    const updateSettings = async (newSettings) => {
        if (!session) return;
        const { error } = await supabase.from('settings').upsert({
            user_id: session.user.id,
            notifications_enabled: newSettings.notificationsEnabled,
            target_kcal: newSettings.targetKcal,
            updated_at: new Date()
        });
        if (!error) loadData(); // Reload to be safe
    };

    // --- DAGBOEK ---
    const addDagboekEntry = async (date, entry) => {
        if (!session) return;
        const { error } = await supabase.from('dagboek_entries').insert({
            user_id: session.user.id,
            date,
            content: entry.content,
            mood: entry.mood,
            tags: entry.tags,
            timestamp: new Date()
        });
        if (!error) loadData();
    };

    const updateDagboekEntry = async (date, entryId, updates) => {
        if (!session) return;
        const { error } = await supabase.from('dagboek_entries').update(updates).eq('id', entryId);
        if (!error) loadData();
    };

    const deleteDagboekEntry = async (date, entryId) => {
        if (!session) return;
        const { error } = await supabase.from('dagboek_entries').delete().eq('id', entryId);
        if (!error) loadData();
    };

    const setDaySummary = async (date, summary) => {
        if (!session) return;
        const { error } = await supabase.from('dagboek_summaries').upsert({
            user_id: session.user.id,
            date,
            summary
        }, { onConflict: 'user_id, date' });
        if (!error) loadData();
    };

    // --- VERZAMELING ---
    const addVerzamelingItem = async (item) => {
        if (!session) return;
        const { error } = await supabase.from('verzameling_items').insert({
            user_id: session.user.id,
            ...item
        });
        if (!error) loadData();
    };

    const updateVerzamelingItem = async (id, updates) => {
        if (!session) return;
        const { error } = await supabase.from('verzameling_items').update(updates).eq('id', id);
        if (!error) loadData();
    };

    const deleteVerzamelingItem = async (id) => {
        if (!session) return;
        const { error } = await supabase.from('verzameling_items').delete().eq('id', id);
        if (!error) loadData();
    };

    const addVerzamelingCategory = async (categoryName) => {
        if (!session) return;
        // Check if exists first? Or just insert.
        const { error } = await supabase.from('verzameling_categories').insert({
            user_id: session.user.id,
            name: categoryName
        });
        if (!error) loadData();
    };

    // --- IDEEEN ---
    const addIdee = async (idea) => {
        if (!session) return;
        const { error } = await supabase.from('ideeen').insert({
            user_id: session.user.id,
            ...idea
        });
        if (!error) loadData();
    };
    const updateIdee = async (id, updates) => {
        if (!session) return;
        const { error } = await supabase.from('ideeen').update(updates).eq('id', id);
        if (!error) loadData();
    };
    const deleteIdee = async (id) => {
        if (!session) return;
        const { error } = await supabase.from('ideeen').delete().eq('id', id);
        if (!error) loadData();
    };

    // --- KALENDER ---
    const addEvent = async (event) => {
        if (!session) return;
        const { error } = await supabase.from('kalender_events').insert({
            user_id: session.user.id,
            title: event.title,
            description: event.description,
            start_time: event.startTime || event.start_time,
            end_time: event.endTime || event.end_time,
            all_day: event.allDay || event.all_day,
            category: event.category
        });
        if (!error) loadData();
    };
    const updateEvent = async (id, updates) => {
        if (!session) return;
        // Map keys if necessary, but assuming updates match DB columns or are handled
        const { error } = await supabase.from('kalender_events').update(updates).eq('id', id);
        if (!error) loadData();
    };
    const deleteEvent = async (id) => {
        if (!session) return;
        const { error } = await supabase.from('kalender_events').delete().eq('id', id);
        if (!error) loadData();
    };

    // --- GEWOONTES ---
    const addHabit = async (habit) => {
        if (!session) return;
        const { error } = await supabase.from('gewoontes').insert({
            user_id: session.user.id,
            ...habit
        });
        if (!error) loadData();
    };
    const updateHabit = async (id, updates) => {
        if (!session) return;
        const { error } = await supabase.from('gewoontes').update(updates).eq('id', id);
        if (!error) loadData();
    };
    const logHabit = async (habitId, date, completed) => {
        if (!session) return;
        if (completed) {
            const { error } = await supabase.from('gewoonte_logs').insert({
                user_id: session.user.id,
                habit_id: habitId,
                date,
                completed: true
            });
            if (!error) loadData();
        } else {
            const { error } = await supabase.from('gewoonte_logs').delete().match({
                user_id: session.user.id,
                habit_id: habitId,
                date
            });
            if (!error) loadData();
        }
    };

    // --- DOELEN ---
    const addDoel = async (doel) => {
        if (!session) return;
        const { error } = await supabase.from('doelen').insert({
            user_id: session.user.id,
            ...doel
        });
        if (!error) loadData();
    };
    const updateDoel = async (id, updates) => {
        if (!session) return;
        const { error } = await supabase.from('doelen').update(updates).eq('id', id);
        if (!error) loadData();
    };
    const deleteDoel = async (id) => {
        if (!session) return;
        const { error } = await supabase.from('doelen').delete().eq('id', id);
        if (!error) loadData();
    };
    const toggleMilestone = async (goalId, milestoneIndex) => {
        if (!session) return;
        // Need to fetch, modification, then update. Supabase doesn't support array update easily by index
        const { data: goal } = await supabase.from('doelen').select('milestones').eq('id', goalId).single();
        if (goal && goal.milestones) {
            const newMilestones = [...goal.milestones];
            newMilestones[milestoneIndex].completed = !newMilestones[milestoneIndex].completed;
            const { error } = await supabase.from('doelen').update({ milestones: newMilestones }).eq('id', goalId);
            if (!error) loadData();
        }
    };

    // --- REFLECTIES ---
    const performAddReflection = async (reflection, type) => {
        if (!session) return;
        const { error } = await supabase.from('reflecties').insert({
            user_id: session.user.id,
            type,
            ...reflection
        });
        if (!error) loadData();
    };
    const performUpdateReflection = async (id, updates) => {
        if (!session) return;
        const { error } = await supabase.from('reflecties').update(updates).eq('id', id);
        if (!error) loadData();
    };
    const performDeleteReflection = async (id) => {
        if (!session) return;
        const { error } = await supabase.from('reflecties').delete().eq('id', id);
        if (!error) loadData();
    };

    const addDailyReflectie = (r) => performAddReflection(r, 'daily');
    const updateDailyReflectie = (id, u) => performUpdateReflection(id, u);
    const deleteDailyReflectie = (id) => performDeleteReflection(id);

    const addWeeklyReflection = (r) => performAddReflection(r, 'weekly');
    const updateWeeklyReflection = (id, u) => performUpdateReflection(id, u);
    const deleteWeeklyReflection = (id) => performDeleteReflection(id);

    const addMonthlyReflection = (r) => performAddReflection(r, 'monthly');
    const updateMonthlyReflection = (id, u) => performUpdateReflection(id, u);
    const deleteMonthlyReflection = (id) => performDeleteReflection(id);


    // --- VOEDING ---
    const addMeal = async (date, mealData) => {
        if (!session) return;
        const { error } = await supabase.from('voeding_meals').insert({
            user_id: session.user.id,
            date,
            ...mealData
        });
        if (!error) loadData();
    };
    const updateMeal = async (date, mealId, updates) => {
        if (!session) return;
        const { error } = await supabase.from('voeding_meals').update(updates).eq('id', mealId);
        if (!error) loadData();
    };
    const deleteMeal = async (date, mealId) => {
        if (!session) return;
        const { error } = await supabase.from('voeding_meals').delete().eq('id', mealId);
        if (!error) loadData();
    };
    const setKcalTarget = async (targetKcal) => {
        updateSettings({ targetKcal });
    };


    const value = {
        session,
        data,
        loading,
        updateSettings,
        addDagboekEntry, updateDagboekEntry, deleteDagboekEntry, setDaySummary,
        addVerzamelingItem, updateVerzamelingItem, deleteVerzamelingItem, addVerzamelingCategory,
        addIdee, updateIdee, deleteIdee,
        addEvent, updateEvent, deleteEvent,
        addHabit, updateHabit, logHabit,
        addDoel, updateDoel, deleteDoel, toggleMilestone,
        addDailyReflectie, updateDailyReflectie, deleteDailyReflectie,
        addWeeklyReflection, updateWeeklyReflection, deleteWeeklyReflection,
        addMonthlyReflection, updateMonthlyReflection, deleteMonthlyReflection,
        addMeal, updateMeal, deleteMeal, setKcalTarget
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
