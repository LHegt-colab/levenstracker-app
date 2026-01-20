import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import Calendar from 'react-calendar';
import { Plus, Repeat, Edit2, Trash2 } from 'lucide-react';
import EventModal from './EventModal';
import { getDateString, formatDate } from '../../utils/dateHelpers';

export default function Kalender() {
  const { data, deleteEvent } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const dateString = getDateString(selectedDate);

  // Functie om te checken of een terugkerend event op deze datum valt
  const eventOccursOnDate = (event, checkDate) => {
    const eventDate = new Date(event.date);
    const targetDate = new Date(checkDate);

    // Directe match
    if (event.date === checkDate) return true;

    // Geen recurrence
    if (!event.recurrence || event.recurrence.type === 'none') return false;

    // Check of target date na de start date is
    if (targetDate < eventDate) return false;

    // Check of target date voor de end date is (als aanwezig)
    if (event.recurrence.endDate) {
      const endDate = new Date(event.recurrence.endDate);
      if (targetDate > endDate) return false;
    }

    const interval = event.recurrence.interval || 1;
    const diffTime = Math.abs(targetDate - eventDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    switch (event.recurrence.type) {
      case 'daily':
        return diffDays % interval === 0;

      case 'weekly':
        const diffWeeks = Math.floor(diffDays / 7);
        return diffWeeks % interval === 0 && targetDate.getDay() === eventDate.getDay();

      case 'monthly':
        const monthsDiff = (targetDate.getFullYear() - eventDate.getFullYear()) * 12 +
                          (targetDate.getMonth() - eventDate.getMonth());
        return monthsDiff % interval === 0 && targetDate.getDate() === eventDate.getDate();

      case 'yearly':
        const yearsDiff = targetDate.getFullYear() - eventDate.getFullYear();
        return yearsDiff % interval === 0 &&
               targetDate.getMonth() === eventDate.getMonth() &&
               targetDate.getDate() === eventDate.getDate();

      default:
        return false;
    }
  };

  // Filter events voor de geselecteerde datum (inclusief terugkerende events)
  const dayEvents = data.kalender.events.filter(event => eventOccursOnDate(event, dateString));

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleNewEvent = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (eventId) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Weet je zeker dat je dit event wilt verwijderen?')) {
      deleteEvent(eventId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kalender & Agenda</h1>
        <button onClick={handleNewEvent} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Nieuw Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            locale="nl-NL"
            className="w-full"
          />
        </div>

        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-bold mb-4">Events op {formatDate(selectedDate, 'd MMMM yyyy')}</h2>

          {dayEvents.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">Geen events voor deze dag</p>
          ) : (
            <div className="space-y-3">
              {dayEvents.map(event => {
                const isRecurring = event.recurrence && event.recurrence.type !== 'none';
                const recurrenceLabel = {
                  daily: 'Dagelijks',
                  weekly: 'Wekelijks',
                  monthly: 'Maandelijks',
                  yearly: 'Jaarlijks'
                }[event.recurrence?.type];

                return (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-1 h-12 rounded" style={{ backgroundColor: event.color }}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{event.title}</p>
                        {isRecurring && (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                            <Repeat size={12} />
                            {recurrenceLabel}
                          </span>
                        )}
                      </div>
                      {event.startTime && <p className="text-sm text-gray-600 dark:text-gray-400">{event.startTime}</p>}
                      {event.location && <p className="text-sm text-gray-600 dark:text-gray-400">{event.location}</p>}
                      {event.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                        title="Bewerken"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 text-danger"
                        title="Verwijderen"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialDate={dateString}
        event={editingEvent}
      />
    </div>
  );
}
