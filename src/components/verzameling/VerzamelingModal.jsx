import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../contexts/AppContextSupabase';
import { X } from 'lucide-react';

export default function VerzamelingModal({ isOpen, onClose, item }) {
  const { data, addVerzamelingItem, updateVerzamelingItem } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setDescription(item.description || '');
      setUrl(item.url || '');
      setCategoryId(item.categoryId || '');
      setTags(item.tags || []);
    } else {
      setTitle('');
      setDescription('');
      setUrl('');
      setCategoryId(data.verzameling.categories[0]?.id || '');
      setTags([]);
    }
  }, [item, isOpen, data.verzameling.categories]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const itemData = {
      title,
      description,
      url,
      categoryId,
      tags,
    };

    if (item) {
      updateVerzamelingItem(item.id, itemData);
    } else {
      addVerzamelingItem(itemData);
    }

    onClose();
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Item Bewerken' : 'Nieuw Item'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Titel *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input-field"
            placeholder="Bijv. Nuttige Tutorial Website"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input-field"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Categorie *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="input-field"
          >
            {data.verzameling.categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Beschrijving</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input-field"
            placeholder="Optionele beschrijving..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="input-field flex-1"
              placeholder="Voeg tag toe..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <button type="button" onClick={addTag} className="btn-secondary">
              Toevoegen
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-primary text-white rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">
            Annuleren
          </button>
          <button type="submit" className="btn-primary">
            {item ? 'Bijwerken' : 'Opslaan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
