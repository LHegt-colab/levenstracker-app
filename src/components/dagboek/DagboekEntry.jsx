import { formatTime } from '../../utils/dateHelpers';
import { Edit2, Trash2, Smile, Zap, Frown, Moon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const moodIcons = {
  mood: { icon: Smile, label: 'Stemming', color: '#3B82F6' },
  energy: { icon: Zap, label: 'Energie', color: '#F59E0B' },
  stress: { icon: Frown, label: 'Spanning', color: '#EF4444' },
  sleep: { icon: Moon, label: 'Slaap', color: '#8B5CF6' },
};

export default function DagboekEntry({ entry, date, onEdit }) {
  const { deleteDagboekEntry } = useApp();

  const handleDelete = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Weet je zeker dat je deze entry wilt verwijderen?')) {
      deleteDagboekEntry(date, entry.id);
    }
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatTime(entry.timestamp)}
          </p>
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex gap-2 mt-2">
              {entry.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-primary bg-opacity-10 text-primary rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(entry)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 text-danger"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
        {entry.content}
      </div>

      {/* Sliders */}
      {(entry.mood || entry.energy || entry.stress || entry.sleep) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {Object.entries(moodIcons).map(([key, { icon: Icon, label, color }]) => {
            const value = entry[key];
            if (!value) return null;

            return (
              <div key={key} className="flex items-center gap-2">
                <Icon size={20} style={{ color }} />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
                  <p className="text-lg font-bold">{value}/10</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sport */}
      {entry.sport?.done && (
        <div className="p-3 bg-success bg-opacity-10 text-success rounded-lg">
          <p className="font-semibold">Gesport vandaag</p>
          {entry.sport.activity && <p className="text-sm">{entry.sport.activity}</p>}
        </div>
      )}
    </div>
  );
}
