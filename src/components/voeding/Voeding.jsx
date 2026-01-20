import { useState } from 'react';
import { useApp } from '../../contexts/AppContextSupabase';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getDateString, formatDate } from '../../utils/dateHelpers';
import { Plus, Utensils, Target, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import MaaltijdModal from './MaaltijdModal';
import KcalDoelModal from './KcalDoelModal';

export default function Voeding() {
  const { data, deleteMeal } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKcalDoelModalOpen, setIsKcalDoelModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  // Veiligheidscontrole voor voeding data
  if (!data.voeding || !data.voeding.meals) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Voeding data wordt geladen...</div>
      </div>
    );
  }

  const dateString = getDateString(selectedDate);
  const dayData = data.voeding.meals[dateString] || { meals: [] };
  const totalKcal = dayData.meals.reduce((sum, meal) => sum + (meal.kcal || 0), 0);
  const targetKcal = data.voeding.targetKcal || 2000;
  const percentageOfTarget = targetKcal > 0 ? Math.round((totalKcal / targetKcal) * 100) : 0;

  // Functie om te checken of een datum maaltijden heeft
  const tileClassName = ({ date }) => {
    const dateStr = getDateString(date);
    const hasMeals = data.voeding.meals[dateStr]?.meals?.length > 0;
    return hasMeals ? 'has-entries' : '';
  };

  const handleAddMeal = () => {
    setEditingMeal(null);
    setIsModalOpen(true);
  };

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setIsModalOpen(true);
  };

  const handleDeleteMeal = (mealId) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Weet je zeker dat je deze maaltijd wilt verwijderen?')) {
      deleteMeal(dateString, mealId);
    }
  };

  const getMealIcon = (type) => {
    const icons = {
      'Ontbijt': '🌅',
      'Lunch': '☀️',
      'Diner': '🌙',
      'Snack': '🍎',
      'Drinken': '💧',
    };
    return icons[type] || '🍽️';
  };

  const getProgressColor = () => {
    if (percentageOfTarget < 80) return 'bg-warning';
    if (percentageOfTarget > 120) return 'bg-danger';
    return 'bg-success';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Utensils size={32} className="text-primary" />
          <h1 className="text-3xl font-bold">Voedingsdagboek</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsKcalDoelModalOpen(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Target size={20} />
            Kcal Doel ({targetKcal})
          </button>
          <button onClick={handleAddMeal} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Maaltijd Toevoegen
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kalender */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Selecteer Datum</h2>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={tileClassName}
            locale="nl-NL"
            className="w-full"
          />
        </div>

        {/* Maaltijden voor geselecteerde dag */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{formatDate(selectedDate, 'EEEE, d MMMM yyyy')}</h2>
          </div>

          {/* Dagelijkse Statistieken */}
          <div className="card bg-gradient-to-br from-primary/10 to-success/10 border-2 border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{totalKcal}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Totaal Kcal</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">{targetKcal}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Streef Kcal</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${percentageOfTarget < 80 ? 'text-warning' :
                    percentageOfTarget > 120 ? 'text-danger' : 'text-success'
                  }`}>
                  {percentageOfTarget}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Van Doel</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
                  style={{ width: `${Math.min(percentageOfTarget, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>0</span>
                <span>{targetKcal}</span>
              </div>
            </div>

            {percentageOfTarget > 0 && (
              <div className="mt-3 text-center text-sm">
                {percentageOfTarget < 80 && (
                  <span className="text-warning">⚠️ Nog {targetKcal - totalKcal} kcal te gaan</span>
                )}
                {percentageOfTarget >= 80 && percentageOfTarget <= 120 && (
                  <span className="text-success">✅ Perfect binnen je doel!</span>
                )}
                {percentageOfTarget > 120 && (
                  <span className="text-danger">⚠️ {totalKcal - targetKcal} kcal over je doel</span>
                )}
              </div>
            )}
          </div>

          {/* Maaltijden Lijst */}
          {dayData.meals.length === 0 ? (
            <div className="card text-center py-12">
              <Utensils size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Nog geen maaltijden geregistreerd voor deze dag
              </p>
              <button onClick={handleAddMeal} className="btn-primary">
                <Plus size={20} className="inline mr-2" />
                Eerste Maaltijd Toevoegen
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {dayData.meals.map((meal) => (
                <div key={meal.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl">{getMealIcon(meal.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {meal.type}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(meal.timestamp).toLocaleTimeString('nl-NL', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg">{meal.name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>📏 {meal.amount} {meal.unit}</span>
                          <span className="font-bold text-primary">{meal.kcal} kcal</span>
                        </div>
                        {meal.notes && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                            {meal.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditMeal(meal)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="p-2 hover:bg-danger hover:bg-opacity-10 rounded transition-colors"
                      >
                        <Trash2 size={16} className="text-danger" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Maaltijd Modal */}
      <MaaltijdModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMeal(null);
        }}
        date={dateString}
        meal={editingMeal}
      />

      {/* Kcal Doel Modal */}
      <KcalDoelModal
        isOpen={isKcalDoelModalOpen}
        onClose={() => setIsKcalDoelModalOpen(false)}
      />
    </div>
  );
}
