import { useState } from 'react';
import { useApp } from '../../contexts/AppContextSupabase';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import IdeeenModal from './IdeeenModal';

const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog', color: '#6B7280' },
  { value: 'in-progress', label: 'In Progress', color: '#F59E0B' },
  { value: 'completed', label: 'Voltooid', color: '#10B981' },
  { value: 'archived', label: 'Gearchiveerd', color: '#EF4444' },
];

export default function Ideeen() {
  const { data, deleteIdee } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editItem, setEditItem] = useState(null);

  const handleEdit = (item) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Weet je zeker dat je dit idee wilt verwijderen?')) {
      deleteIdee(id);
    }
  };

  const getCategoryById = (id) => {
    return data.ideeen.categories.find(cat => cat.id === id);
  };

  const filteredItems = selectedCategory === 'all'
    ? data.ideeen.ideas
    : data.ideeen.ideas.filter(item => item.categoryId === selectedCategory);

  const groupedByStatus = STATUS_OPTIONS.map(status => ({
    ...status,
    ideas: filteredItems.filter(item => item.status === status.value),
  }));

  return (
    <div className="space-y-6">
      <div className="flex ideas-center justify-between">
        <h1 className="text-3xl font-bold">Creatieve Ideeën</h1>
        <button
          onClick={() => {
            setEditItem(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex ideas-center gap-2"
        >
          <Plus size={20} />
          Nieuw Idee
        </button>
      </div>

      {/* Category Filter */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${selectedCategory === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            Alle Ideeën ({data.ideeen.ideas.length})
          </button>
          {data.ideeen.categories.map(cat => {
            const count = data.ideeen.ideas.filter(item => item.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${selectedCategory === cat.id
                  ? 'text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Kanban Board */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {groupedByStatus.map(statusGroup => (
            <div key={statusGroup.value} className="space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: statusGroup.color }}
                ></div>
                <h3 className="font-semibold text-lg">
                  {statusGroup.label} ({statusGroup.items.length})
                </h3>
              </div>

              <div className="space-y-2">
                {statusGroup.items.map(item => {
                  const category = getCategoryById(item.categoryId);
                  return (
                    <div
                      key={item.id}
                      className="card bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className="px-2 py-1 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: category?.color }}
                        >
                          {category?.name}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 hover:bg-danger hover:bg-opacity-10 rounded transition-colors"
                          >
                            <Trash2 size={14} className="text-danger" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-semibold mb-1">{item.title}</h4>

                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-3">
                          {item.description}
                        </p>
                      )}

                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString('nl-NL')}
                      </div>
                    </div>
                  );
                })}

                {statusGroup.items.length === 0 && (
                  <div className="card bg-gray-50 dark:bg-gray-800 text-center py-8 text-sm text-gray-500">
                    Geen ideeën
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Je hebt nog geen ideeën toegevoegd
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus size={20} className="inline mr-2" />
            Voeg je eerste idee toe
          </button>
        </div>
      )}

      <IdeeenModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditItem(null);
        }}
        item={editItem}
      />
    </div>
  );
}
