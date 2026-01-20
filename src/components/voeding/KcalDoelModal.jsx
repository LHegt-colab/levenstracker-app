import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../contexts/AppContext';
import { Target } from 'lucide-react';

export default function KcalDoelModal({ isOpen, onClose }) {
  const { data, setKcalTarget } = useApp();
  const [targetKcal, setTargetKcalState] = useState(2000);

  useEffect(() => {
    if (isOpen) {
      setTargetKcalState(data.voeding.targetKcal);
    }
  }, [isOpen, data.voeding.targetKcal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setKcalTarget(parseInt(targetKcal));
    onClose();
  };

  const presetValues = [
    { label: 'Gewichtsverlies (vrouw)', value: 1500 },
    { label: 'Gewichtsverlies (man)', value: 1800 },
    { label: 'Onderhoud (vrouw)', value: 2000 },
    { label: 'Onderhoud (man)', value: 2500 },
    { label: 'Spieropbouw (vrouw)', value: 2300 },
    { label: 'Spieropbouw (man)', value: 3000 },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dagelijks Kcal Doel Instellen">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-info bg-opacity-10 border border-info rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Target className="text-info flex-shrink-0 mt-1" size={20} />
            <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">
              <p className="mb-2">
                Stel je dagelijkse calorie streefhoeveelheid in. Dit helpt je om je voeding bij te houden.
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Tip: Gebruik een BMR calculator online om je persoonlijke caloriebehoefte te berekenen op basis van leeftijd, gewicht, lengte en activiteitsniveau.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Streefhoeveelheid Kcal per Dag *</label>
          <input
            type="number"
            min="800"
            max="5000"
            step="50"
            value={targetKcal}
            onChange={(e) => setTargetKcalState(e.target.value)}
            required
            className="input-field text-2xl font-bold text-center"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Snelle Selectie:</label>
          <div className="grid grid-cols-2 gap-2">
            {presetValues.map(preset => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setTargetKcalState(preset.value)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  parseInt(targetKcal) === preset.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <div className="font-medium">{preset.label}</div>
                <div className="text-xs opacity-80">{preset.value} kcal</div>
              </button>
            ))}
          </div>
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
