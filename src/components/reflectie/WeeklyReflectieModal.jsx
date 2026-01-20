import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../contexts/AppContextSupabase';
import { X, Plus } from 'lucide-react';

export default function WeeklyReflectieModal({ isOpen, onClose, reflection }) {
  const { addWeeklyReflection, updateWeeklyReflection } = useApp();

  const [weekNumber, setWeekNumber] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [wins, setWins] = useState([]);
  const [winInput, setWinInput] = useState('');
  const [challenges, setChallenges] = useState('');
  const [learnings, setLearnings] = useState('');
  const [nextWeekFocus, setNextWeekFocus] = useState('');
  const [habits, setHabits] = useState('');

  useEffect(() => {
    if (reflection) {
      setWeekNumber(reflection.weekNumber || '');
      setYear(reflection.year || new Date().getFullYear());
      setWins(reflection.wins || []);
      setChallenges(reflection.challenges || '');
      setLearnings(reflection.learnings || '');
      setNextWeekFocus(reflection.nextWeekFocus || '');
      setHabits(reflection.habits || '');
    } else {
      // Auto-fill current week number
      const now = new Date();
      const currentWeek = getWeekNumber(now);
      setWeekNumber(currentWeek.toString());
      setYear(now.getFullYear());
      setWins([]);
      setChallenges('');
      setLearnings('');
      setNextWeekFocus('');
      setHabits('');
    }
  }, [reflection, isOpen]);

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const reflectionData = {
      weekNumber: parseInt(weekNumber),
      year,
      wins,
      challenges,
      learnings,
      nextWeekFocus,
      habits,
    };

    if (reflection) {
      updateWeeklyReflection(reflection.id, reflectionData);
    } else {
      addWeeklyReflection(reflectionData);
    }

    onClose();
  };

  const addWin = () => {
    if (winInput) {
      setWins([...wins, winInput]);
      setWinInput('');
    }
  };

  const removeWin = (idx) => {
    setWins(wins.filter((_, i) => i !== idx));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reflection ? 'Wekelijkse Reflectie Bewerken' : 'Nieuwe Wekelijkse Reflectie'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Week Nummer *</label>
            <input
              type="number"
              min="1"
              max="53"
              value={weekNumber}
              onChange={(e) => setWeekNumber(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Jaar *</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              required
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Wins van deze week (3-5 hoogtepunten)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={winInput}
              onChange={(e) => setWinInput(e.target.value)}
              className="input-field flex-1"
              placeholder="Voeg een win toe..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWin())}
            />
            <button type="button" onClick={addWin} className="btn-secondary">
              <Plus size={18} />
            </button>
          </div>
          {wins.length > 0 && (
            <div className="space-y-2">
              {wins.map((win, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <span className="flex-1 text-sm">{win}</span>
                  <button
                    type="button"
                    onClick={() => removeWin(idx)}
                    className="p-1 hover:bg-danger hover:bg-opacity-10 rounded transition-colors"
                  >
                    <X size={16} className="text-danger" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Uitdagingen deze week
          </label>
          <textarea
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            rows={3}
            className="input-field"
            placeholder="Wat waren de belangrijkste uitdagingen?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Belangrijkste lessen
          </label>
          <textarea
            value={learnings}
            onChange={(e) => setLearnings(e.target.value)}
            rows={3}
            className="input-field"
            placeholder="Wat heb je deze week geleerd?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Gewoontes & Progress
          </label>
          <textarea
            value={habits}
            onChange={(e) => setHabits(e.target.value)}
            rows={2}
            className="input-field"
            placeholder="Hoe gingen je gewoontes deze week?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Focus voor volgende week
          </label>
          <textarea
            value={nextWeekFocus}
            onChange={(e) => setNextWeekFocus(e.target.value)}
            rows={2}
            className="input-field"
            placeholder="Waar ga je je volgende week op richten?"
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Annuleren
          </button>
          <button type="submit" className="btn-primary">
            {reflection ? 'Bijwerken' : 'Opslaan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
