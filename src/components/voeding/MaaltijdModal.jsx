import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../contexts/AppContextSupabase';

const MEAL_TYPES = ['Ontbijt', 'Lunch', 'Diner', 'Snack', 'Drinken'];
const UNITS = ['gram', 'ml', 'stuks', 'portie', 'eetlepel', 'theelepel', 'kopje'];

export default function MaaltijdModal({ isOpen, onClose, date, meal }) {
  const { addMeal, updateMeal } = useApp();

  const [type, setType] = useState('Lunch');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('gram');
  const [kcal, setKcal] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (meal) {
      setType(meal.type || 'Lunch');
      setName(meal.name || '');
      setAmount(meal.amount || '');
      setUnit(meal.unit || 'gram');
      setKcal(meal.kcal || '');
      setNotes(meal.notes || '');
    } else {
      setType('Lunch');
      setName('');
      setAmount('');
      setUnit('gram');
      setKcal('');
      setNotes('');
    }
  }, [meal, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const mealData = {
      type,
      name,
      amount: parseFloat(amount),
      unit,
      calories: parseInt(kcal), // Schema expects 'calories', not 'kcal'
      notes,
    };

    if (meal) {
      updateMeal(date, meal.id, mealData);
    } else {
      addMeal(date, mealData);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={meal ? 'Maaltijd Bewerken' : 'Nieuwe Maaltijd'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type Maaltijd *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            className="input-field"
          >
            {MEAL_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Naam/Gerecht *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input-field"
            placeholder="Bijv. Havermout met banaan"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hoeveelheid *</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="input-field"
              placeholder="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Eenheid *</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
              className="input-field"
            >
              {UNITS.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Calorieën (kcal) *</label>
          <input
            type="number"
            value={kcal}
            onChange={(e) => setKcal(e.target.value)}
            required
            className="input-field"
            placeholder="350"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tip: Zoek voedingswaarden op via apps zoals MyFitnessPal of CalorieChecker
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notities (optioneel)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="input-field"
            placeholder="Extra opmerkingen over deze maaltijd..."
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Annuleren
          </button>
          <button type="submit" className="btn-primary">
            {meal ? 'Bijwerken' : 'Opslaan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
