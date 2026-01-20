import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { getDateString, formatDate } from '../../utils/dateHelpers';
import { Calendar, Edit2, Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import ReflectieModal from './ReflectieModal';
import WeeklyReflectieModal from './WeeklyReflectieModal';
import MonthlyReflectieModal from './MonthlyReflectieModal';

export default function Reflectie() {
  const { data, deleteDailyReflectie, deleteWeeklyReflection, deleteMonthlyReflection } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
  const [viewType, setViewType] = useState('daily'); // daily, weekly, monthly
  const [editingWeekly, setEditingWeekly] = useState(null);
  const [editingMonthly, setEditingMonthly] = useState(null);

  const dateString = getDateString(selectedDate);
  const dailyReflection = data.reflecties.daily[dateString];

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

  const handleDelete = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Weet je zeker dat je deze reflectie wilt verwijderen?')) {
      deleteDailyReflectie(dateString);
    }
  };

  const renderDailyView = () => (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
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
      </div>

      {/* Daily Reflection */}
      {dailyReflection ? (
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-semibold">Dagelijkse Reflectie</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-danger hover:bg-opacity-10 rounded transition-colors"
              >
                <Trash2 size={18} className="text-danger" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {dailyReflection.gratitude && dailyReflection.gratitude.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Dankbaarheid:
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {dailyReflection.gratitude.map((item, idx) => (
                    <li key={idx} className="text-gray-600 dark:text-gray-400">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {dailyReflection.highlights && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Hoogtepunten van de dag:
                </h4>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {dailyReflection.highlights}
                </p>
              </div>
            )}

            {dailyReflection.challenges && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Uitdagingen:
                </h4>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {dailyReflection.challenges}
                </p>
              </div>
            )}

            {dailyReflection.learnings && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Geleerd vandaag:
                </h4>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {dailyReflection.learnings}
                </p>
              </div>
            )}

            {dailyReflection.tomorrow && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Focus voor morgen:
                </h4>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {dailyReflection.tomorrow}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
              Laatst bijgewerkt: {new Date(dailyReflection.updatedAt).toLocaleString('nl-NL')}
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Geen reflectie voor deze dag
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            Reflectie Toevoegen
          </button>
        </div>
      )}
    </div>
  );

  const handleDeleteWeekly = (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Weet je zeker dat je deze wekelijkse reflectie wilt verwijderen?')) {
      deleteWeeklyReflection(id);
    }
  };

  const handleDeleteMonthly = (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Weet je zeker dat je deze maandelijkse reflectie wilt verwijderen?')) {
      deleteMonthlyReflection(id);
    }
  };

  const renderWeeklyView = () => {
    const weeklyReflections = data.reflecties.weekly || [];
    const sortedWeekly = [...weeklyReflections].sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.weekNumber - a.weekNumber;
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={() => {
              setEditingWeekly(null);
              setIsWeeklyModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Nieuwe Wekelijkse Reflectie
          </button>
        </div>

        {sortedWeekly.length > 0 ? (
          <div className="space-y-4">
            {sortedWeekly.map((reflection) => (
              <div key={reflection.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold">
                    Week {reflection.weekNumber}, {reflection.year}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingWeekly(reflection);
                        setIsWeeklyModalOpen(true);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteWeekly(reflection.id)}
                      className="p-2 hover:bg-danger hover:bg-opacity-10 rounded transition-colors"
                    >
                      <Trash2 size={18} className="text-danger" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {reflection.wins && reflection.wins.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Wins van deze week:
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {reflection.wins.map((win, idx) => (
                          <li key={idx} className="text-gray-600 dark:text-gray-400">
                            {win}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {reflection.challenges && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Uitdagingen:
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {reflection.challenges}
                      </p>
                    </div>
                  )}

                  {reflection.learnings && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Geleerd:
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {reflection.learnings}
                      </p>
                    </div>
                  )}

                  {reflection.habits && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Gewoontes & Progress:
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {reflection.habits}
                      </p>
                    </div>
                  )}

                  {reflection.nextWeekFocus && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Focus voor volgende week:
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {reflection.nextWeekFocus}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                    Aangemaakt op {new Date(reflection.createdAt).toLocaleDateString('nl-NL')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Je hebt nog geen wekelijkse reflecties
            </p>
            <button
              onClick={() => {
                setEditingWeekly(null);
                setIsWeeklyModalOpen(true);
              }}
              className="btn-primary"
            >
              Maak je eerste wekelijkse reflectie
            </button>
          </div>
        )}
      </div>
    );
  };

  const MONTH_NAMES = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ];

  const renderMonthlyView = () => {
    const monthlyReflections = data.reflecties.monthly || [];
    const sortedMonthly = [...monthlyReflections].sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.month - a.month;
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={() => {
              setEditingMonthly(null);
              setIsMonthlyModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Nieuwe Maandelijkse Reflectie
          </button>
        </div>

        {sortedMonthly.length > 0 ? (
          <div className="space-y-4">
            {sortedMonthly.map((reflection) => (
              <div key={reflection.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold">
                    {MONTH_NAMES[reflection.month - 1]} {reflection.year}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingMonthly(reflection);
                        setIsMonthlyModalOpen(true);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteMonthly(reflection.id)}
                      className="p-2 hover:bg-danger hover:bg-opacity-10 rounded transition-colors"
                    >
                      <Trash2 size={18} className="text-danger" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {reflection.achievements && reflection.achievements.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Prestaties:
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {reflection.achievements.map((achievement, idx) => (
                          <li key={idx} className="text-gray-600 dark:text-gray-400">
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {reflection.challenges && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Uitdagingen:
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {reflection.challenges}
                      </p>
                    </div>
                  )}

                  {reflection.growthAreas && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Groei & Ontwikkeling:
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {reflection.growthAreas}
                      </p>
                    </div>
                  )}

                  {reflection.nextMonthGoals && reflection.nextMonthGoals.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Doelen voor volgende maand:
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {reflection.nextMonthGoals.map((goal, idx) => (
                          <li key={idx} className="text-gray-600 dark:text-gray-400">
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {reflection.overall && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Algehele Reflectie:
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {reflection.overall}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                    Aangemaakt op {new Date(reflection.createdAt).toLocaleDateString('nl-NL')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Je hebt nog geen maandelijkse reflecties
            </p>
            <button
              onClick={() => {
                setEditingMonthly(null);
                setIsMonthlyModalOpen(true);
              }}
              className="btn-primary"
            >
              Maak je eerste maandelijkse reflectie
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reflectie</h1>
      </div>

      {/* View Type Selector */}
      <div className="card">
        <div className="flex gap-2">
          <button
            onClick={() => setViewType('daily')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewType === 'daily'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Dagelijks
          </button>
          <button
            onClick={() => setViewType('weekly')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewType === 'weekly'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Wekelijks
          </button>
          <button
            onClick={() => setViewType('monthly')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewType === 'monthly'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Maandelijks
          </button>
        </div>
      </div>

      {/* View Content */}
      {viewType === 'daily' && renderDailyView()}
      {viewType === 'weekly' && renderWeeklyView()}
      {viewType === 'monthly' && renderMonthlyView()}

      <ReflectieModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={dateString}
        existing={dailyReflection}
      />

      <WeeklyReflectieModal
        isOpen={isWeeklyModalOpen}
        onClose={() => {
          setIsWeeklyModalOpen(false);
          setEditingWeekly(null);
        }}
        reflection={editingWeekly}
      />

      <MonthlyReflectieModal
        isOpen={isMonthlyModalOpen}
        onClose={() => {
          setIsMonthlyModalOpen(false);
          setEditingMonthly(null);
        }}
        reflection={editingMonthly}
      />
    </div>
  );
}
