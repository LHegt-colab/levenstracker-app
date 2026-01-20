import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../contexts/AppContextSupabase';
import { X, Plus } from 'lucide-react';

export default function DoelenModal({ isOpen, onClose, item }) {
  const { addDoel, updateDoel } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [completed, setCompleted] = useState(false);
  const [milestones, setMilestones] = useState([]);
  const [milestoneInput, setMilestoneInput] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setDescription(item.description || '');
      setDeadline(item.deadline || '');
      setCompleted(item.completed || false);
      setMilestones(item.milestones || []);
    } else {
      setTitle('');
      setDescription('');
      setDeadline('');
      setCompleted(false);
      setMilestones([]);
    }
  }, [item, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const doelData = {
      title,
      description,
      deadline: deadline || null,
      completed,
      milestones,
    };

    if (item) {
      updateDoel(item.id, doelData);
    } else {
      addDoel(doelData);
    }

    onClose();
  };

  const addMilestone = () => {
    if (milestoneInput) {
      setMilestones([...milestones, { title: milestoneInput, completed: false }]);
      setMilestoneInput('');
    }
  };

  const removeMilestone = (idx) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const toggleMilestone = (idx) => {
    setMilestones(
      milestones.map((m, i) => (i === idx ? { ...m, completed: !m.completed } : m))
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Doel Bewerken' : 'Nieuw Doel'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Titel *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input-field"
            placeholder="Bijv. Een boek schrijven"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Beschrijving</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input-field"
            placeholder="Beschrijf je doel in detail..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="font-medium">Doel voltooid</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mijlpalen</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={milestoneInput}
              onChange={(e) => setMilestoneInput(e.target.value)}
              className="input-field flex-1"
              placeholder="Voeg mijlpaal toe..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
            />
            <button type="button" onClick={addMilestone} className="btn-secondary">
              <Plus size={18} />
            </button>
          </div>

          {milestones.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
              {milestones.map((milestone, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={milestone.completed}
                    onChange={() => toggleMilestone(idx)}
                    className="w-4 h-4"
                  />
                  <span className={`flex-1 text-sm ${milestone.completed ? 'line-through text-gray-500' : ''}`}>
                    {milestone.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMilestone(idx)}
                    className="p-1 hover:bg-danger hover:bg-opacity-10 rounded transition-colors"
                  >
                    <X size={16} className="text-danger" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4">
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
