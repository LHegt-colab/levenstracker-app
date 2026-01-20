import { useState } from 'react';
import { useApp } from '../../contexts/AppContextSupabase';
import { Plus, Trash2, Edit2, Target, CheckCircle2, Circle } from 'lucide-react';
import DoelenModal from './DoelenModal';

export default function Doelen() {
  const { data, deleteDoel, toggleMilestone } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, completed

  const handleEdit = (item) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Weet je zeker dat je dit doel wilt verwijderen?')) {
      deleteDoel(id);
    }
  };

  const filteredGoals = data.doelen.goals.filter(goal => {
    if (filter === 'active') return !goal.completed;
    if (filter === 'completed') return goal.completed;
    return true;
  });

  const calculateProgress = (goal) => {
    if (!goal.milestones || goal.milestones.length === 0) return 0;
    const completed = goal.milestones.filter(m => m.completed).length;
    return Math.round((completed / goal.milestones.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Doelen & Mijlpalen</h1>
        <button
          onClick={() => {
            setEditItem(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nieuw Doel
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="card">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            Alle ({data.doelen.goals.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'active'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            Actief ({data.doelen.goals.filter(g => !g.completed).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'completed'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            Voltooid ({data.doelen.goals.filter(g => g.completed).length})
          </button>
        </div>
      </div>

      {/* Goals List */}
      {filteredGoals.length > 0 ? (
        <div className="space-y-4">
          {filteredGoals.map(goal => {
            const progress = calculateProgress(goal);
            return (
              <div
                key={goal.id}
                className={`card ${goal.completed ? 'bg-success bg-opacity-5 border-success' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Target
                      size={24}
                      className={goal.completed ? 'text-success' : 'text-primary'}
                    />
                    <div className="flex-1">
                      <h3 className={`font-semibold text-xl ${goal.completed ? 'line-through text-gray-500' : ''}`}>
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 hover:bg-danger hover:bg-opacity-10 rounded transition-colors"
                    >
                      <Trash2 size={18} className="text-danger" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Voortgang</span>
                      <span className="text-sm font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${goal.completed ? 'bg-success' : 'bg-primary'
                          }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Milestones */}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                      Mijlpalen:
                    </h4>
                    {goal.milestones.map((milestone, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => toggleMilestone(goal.id, idx)}
                      >
                        {milestone.completed ? (
                          <CheckCircle2 size={20} className="text-success flex-shrink-0" />
                        ) : (
                          <Circle size={20} className="text-gray-400 flex-shrink-0" />
                        )}
                        <span
                          className={`text-sm ${milestone.completed
                              ? 'line-through text-gray-500'
                              : 'text-gray-700 dark:text-gray-300'
                            }`}
                        >
                          {milestone.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                  <span>
                    Aangemaakt op {new Date(goal.createdAt).toLocaleDateString('nl-NL')}
                  </span>
                  {goal.deadline && (
                    <span>
                      Deadline: {new Date(goal.deadline).toLocaleDateString('nl-NL')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filter !== 'all'
              ? `Geen ${filter === 'active' ? 'actieve' : 'voltooide'} doelen`
              : 'Je hebt nog geen doelen toegevoegd'}
          </p>
          {filter === 'all' && (
            <button onClick={() => setIsModalOpen(true)} className="btn-primary">
              <Plus size={20} className="inline mr-2" />
              Voeg je eerste doel toe
            </button>
          )}
        </div>
      )}

      <DoelenModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditItem(null);
        }}
        item={editItem}
      />
    </div>
  );
}
