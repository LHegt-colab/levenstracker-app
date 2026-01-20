import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../contexts/AppContext';
import { Smile, Zap, Frown, Moon, X } from 'lucide-react';

const AVAILABLE_TAGS = ['Werk', 'Privé', 'Gezondheid', 'Hobby', 'Familie', 'Sociaal'];
const SPORT_SUGGESTIONS = ['Hardlopen', 'Fietsen', 'Fitness', 'Wandelen', 'Zwemmen', 'Anders'];

export default function EntryModal({ isOpen, onClose, date, entry }) {
  const { addDagboekEntry, updateDagboekEntry } = useApp();

  const [content, setContent] = useState('');
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [stress, setStress] = useState(null);
  const [sleep, setSleep] = useState(null);
  const [sportDone, setSportDone] = useState(false);
  const [sportActivity, setSportActivity] = useState('');
  const [tags, setTags] = useState([]);
  const [customTag, setCustomTag] = useState('');

  useEffect(() => {
    if (entry) {
      setContent(entry.content || '');
      setMood(entry.mood || null);
      setEnergy(entry.energy || null);
      setStress(entry.stress || null);
      setSleep(entry.sleep || null);
      setSportDone(entry.sport?.done || false);
      setSportActivity(entry.sport?.activity || '');
      setTags(entry.tags || []);
    } else {
      // Reset voor nieuwe entry
      setContent('');
      setMood(null);
      setEnergy(null);
      setStress(null);
      setSleep(null);
      setSportDone(false);
      setSportActivity('');
      setTags([]);
    }
  }, [entry, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const entryData = {
      content,
      mood,
      energy,
      stress,
      sleep,
      sport: { done: sportDone, activity: sportActivity },
      tags,
    };

    if (entry) {
      updateDagboekEntry(date, entry.id, entryData);
    } else {
      addDagboekEntry(date, entryData);
    }

    onClose();
  };

  const toggleTag = (tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag && !tags.includes(customTag)) {
      setTags((prev) => [...prev, customTag]);
      setCustomTag('');
    }
  };

  const getSliderColor = (value) => {
    if (!value) return '#D1D5DB';
    if (value <= 3) return '#EF4444';
    if (value <= 7) return '#F59E0B';
    return '#10B981';
  };

  const SliderInput = ({ label, value, setValue, icon: Icon }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Icon size={16} />
          {label}
        </label>
        <span className="text-sm font-bold">{value || '-'}/10</span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        value={value || 0}
        onChange={(e) => setValue(Number(e.target.value) || null)}
        className="w-full"
        style={{
          accentColor: getSliderColor(value),
        }}
      />
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={entry ? 'Entry Bewerken' : 'Nieuwe Entry'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Text Editor */}
        <div>
          <label className="block text-sm font-medium mb-2">Beschrijving</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-field min-h-40 font-sans"
            placeholder="Schrijf hier je dagboek entry..."
            rows={8}
          />
        </div>

        {/* Welzijns Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SliderInput label="Stemming" value={mood} setValue={setMood} icon={Smile} />
          <SliderInput label="Energie niveau" value={energy} setValue={setEnergy} icon={Zap} />
          <SliderInput label="Spanningsscore" value={stress} setValue={setStress} icon={Frown} />
          <SliderInput label="Slaapkwaliteit" value={sleep} setValue={setSleep} icon={Moon} />
        </div>

        {/* Sport */}
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={sportDone}
              onChange={(e) => setSportDone(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="font-medium">Gesport vandaag?</span>
          </label>

          {sportDone && (
            <div>
              <select
                value={sportActivity}
                onChange={(e) => setSportActivity(e.target.value)}
                className="input-field mb-2"
              >
                <option value="">Selecteer activiteit</option>
                {SPORT_SUGGESTIONS.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>

              {sportActivity === 'Anders' && (
                <input
                  type="text"
                  placeholder="Beschrijf je activiteit"
                  className="input-field"
                  onChange={(e) => setSportActivity(e.target.value)}
                />
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                  tags.includes(tag)
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="Custom tag toevoegen"
              className="input-field flex-1"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
            />
            <button type="button" onClick={addCustomTag} className="btn-secondary">
              Toevoegen
            </button>
          </div>

          {tags.filter((t) => !AVAILABLE_TAGS.includes(t)).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags
                .filter((t) => !AVAILABLE_TAGS.includes(t))
                .map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-info text-white rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button type="button" onClick={() => toggleTag(tag)}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">
            Annuleren
          </button>
          <button type="submit" className="btn-primary">
            {entry ? 'Bijwerken' : 'Opslaan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
