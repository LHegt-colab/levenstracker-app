import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../contexts/AppContextSupabase';

const CATEGORIES = ['Afspraak', 'Verjaardag', 'Deadline', 'Herinnering', 'Event', 'Overig'];
const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

export default function EventModal({ isOpen, onClose, initialDate, event }) {
  const { addEvent, updateEvent, deleteEvent } = useApp();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Afspraak');
  const [color, setColor] = useState(COLORS[0]);
  const [recurrenceType, setRecurrenceType] = useState('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

  // Set initial date when modal opens
  useEffect(() => {
    if (isOpen) {
      if (event) {
        // Bewerk modus - vul alle velden met event data
        setTitle(event.title || '');
        setDate(event.date || '');
        setStartTime(event.startTime || '');
        setEndTime(event.endTime || '');
        setDescription(event.description || '');
        setLocation(event.location || '');
        setCategory(event.category || 'Afspraak');
        setColor(event.color || COLORS[0]);
        setRecurrenceType(event.recurrence?.type || 'none');
        setRecurrenceInterval(event.recurrence?.interval || 1);
        setRecurrenceEndDate(event.recurrence?.endDate || '');
      } else if (initialDate) {
        // Nieuwe event modus - alleen datum
        setDate(initialDate);
      }
    }
  }, [isOpen, initialDate, event]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const eventData = {
      title,
      date,
      startTime: startTime || null,
      endTime: endTime || null,
      description,
      location,
      category,
      color,
      recurrence: {
        type: recurrenceType,
        interval: recurrenceType !== 'none' ? recurrenceInterval : null,
        endDate: recurrenceType !== 'none' ? recurrenceEndDate : null,
      },
    };

    if (event) {
      // Update bestaand event
      updateEvent(event.id, eventData);
    } else {
      // Nieuw event toevoegen
      addEvent(eventData);
    }

    // Reset
    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setLocation('');
    setCategory('Afspraak');
    setColor(COLORS[0]);
    setRecurrenceType('none');
    setRecurrenceInterval(1);
    setRecurrenceEndDate('');

    onClose();
  };

  const handleDelete = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Weet je zeker dat je dit event wilt verwijderen?')) {
      deleteEvent(event.id);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event ? 'Event Bewerken' : 'Nieuw Event'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Titel *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Datum *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start tijd</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Eind tijd</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Locatie</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Categorie</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Kleur</label>
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-10 h-10 rounded-full border-2 ${color === c ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Beschrijving</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input-field"
          />
        </div>

        {/* Terugkerend Event */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium mb-2">Herhaling</label>
          <select
            value={recurrenceType}
            onChange={(e) => setRecurrenceType(e.target.value)}
            className="input-field"
          >
            <option value="none">Niet herhalen</option>
            <option value="daily">Dagelijks</option>
            <option value="weekly">Wekelijks</option>
            <option value="monthly">Maandelijks</option>
            <option value="yearly">Jaarlijks</option>
          </select>

          {recurrenceType !== 'none' && (
            <div className="mt-4 space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Elke {recurrenceType === 'daily' ? 'dag(en)' : recurrenceType === 'weekly' ? 'we(e)k(en)' : recurrenceType === 'monthly' ? 'maan(d)(en)' : 'ja(a)r(en)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Einddatum (optioneel)</label>
                <input
                  type="date"
                  value={recurrenceEndDate}
                  onChange={(e) => setRecurrenceEndDate(e.target.value)}
                  min={date}
                  className="input-field"
                  placeholder="Herhaal voor onbepaalde tijd"
                />
                <p className="text-xs text-gray-500 mt-1">Laat leeg om voor onbepaalde tijd te herhalen</p>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {recurrenceType === 'daily' && `Herhaalt elke ${recurrenceInterval} dag${recurrenceInterval > 1 ? 'en' : ''}`}
                  {recurrenceType === 'weekly' && `Herhaalt elke ${recurrenceInterval} we${recurrenceInterval > 1 ? 'ken' : 'ek'}`}
                  {recurrenceType === 'monthly' && `Herhaalt elke ${recurrenceInterval} maan${recurrenceInterval > 1 ? 'den' : 'd'}`}
                  {recurrenceType === 'yearly' && `Herhaalt elke ${recurrenceInterval} ja${recurrenceInterval > 1 ? 'ren' : 'ar'}`}
                  {recurrenceEndDate && ` tot ${new Date(recurrenceEndDate).toLocaleDateString('nl-NL')}`}
                  {!recurrenceEndDate && ' voor onbepaalde tijd'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-between">
          {event ? (
            <button type="button" onClick={handleDelete} className="btn-secondary bg-danger text-white hover:bg-red-600">
              Verwijderen
            </button>
          ) : (
            <div></div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annuleren
            </button>
            <button type="submit" className="btn-primary">
              {event ? 'Bijwerken' : 'Opslaan'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
