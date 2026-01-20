import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { getDateString, formatDate } from '../../utils/dateHelpers';
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Gewoontes() {
  const { data, logHabit } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateString = getDateString(selectedDate);
  const todayLogs = data.gewoontes.logs[dateString] || {};
  const activeHabits = data.gewoontes.habits.filter(h => h.active);

  const toggleHabit = (habitId) => {
    const currentLog = todayLogs[habitId];
    logHabit(dateString, habitId, {
      completed: !currentLog?.completed,
      duration: currentLog?.duration || null,
      notes: currentLog?.notes || null,
    });
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = getDateString(new Date()) === dateString;

  // Bereken completion rate
  const completedToday = activeHabits.filter(h => todayLogs[h.id]?.completed).length;
  const completionRate = activeHabits.length > 0
    ? Math.round((completedToday / activeHabits.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gewoontes Tracker</h1>
      </div>

      {/* Datum navigatie */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousDay}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {formatDate(selectedDate, 'EEEE, d MMMM yyyy')}
            </h2>
            {!isToday && (
              <button
                onClick={goToToday}
                className="text-primary hover:underline text-sm mt-1"
              >
                Ga naar vandaag
              </button>
            )}
          </div>

          <button
            onClick={goToNextDay}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Voortgang</span>
            <span className="text-sm font-bold">{completedToday}/{activeHabits.length} ({completionRate}%)</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-success h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Gewoontes lijst */}
        <div className="space-y-3">
          {activeHabits.map((habit) => {
            const isCompleted = todayLogs[habit.id]?.completed;

            return (
              <div
                key={habit.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  isCompleted
                    ? 'border-success bg-success bg-opacity-10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onClick={() => toggleHabit(habit.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted ? 'bg-success text-white' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      {isCompleted ? <Check size={24} /> : <X size={24} />}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{habit.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Doel: {habit.frequency === 'daily' ? 'Dagelijks' : `${habit.weeklyGoal}x per week`}
                      </p>
                    </div>
                  </div>

                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-3xl transition-all"
                    style={{
                      backgroundColor: habit.color + '20',
                      color: habit.color,
                      transform: isCompleted ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    {isCompleted ? '✓' : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activeHabits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Je hebt nog geen gewoontes toegevoegd
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Standaard gewoontes zijn al vooraf ingesteld
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
