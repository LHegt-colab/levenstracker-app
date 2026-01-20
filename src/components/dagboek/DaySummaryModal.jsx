import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../contexts/AppContextSupabase';
import { Combine, Sparkles } from 'lucide-react';

export default function DaySummaryModal({ isOpen, onClose, date, entries, existingSummary }) {
  const { setDaySummary } = useApp();
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (existingSummary) {
        setSummary(existingSummary);
      } else {
        // Auto-genereer een samenvatting van alle entries
        generateSummary();
      }
    }
  }, [isOpen, existingSummary, entries]);

  const generateSummary = () => {
    if (!entries || entries.length === 0) return;

    let combined = '';

    // Verzamel alle content
    const allContent = entries.map(entry => entry.content).filter(Boolean);
    if (allContent.length > 0) {
      combined += '=== Dagelijkse Notities ===\n\n';
      combined += allContent.join('\n\n---\n\n');
      combined += '\n\n';
    }

    // Verzamel mood/energie data
    const moods = entries.map(e => e.mood).filter(Boolean);
    const energies = entries.map(e => e.energy).filter(Boolean);
    const stresses = entries.map(e => e.stress).filter(Boolean);
    const sleeps = entries.map(e => e.sleep).filter(Boolean);

    if (moods.length > 0 || energies.length > 0 || stresses.length > 0 || sleeps.length > 0) {
      combined += '=== Welzijn Overzicht ===\n\n';

      if (moods.length > 0) {
        const avgMood = Math.round(moods.reduce((a, b) => a + b, 0) / moods.length);
        combined += `Gemiddelde Stemming: ${avgMood}/10\n`;
      }
      if (energies.length > 0) {
        const avgEnergy = Math.round(energies.reduce((a, b) => a + b, 0) / energies.length);
        combined += `Gemiddelde Energie: ${avgEnergy}/10\n`;
      }
      if (stresses.length > 0) {
        const avgStress = Math.round(stresses.reduce((a, b) => a + b, 0) / stresses.length);
        combined += `Gemiddelde Spanning: ${avgStress}/10\n`;
      }
      if (sleeps.length > 0) {
        const avgSleep = Math.round(sleeps.reduce((a, b) => a + b, 0) / sleeps.length);
        combined += `Gemiddelde Slaapkwaliteit: ${avgSleep}/10\n`;
      }
      combined += '\n';
    }

    // Verzamel sport activiteiten
    const sportActivities = entries
      .filter(e => e.sport?.done)
      .map(e => e.sport.activity)
      .filter(Boolean);

    if (sportActivities.length > 0) {
      combined += '=== Sport & Activiteit ===\n\n';
      combined += sportActivities.join(', ') + '\n\n';
    }

    // Verzamel alle tags
    const allTags = [...new Set(entries.flatMap(e => e.tags || []))];
    if (allTags.length > 0) {
      combined += '=== Tags ===\n\n';
      combined += allTags.join(', ') + '\n\n';
    }

    setSummary(combined.trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDaySummary(date, summary);
    onClose();
  };

  const handleRegenerate = () => {
    generateSummary();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dag Overzicht"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-info bg-opacity-10 border border-info rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <Combine className="text-info flex-shrink-0 mt-1" size={20} />
            <div className="flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Dit overzicht combineert {entries.length} entries van deze dag tot één samenvatting.
                Je kunt de tekst hieronder aanpassen naar wens.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Dag Samenvatting</label>
            <button
              type="button"
              onClick={handleRegenerate}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <Sparkles size={14} />
              Opnieuw Genereren
            </button>
          </div>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={16}
            className="input-field font-mono text-sm"
            placeholder="De samenvatting van je dag..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {summary.length} karakters
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Annuleren
          </button>
          <button type="submit" className="btn-primary">
            Opslaan
          </button>
        </div>
      </form>
    </Modal>
  );
}
