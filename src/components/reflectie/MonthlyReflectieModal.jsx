import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../contexts/AppContextSupabase';
import { X, Plus } from 'lucide-react';

const MONTHS = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
];

export default function MonthlyReflectieModal({ isOpen, onClose, reflection }) {
  const { addMonthlyReflection, updateMonthlyReflection } = useApp();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [achievements, setAchievements] = useState([]);
  const [achievementInput, setAchievementInput] = useState('');
  const [challenges, setChallenges] = useState('');
  const [growthAreas, setGrowthAreas] = useState('');
  const [nextMonthGoals, setNextMonthGoals] = useState([]);
  const [goalInput, setGoalInput] = useState('');
  const [overall, setOverall] = useState('');

  useEffect(() => {
    if (reflection) {
      setMonth(reflection.month || new Date().getMonth() + 1);
      setYear(reflection.year || new Date().getFullYear());
      setAchievements(reflection.achievements || []);
      setChallenges(reflection.challenges || '');
      setGrowthAreas(reflection.growthAreas || '');
      setNextMonthGoals(reflection.nextMonthGoals || []);
      setOverall(reflection.overall || '');
    } else {
      const now = new Date();
      setMonth(now.getMonth() + 1);
      setYear(now.getFullYear());
      setAchievements([]);
      setChallenges('');
      setGrowthAreas('');
      setNextMonthGoals([]);
      setOverall('');
    }
  }, [reflection, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const reflectionData = {
      month,
      year,
      achievements,
      challenges,
      growthAreas,
      nextMonthGoals,
      overall,
    };

    if (reflection) {
      updateMonthlyReflection(reflection.id, reflectionData);
    } else {
      addMonthlyReflection(reflectionData);
    }

    onClose();
  };

  const addAchievement = () => {
    if (achievementInput) {
      setAchievements([...achievements, achievementInput]);
      setAchievementInput('');
    }
  };

  const removeAchievement = (idx) => {
    setAchievements(achievements.filter((_, i) => i !== idx));
  };

  const addGoal = () => {
    if (goalInput) {
      setNextMonthGoals([...nextMonthGoals, goalInput]);
      setGoalInput('');
    }
  };

  const removeGoal = (idx) => {
    setNextMonthGoals(nextMonthGoals.filter((_, i) => i !== idx));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reflection ? 'Maandelijkse Reflectie Bewerken' : 'Nieuwe Maandelijkse Reflectie'}
      size="lg"
      closeOnBackdropClick={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Maand *</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              required
              className="input-field"
            >
              {MONTHS.map((m, idx) => (
                <option key={idx} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
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
            Belangrijkste Prestaties
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={achievementInput}
              onChange={(e) => setAchievementInput(e.target.value)}
              className="input-field flex-1"
              placeholder="Voeg een prestatie toe..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
            />
            <button type="button" onClick={addAchievement} className="btn-secondary">
              <Plus size={18} />
            </button>
          </div>
          {achievements.length > 0 && (
            <div className="space-y-2">
              {achievements.map((achievement, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <span className="flex-1 text-sm">{achievement}</span>
                  <button
                    type="button"
                    onClick={() => removeAchievement(idx)}
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
            Uitdagingen & Moeilijkheden
          </label>
          <textarea
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            rows={3}
            className="input-field"
            placeholder="Wat waren de grootste uitdagingen deze maand?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Groei & Ontwikkeling
          </label>
          <textarea
            value={growthAreas}
            onChange={(e) => setGrowthAreas(e.target.value)}
            rows={3}
            className="input-field"
            placeholder="Op welke gebieden ben je gegroeid?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Doelen voor Volgende Maand
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="input-field flex-1"
              placeholder="Voeg een doel toe..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
            />
            <button type="button" onClick={addGoal} className="btn-secondary">
              <Plus size={18} />
            </button>
          </div>
          {nextMonthGoals.length > 0 && (
            <div className="space-y-2">
              {nextMonthGoals.map((goal, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <span className="flex-1 text-sm">{goal}</span>
                  <button
                    type="button"
                    onClick={() => removeGoal(idx)}
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
            Algehele Reflectie
          </label>
          <textarea
            value={overall}
            onChange={(e) => setOverall(e.target.value)}
            rows={4}
            className="input-field"
            placeholder="Jouw algemene gedachten over deze maand..."
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
