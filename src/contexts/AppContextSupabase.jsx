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

// Hardcoded categories since we don't have a table for them yet
const IDEA_CATEGORIES = [
    { id: 'app', name: 'App Ideeën', color: '#3B82F6' },
    { id: 'work', name: 'Werk', color: '#10B981' },
    { id: 'personal', name: 'Persoonlijk', color: '#8B5CF6' },
    { id: 'bucketlist', name: 'Bucket List', color: '#F59E0B' },
    { id: 'other', name: 'Overig', color: '#6B7280' }
];

export const AppProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    // const [debugLogs, setDebugLogs] = useState([]); // Removed Debug Log State
    const [data, setData] = useState({
        settings: { notificationsEnabled: false, targetKcal: 2000 },
        dagboek: { entries: {}, daySummaries: {} },
        verzameling: { items: [], categories: [] },
        ideeen: { ideas: [], categories: IDEA_CATEGORIES },
        kalender: { events: [] },
        gewoontes: { habits: [], logs: {} },
        doelen: { goals: [] },
        reflecties: { daily: [], weekly: [], monthly: [] },
        voeding: { meals: {}, targetKcal: 2000 },
    });

    const addLog = (msg) => {
        const timestamp = new Date().toLocaleTimeString();
        // console.log(`[${timestamp}] ${msg}`); // Simple console log only
    };

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
            const { data: dagboekEntries, error: fetchError } = await supabase.from('dagboek_entries').select('*');
            if (fetchError) addLog(`Fetch Error: ${fetchError.message}`);
            else addLog(`Fetched ${dagboekEntries?.length || 0} diary entries`);
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

            // DEBUG: Log schemas
            const logSchema = (name, arr) => {
                const keys = arr?.length > 0 ? Object.keys(arr[0]).join(', ') : '(No data)';
                const msg = `SCHEMA ${name}: ${keys}`;
                addLog(msg);
                console.log(msg); // Also log to Chrome Console for visibility
            };

            logSchema('Ideeen', ideeen);
            logSchema('Kalender', kalenderEvents);
            logSchema('Doelen', doelen);
            logSchema('Reflecties', reflecties);
            logSchema('Voeding', voedingMeals);

            // DEBUG: Alert user on load counts to verify persistence
            const msg = `Data Geladen:\n` +
                `- Kalender Events: ${kalenderEvents?.length || 0}\n` +
                `- Verzameling Items: ${verzamelingItems?.length || 0}\n` +
                `- Reflecties: ${reflecties?.length || 0}\n` +
                `- Doelen: ${doelen?.length || 0}\n` +
                `- Dagboek: ${dagboekEntries?.length || 0}`;
            console.log(msg);
            // Uncomment the next line if you want to verify load on every refresh (annoying but effective)
            // alert(msg); 

            // Transform raw data to app state structure
            // DAGBOEK
            // Transform raw data to app state structure
            // DAGBOEK
            const transformedDagboekEntries = {};
            dagboekEntries?.forEach(entry => {
                const dateKey = entry.date && entry.date.includes('T') ? entry.date.split('T')[0] : entry.date;
                if (!transformedDagboekEntries[dateKey]) transformedDagboekEntries[dateKey] = { entries: [], daySummary: null };
                transformedDagboekEntries[dateKey].entries.push(entry);
            });
            dagboekSummaries?.forEach(summary => {
                const dateKey = summary.date && summary.date.includes('T') ? summary.date.split('T')[0] : summary.date;
                if (!transformedDagboekEntries[dateKey]) transformedDagboekEntries[dateKey] = { entries: [], daySummary: null };
                transformedDagboekEntries[dateKey].daySummary = summary.summary;
            });

            // GEWOONTES
            const transformedGewoonteLogs = {};
            gewoonteLogs?.forEach(log => {
                if (!transformedGewoonteLogs[log.date]) transformedGewoonteLogs[log.date] = [];
                if (log.completed) transformedGewoonteLogs[log.date].push(log.habit_id);
            });

            // REFLECTIES (Normalize: unpack answers to top level)
            const normalizeReflectie = (r) => ({
                ...r,
                ...(r.answers || {}) // Flatten answers up
            });
            const normReflecties = reflecties?.map(normalizeReflectie) || [];

            // Transform DAILY to object { 'YYYY-MM-DD': reflection }
            const dailyReflectionsObj = {};
            normReflecties.filter(r => r.type === 'daily').forEach(r => {
                // Ensure date is YYYY-MM-DD string
                const dateKey = typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date).toISOString().split('T')[0];
                dailyReflectionsObj[dateKey] = r;
            });

            const transformedReflecties = {
                daily: dailyReflectionsObj, // Component expects Object keyed by date
                weekly: normReflecties.filter(r => r.type === 'weekly'), // Component expects Array
                monthly: normReflecties.filter(r => r.type === 'monthly'), // Component expects Array
            };

            // VOEDING (Normalize: calories -> kcal)
            const transformedVoedingMeals = {};
            voedingMeals?.forEach(meal => {
                const normMeal = {
                    ...meal,
                    kcal: meal.calories || meal.kcal, // Normalize
                    calories: meal.calories || meal.kcal
                };
                if (!transformedVoedingMeals[meal.date]) transformedVoedingMeals[meal.date] = { meals: [] };
                transformedVoedingMeals[meal.date].meals.push(normMeal);
            });

            // DOELEN (Normalize: status -> completed)
            const normDoelen = doelen?.map(d => ({
                ...d,
                completed: d.status === 'completed',
                createdAt: d.created_at
            })) || [];

            // KALENDER (Normalize: start_time -> startTime)
            const normEvents = kalenderEvents?.map(e => ({
                ...e,
                date: e.start_time ? e.start_time.split('T')[0] : null, // Extract YYYY-MM-DD for Component
                startTime: e.start_time ? e.start_time.split('T')[1]?.slice(0, 5) : '', // Extract HH:MM
                endTime: e.end_time ? e.end_time.split('T')[1]?.slice(0, 5) : '',
                start_time: e.start_time, // Keep original
                createdAt: e.created_at
            })) || [];

            // VERZAMELING (Normalize: category -> categoryId)
            const normVerzameling = verzamelingItems?.map(v => ({
                ...v,
                categoryId: v.category,
                createdAt: v.created_at
            })) || [];

            // IDEEEN (Normalize: created_at -> createdAt)
            const normIdeeen = ideeen?.map(i => ({
                ...i,
                createdAt: i.created_at
            })) || [];


            // Fallback for Verzameling Categories
            let processedCategories = verzamelingCategories || [];
            if (processedCategories.length === 0) {
                processedCategories = [
                    { id: 'lezen', name: 'Lezen', color: '#3B82F6' },
                    { id: 'kijken', name: 'Kijken', color: '#10B981' },
                    { id: 'luisteren', name: 'Luisteren', color: '#8B5CF6' },
                    { id: 'tools', name: 'Tools', color: '#F59E0B' },
                    { id: 'recepten', name: 'Recepten', color: '#EC4899' },
                    { id: 'overig', name: 'Overig', color: '#6B7280' }
                ];
            } else {
                // Ensure they have colors
                const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6B7280'];
                processedCategories = processedCategories.map((c, i) => ({
                    ...c,
                    color: c.color || colors[i % colors.length] // Fallback color if missing
                }));
            }

            // NORMALIZE SETTINGS (Snake -> Camel)
            const normSettings = settings ? {
                ...settings,
                notificationsEnabled: settings.notifications_enabled, // Map DB column to App State
                targetKcal: settings.target_kcal,
                theme: settings.theme || 'system'
            } : {
                notificationsEnabled: false,
                targetKcal: 2000,
                theme: 'system'
            };

            setData({
                settings: normSettings,
                dagboek: { entries: transformedDagboekEntries, daySummaries: {} },
                verzameling: {
                    items: normVerzameling,
                    categories: processedCategories
                },
                ideeen: { ideas: normIdeeen, categories: IDEA_CATEGORIES },
                kalender: { events: normEvents },
                gewoontes: {
                    habits: gewoontes || [],
                    logs: transformedGewoonteLogs
                },
                doelen: { goals: normDoelen },
                reflecties: transformedReflecties,
                voeding: {
                    meals: transformedVoedingMeals,
                    targetKcal: settings?.target_kcal || 2000
                }
            });
        } catch (error) {
            console.error('Error fetching Supabase data:', error);
            addLog(`Init Load Error: ${error.message}`);
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

        // Merge new settings with existing client-side state to ensure we don't send undefineds
        const currentSettings = data.settings || {};
        const mergedSettings = { ...currentSettings, ...newSettings };

        const { error } = await supabase.from('settings').upsert({
            user_id: session.user.id,
            notifications_enabled: mergedSettings.notificationsEnabled,
            target_kcal: mergedSettings.targetKcal,
            theme: mergedSettings.theme, // Added theme support
            updated_at: new Date()
        });
        if (!error) loadData(); // Reload to be safe
    };

    // --- DAGBOEK ---
    const addDagboekEntry = async (date, entry) => {
        addLog(`Adding entry for ${date} (User: ${session?.user?.id})`);
        if (!session) {
            addLog("ERROR: No session found!");
            return { error: { message: 'No active session' } };
        }

        try {
            const payload = {
                user_id: session.user.id,
                date,
                content: entry.content,
                mood: entry.mood,
                tags: entry.tags,
                // These fields require the SQL update script to be run:
                energy: entry.energy,
                stress: entry.stress,
                sleep: entry.sleep,
                sport: entry.sport, // Sent as JSONB
                timestamp: new Date()
            };
            addLog(`Payload: ${JSON.stringify(payload)}`);

            const result = await supabase.from('dagboek_entries').insert(payload).select();
            // Added .select() to see if return data comes back

            addLog(`Supabase Result: Status=${result.status} Error=${JSON.stringify(result.error)} Data=${JSON.stringify(result.data)}`);

            if (!result.error) {
                addLog("Insert successful, reloading data...");
                await loadData();
                addLog("Data reload complete");
            } else {
                addLog(`Insert FAILED: ${result.error.message}`);
            }
            return result;
        } catch (err) {
            addLog(`CRITICAL EXCEPTION: ${err.message}`);
            return { error: err };
        }
    };

    const updateDagboekEntry = async (date, entryId, updates) => {
        if (!session) return { error: { message: 'No active session' } };

        // Full payload (requires SQL script)
        const payload = {
            content: updates.content,
            mood: updates.mood,
            tags: updates.tags,
            energy: updates.energy,
            stress: updates.stress,
            sleep: updates.sleep,
            sport: updates.sport,
        };

        const result = await supabase.from('dagboek_entries').update(payload).eq('id', entryId);
        if (!result.error) loadData();
        return result;
    };

    const deleteDagboekEntry = async (date, entryId) => {
        if (!session) return { error: { message: 'No active session' } };
        const result = await supabase.from('dagboek_entries').delete().eq('id', entryId);
        if (!result.error) loadData();
        return result;
    };

    const setDaySummary = async (date, summary) => {
        if (!session) return { error: { message: 'No active session' } };
        const result = await supabase.from('dagboek_summaries').upsert({
            user_id: session.user.id,
            date,
            summary
        }, { onConflict: 'user_id, date' });
        if (!result.error) loadData();
        return result;
    };

    // --- VERZAMELING ---
    const addVerzamelingItem = async (item) => {
        if (!session) return { error: { message: 'No active session' } };
        // Ensure category maps to 'category' column if that's what DB has, or 'categoryId' if changed.
        // Based on previous fixes, DB has 'category'.
        const payload = {
            user_id: session.user.id,
            title: item.title,
            description: item.description,
            category: item.categoryId || item.category, // Map ID to column
            url: item.url,
            tags: item.tags
        };
        const result = await supabase.from('verzameling_items').insert(payload);

        if (result.error) {
            console.error("Verzameling Save Error:", result.error);
            alert(`Verzameling Save Error: ${result.error.message}\n${JSON.stringify(result.error)}`);
        } else {
            loadData();
        }
        return result;
    };

    const updateVerzamelingItem = async (id, updates) => {
        if (!session) return { error: { message: 'No active session' } };
        const payload = { ...updates };
        if (updates.categoryId) {
            payload.category = updates.categoryId;
            delete payload.categoryId;
        }
        const result = await supabase.from('verzameling_items').update(payload).eq('id', id);

        if (result.error) {
            alert(`Verzameling Update Error: ${result.error.message}`);
        } else {
            loadData();
        }
        return result;
    };

    const deleteVerzamelingItem = async (id) => {
        if (!session) return { error: { message: 'No active session' } };
        const result = await supabase.from('verzameling_items').delete().eq('id', id);
        if (!result.error) loadData();
        return result;
    };

    const addVerzamelingCategory = async (categoryName) => {
        if (!session) return { error: { message: 'No active session' } };
        const result = await supabase.from('verzameling_categories').insert({
            user_id: session.user.id,
            name: categoryName,
            // color: generic color?
        });
        if (!result.error) loadData();
        return result;
    };

    // --- IDEEEN ---
    const addIdee = async (idea) => {
        if (!session) return { error: { message: 'No active session' } };
        const result = await supabase.from('ideeen').insert({
            user_id: session.user.id,
            ...idea
        });
        if (!result.error) loadData();
        return result;
    };
    const updateIdee = async (id, updates) => {
        if (!session) return { error: { message: 'No active session' } };
        const result = await supabase.from('ideeen').update(updates).eq('id', id);
        if (!result.error) loadData();
        return result;
    };
    const deleteIdee = async (id) => {
        if (!session) return { error: { message: 'No active session' } };
        const result = await supabase.from('ideeen').delete().eq('id', id);
        if (!result.error) loadData();
        return result;
    };

    // --- KALENDER ---
    const addEvent = async (event) => {
        if (!session) return;
        addLog(`Adding Event: ${event.title}`);

        // Combine date and time if needed, or use as is if ISO
        let start_time = event.startTime || event.start_time;
        let end_time = event.endTime || event.end_time;

        // Fallback for start_time if missing (Postgres requires non-null)
        if (!start_time && event.date) {
            start_time = `${event.date}T09:00:00`; // Default to 9 AM
        } else if (event.date && start_time && !start_time.includes('T')) {
            start_time = `${event.date}T${start_time}:00`;
        }

        if (event.date && end_time && !end_time.includes('T')) {
            end_time = `${event.date}T${end_time}:00`;
        }

        const payload = {
            user_id: session.user.id,
            title: event.title,
            description: event.description || '',
            start_time: start_time, // ISO format required
            end_time: end_time,
            all_day: event.allDay || event.all_day || false,
            category: event.category || 'Afspraak',
            location: event.location || '',
            color: event.color || '#3B82F6',
            recurrence: event.recurrence || null
        };
        addLog(`Event Payload: ${JSON.stringify(payload)}`);

        const { error } = await supabase.from('kalender_events').insert(payload);
        if (error) {
            addLog(`Event Save Error: ${error.message}`);
            alert(`Kalender Fout: ${error.message}\n${JSON.stringify(error)}`);
        } else {
            loadData();
        }
    };
    const updateEvent = async (id, updates) => {
        if (!session) return;
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
        addLog(`Adding Doel: ${doel.title}`);

        // Map completed boolean to status text
        const payload = {
            user_id: session.user.id,
            title: doel.title,
            description: doel.description,
            deadline: doel.deadline,
            status: doel.completed ? 'completed' : 'planned',
            milestones: doel.milestones,
            tags: [] // Schema has tags but modal doesn't set them yet
        };

        const { error } = await supabase.from('doelen').insert(payload);
        if (error) addLog(`Doel Save Error: ${error.message}`);
        else loadData();
    };
    const updateDoel = async (id, updates) => {
        if (!session) return;

        // Handle status mapping if 'completed' field is present in updates
        const payload = { ...updates };
        if (typeof updates.completed !== 'undefined') {
            payload.status = updates.completed ? 'completed' : 'planned';
            delete payload.completed;
        }

        const { error } = await supabase.from('doelen').update(payload).eq('id', id);
        if (error) loadData(); // Reload anyway to sync
        else loadData();
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
    const performAddReflection = async (date, reflection, type) => {
        if (!session) return { error: { message: 'No active session' } };
        addLog(`Adding Reflection (${type}) on ${date}`);
        try {
            // PACK fields into 'answers' JSONB column as per schema
            const answers = {
                gratitude: reflection.gratitude || [],
                highlights: reflection.highlights || '',
                challenges: reflection.challenges || '',
                learnings: reflection.learnings || '',
                tomorrow: reflection.tomorrow || '',
                // Add extended fields for weekly/monthly
                wins: reflection.wins,
                habits: reflection.habits,
                nextWeekFocus: reflection.nextWeekFocus,
                achievements: reflection.achievements,
                growthAreas: reflection.growthAreas,
                nextMonthGoals: reflection.nextMonthGoals,
                overall: reflection.overall
            };

            const payload = {
                user_id: session.user.id,
                type,
                date: date || new Date(), // Use provided date or today
                answers: answers
            };
            addLog(`Reflection Payload: ${JSON.stringify(payload)}`);

            const result = await supabase.from('reflecties').insert(payload).select();

            if (result.error) {
                addLog(`Reflectie ERROR: ${result.error.message}`);
                alert(`Reflectie Save Error: ${result.error.message}`);
            } else {
                addLog(`Reflectie Saved OK`);
                loadData();
            }
            return result;
        } catch (err) {
            addLog(`Reflection Exception: ${err.message}`);
            alert(`Reflectie Exception: ${err.message}`);
            return { error: err };
        }
    };
    const performUpdateReflection = async (id, updates) => {
        if (!session) return { error: { message: 'No active session' } };
        const result = await supabase.from('reflecties').update(updates).eq('id', id);
        if (!result.error) loadData();
        return result;
    };
    const performDeleteReflection = async (id) => {
        if (!session) return { error: { message: 'No active session' } };
        const result = await supabase.from('reflecties').delete().eq('id', id);
        if (!result.error) loadData();
        return result;
    };

    // Corrected signatures to match Modal calls: (date, data)
    const addDailyReflectie = (date, r) => performAddReflection(date, r, 'daily');
    const updateDailyReflectie = (id, u) => performUpdateReflection(id, u);
    const deleteDailyReflectie = (id) => performDeleteReflection(id);

    const addWeeklyReflection = (date, r) => performAddReflection(date, r, 'weekly');
    const updateWeeklyReflection = (id, u) => performUpdateReflection(id, u);
    const deleteWeeklyReflection = (id) => performDeleteReflection(id);

    const addMonthlyReflection = (date, r) => performAddReflection(date, r, 'monthly');
    const updateMonthlyReflection = (id, u) => performUpdateReflection(id, u);
    const deleteMonthlyReflection = (id) => performDeleteReflection(id);


    // --- VOEDING ---
    const addMeal = async (date, mealData) => {
        if (!session) return;
        addLog(`Adding Meal: ${mealData.name}`);
        const { error } = await supabase.from('voeding_meals').insert({
            user_id: session.user.id,
            date,
            ...mealData
        });
        if (error) addLog(`Meal Save Error: ${error.message}`);
        else loadData();
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
        addMeal, updateMeal, deleteMeal, setKcalTarget,
        addMeal, updateMeal, deleteMeal, setKcalTarget,
        addLog, // Keep addLog for internal use if needed, but no state
        refreshData: loadData // Allow manual refresh
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
