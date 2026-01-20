import { useState } from 'react';
import { useApp } from '../../contexts/AppContextSupabase';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getDateString, formatDate } from '../../utils/dateHelpers';
import { Plus, Edit2, Trash2, Combine } from 'lucide-react';
import DagboekEntry from './DagboekEntry';
import EntryModal from './EntryModal';
import DaySummaryModal from './DaySummaryModal';

export default function Dagboek() {
  const { data } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const dateString = getDateString(selectedDate);
  const dayData = data.dagboek[dateString] || { entries: [], daySummary: null };

  // Functie om te checken of een datum entries heeft
  const tileClassName = ({ date }) => {
    const dateStr = getDateString(date);
    const hasEntries = data.dagboek[dateStr]?.entries?.length > 0;
    return hasEntries ? 'has-entries' : '';
  };

  const handleAddEntry = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dagboek</h1>
        <button onClick={handleAddEntry} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Nieuwe Entry
        </button>
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

        {/* Entries voor geselecteerde dag */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{formatDate(selectedDate, 'EEEE, d MMMM yyyy')}</h2>
            {dayData.entries.length > 1 && (
              <button
                onClick={() => setIsSummaryModalOpen(true)}
                className="btn-secondary flex items-center gap-2"
                title="Samenvoegen tot dag overzicht"
              >
                <Combine size={18} />
                Samenvoegen
              </button>
            )}
          </div>

          {/* Day Summary (als die bestaat) */}
          {dayData.daySummary && (
            <div className="card bg-primary bg-opacity-5 border-2 border-primary">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <Combine size={20} />
                  Dag Overzicht
                </h3>
                <button
                  onClick={() => setIsSummaryModalOpen(true)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Bewerken"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {dayData.daySummary}
              </p>
              <div className="mt-3 pt-3 border-t border-primary border-opacity-30 text-xs text-gray-500">
                Samengevoegd overzicht van {dayData.entries.length} entries
              </div>
            </div>
          )}

          {dayData.entries.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Nog geen entries voor deze dag</p>
              <button onClick={handleAddEntry} className="btn-primary">
                <Plus size={20} className="inline mr-2" />
                Eerste Entry Toevoegen
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {dayData.entries.map((entry) => (
                <DagboekEntry
                  key={entry.id}
                  entry={entry}
                  date={dateString}
                  onEdit={handleEditEntry}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal voor nieuwe/edit entry */}
      <EntryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        date={dateString}
        entry={editingEntry}
      />

      {/* Modal voor dag samenvatting */}
      <DaySummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        date={dateString}
        entries={dayData.entries}
        existingSummary={dayData.daySummary}
      />
    </div>
  );
}
