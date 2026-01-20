import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../contexts/AppContextSupabase';
import { X, Plus } from 'lucide-react';

export default function ReflectieModal({ isOpen, onClose, date, existing }) {
  const { addDailyReflectie, updateDailyReflectie } = useApp();

  const [gratitude, setGratitude] = useState([]);
  const [gratitudeInput, setGratitudeInput] = useState('');
  const [highlights, setHighlights] = useState('');
  const [challenges, setChallenges] = useState('');
  const [learnings, setLearnings] = useState('');
  const [tomorrow, setTomorrow] = useState('');

  useEffect(() => {
    if (existing) {
      setGratitude(existing.gratitude || []);
      setHighlights(existing.highlights || '');
      setChallenges(existing.challenges || '');
      setLearnings(existing.learnings || '');
      setTomorrow(existing.tomorrow || '');
    } else {
      setGratitude([]);
      setHighlights('');
      setChallenges('');
      setLearnings('');
      setTomorrow('');
    }
  }, [existing, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const reflectionData = {
        gratitude,
        highlights,
        challenges,
        learnings,
        tomorrow,
      };

      let result;
      if (existing) {
        result = await updateDailyReflectie(date, reflectionData);
      } else {
        result = await addDailyReflectie(date, reflectionData);
      }

      if (result && result.error) throw result.error;

      onClose();
    } catch (error) {
      console.error("Fout bij opslaan reflectie:", error);
      alert("Er ging iets mis bij het opslaan. Probeer het opnieuw.");
    }
  };

  const addGratitude = () => {
    if (gratitudeInput) {
      setGratitude([...gratitude, gratitudeInput]);
      setGratitudeInput('');
    }
  };

  const removeGratitude = (idx) => {
    setGratitude(gratitude.filter((_, i) => i !== idx));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Dagelijkse Reflectie - ${new Date(date).toLocaleDateString()}`} closeOnBackdropClick={false}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Waar ben je vandaag dankbaar voor? (3 dingen)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={gratitudeInput}
              onChange={(e) => setGratitudeInput(e.target.value)}
              className="input-field flex-1"
              placeholder="Voeg iets toe waar je dankbaar voor bent..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGratitude())}
            />
            <button type="button" onClick={addGratitude} className="btn-secondary">
              <Plus size={18} />
            </button>
          </div>
          {gratitude.length > 0 && (
            <div className="space-y-2">
              {gratitude.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <span className="flex-1 text-sm">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeGratitude(idx)}
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
            Wat waren de hoogtepunten van vandaag?
          </label>
          <textarea
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
            rows={3}
            className="input-field"
            placeholder="Beschrijf de beste momenten van je dag..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Wat waren de uitdagingen?
          </label>
          <textarea
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            rows={3}
            className="input-field"
            placeholder="Welke moeilijkheden kwam je tegen?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Wat heb je vandaag geleerd?
          </label>
          <textarea
            value={learnings}
            onChange={(e) => setLearnings(e.target.value)}
            rows={3}
            className="input-field"
            placeholder="Nieuwe inzichten of lessen..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Waar ga je je morgen op focussen?
          </label>
          <textarea
            value={tomorrow}
            onChange={(e) => setTomorrow(e.target.value)}
            rows={2}
            className="input-field"
            placeholder="Je belangrijkste prioriteit voor morgen..."
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Annuleren
          </button>
          <button type="submit" className="btn-primary">
            {existing ? 'Bijwerken' : 'Opslaan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
