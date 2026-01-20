import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, Trash2, ExternalLink, Search } from 'lucide-react';
import VerzamelingModal from './VerzamelingModal';

export default function Verzameling() {
  const { data, deleteVerzamelingItem } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editItem, setEditItem] = useState(null);

  const filteredItems = data.verzameling.items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleEdit = (item) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Weet je zeker dat je dit item wilt verwijderen?')) {
      deleteVerzamelingItem(id);
    }
  };

  const getCategoryById = (id) => {
    return data.verzameling.categories.find(cat => cat.id === id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nuttige Zaken Verzameling</h1>
        <button
          onClick={() => {
            setEditItem(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nieuw Item
        </button>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Zoek in verzameling..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field flex-1"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Alle ({data.verzameling.items.length})
          </button>
          {data.verzameling.categories.map(cat => {
            const count = data.verzameling.items.filter(item => item.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === cat.id
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

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const category = getCategoryById(item.categoryId);
            return (
              <div key={item.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: category?.color }}
                  >
                    {category?.name}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 hover:bg-danger hover:bg-opacity-10 rounded transition-colors"
                    >
                      <Trash2 size={16} className="text-danger" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>

                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm flex items-center gap-1 mb-3"
                  >
                    <ExternalLink size={14} />
                    Link openen
                  </a>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                  Toegevoegd op {new Date(item.createdAt).toLocaleDateString('nl-NL')}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || selectedCategory !== 'all'
              ? 'Geen items gevonden met deze filters'
              : 'Je hebt nog geen items toegevoegd aan je verzameling'}
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus size={20} className="inline mr-2" />
            Voeg je eerste item toe
          </button>
        </div>
      )}

      <VerzamelingModal
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
