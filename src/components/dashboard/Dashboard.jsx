import { useApp } from '../../contexts/AppContextSupabase';
import { getDateString, formatDate, getRelativeDateText } from '../../utils/dateHelpers';
import { Calendar, Flame, BookOpen, Lightbulb, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data } = useApp();

  const today = getDateString();
  const todayEntries = data.dagboek[today]?.entries || [];
  const todayEvents = data.kalender.events.filter(e => e.date === today);
  const todayHabits = data.gewoontes.habits.filter(h => h.active);
  const todayLogs = data.gewoontes.logs[today] || {};

  // Bereken voltooide gewoontes vandaag
  const completedHabitsToday = todayHabits.filter(h => todayLogs[h.id]?.completed).length;

  // Top 3 langste streaks
  const habitsWithStreaks = todayHabits.map(habit => {
    let currentStreak = 0;
    let checkDate = new Date();

    // Simpele streak berekening (voor demo)
    for (let i = 0; i < 365; i++) {
      const dateStr = getDateString(checkDate);
      const log = data.gewoontes.logs[dateStr]?.[habit.id];

      if (log?.completed) {
        currentStreak++;
      } else if (dateStr !== today) {
        break;
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    return { ...habit, currentStreak };
  }).sort((a, b) => b.currentStreak - a.currentStreak).slice(0, 3);

  // Recente items
  const recentIdeas = data.ideeen.items.slice(-3).reverse();
  const recentCollection = data.verzameling.items.slice(-3).reverse();

  // Actieve doelen
  const activeGoals = data.doelen.goals.filter(g => g.status === 'active').slice(0, 3);

  // Aankomende events
  const upcomingEvents = data.kalender.events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">{formatDate(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
              <BookOpen className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dagboek Entries</p>
              <p className="text-2xl font-bold">{todayEntries.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success bg-opacity-10 rounded-lg">
              <Flame className="text-success" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gewoontes</p>
              <p className="text-2xl font-bold">{completedHabitsToday}/{todayHabits.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning bg-opacity-10 rounded-lg">
              <Calendar className="text-warning" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Events Vandaag</p>
              <p className="text-2xl font-bold">{todayEvents.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-info bg-opacity-10 rounded-lg">
              <Target className="text-info" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Actieve Doelen</p>
              <p className="text-2xl font-bold">{activeGoals.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vandaag widget */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Vandaag</h2>

            {todayEvents.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Events</h3>
                {todayEvents.map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-1 h-12 rounded" style={{ backgroundColor: event.color }}></div>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      {event.startTime && <p className="text-sm text-gray-600 dark:text-gray-400">{event.startTime}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">Geen events voor vandaag</p>
            )}
          </div>

          {/* Aankomende events */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Aankomende Events</h2>
              <Link to="/kalender" className="text-primary hover:underline text-sm">Alles bekijken</Link>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="space-y-2">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-10 rounded" style={{ backgroundColor: event.color }}></div>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{getRelativeDateText(event.date)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">Geen aankomende events</p>
            )}
          </div>

          {/* Recente ideeën */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Lightbulb size={24} />
                Recente Ideeën
              </h2>
              <Link to="/ideeen" className="text-primary hover:underline text-sm">Alles bekijken</Link>
            </div>

            {recentIdeas.length > 0 ? (
              <div className="space-y-2">
                {recentIdeas.map(idea => (
                  <div key={idea.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{idea.title}</p>
                      <span className={`px-2 py-1 text-xs rounded ${idea.priority === 'high' ? 'bg-danger text-white' :
                          idea.priority === 'medium' ? 'bg-warning text-white' :
                            'bg-gray-300 dark:bg-gray-600'
                        }`}>
                        {idea.priority === 'high' ? 'Hoog' : idea.priority === 'medium' ? 'Medium' : 'Laag'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">Nog geen ideeën toegevoegd</p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Streaks */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Flame className="text-warning" />
              Top Streaks
            </h2>

            {habitsWithStreaks.length > 0 ? (
              <div className="space-y-3">
                {habitsWithStreaks.map(habit => (
                  <div key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium">{habit.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{habit.currentStreak} dagen</p>
                    </div>
                    <Flame className="text-warning" size={24} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">Begin met gewoontes tracken</p>
            )}
          </div>

          {/* Actieve doelen */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Target size={24} />
                Actieve Doelen
              </h2>
              <Link to="/doelen" className="text-primary hover:underline text-sm">Alles</Link>
            </div>

            {activeGoals.length > 0 ? (
              <div className="space-y-3">
                {activeGoals.map(goal => (
                  <div key={goal.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="font-medium mb-2">{goal.title}</p>
                    {goal.type === 'progress' && (
                      <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${goal.currentValue}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">Nog geen actieve doelen</p>
            )}
          </div>

          {/* Snelle acties */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Snelle Acties</h2>
            <div className="space-y-2">
              <Link to="/dagboek" className="block w-full btn-primary text-center">
                Nieuwe Dagboek Entry
              </Link>
              <Link to="/ideeen" className="block w-full btn-secondary text-center">
                Nieuw Idee
              </Link>
              <Link to="/kalender" className="block w-full btn-secondary text-center">
                Event Toevoegen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
