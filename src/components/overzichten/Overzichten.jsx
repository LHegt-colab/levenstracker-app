import { useState } from 'react';
import { FileText, BookOpen, Package, Lightbulb, Activity, Target, Sparkles, Utensils } from 'lucide-react';
import DagboekOverzicht from './DagboekOverzicht';
import VerzamelingOverzicht from './VerzamelingOverzicht';
import IdeenOverzicht from './IdeenOverzicht';
import GewoonteOverzicht from './GewoonteOverzicht';
import DoelenOverzicht from './DoelenOverzicht';
import ReflectieOverzicht from './ReflectieOverzicht';
import VoedingOverzicht from './VoedingOverzicht';

const OVERVIEW_TYPES = [
  { id: 'dagboek', label: 'Dagboek', icon: BookOpen, component: DagboekOverzicht },
  { id: 'verzameling', label: 'Verzameling', icon: Package, component: VerzamelingOverzicht },
  { id: 'ideeen', label: 'Ideeën', icon: Lightbulb, component: IdeenOverzicht },
  { id: 'gewoontes', label: 'Gewoontes', icon: Activity, component: GewoonteOverzicht },
  { id: 'doelen', label: 'Doelen', icon: Target, component: DoelenOverzicht },
  { id: 'reflectie', label: 'Reflectie', icon: Sparkles, component: ReflectieOverzicht },
  { id: 'voeding', label: 'Voeding', icon: Utensils, component: VoedingOverzicht },
];

export default function Overzichten() {
  const [selectedType, setSelectedType] = useState('dagboek');

  const currentType = OVERVIEW_TYPES.find(t => t.id === selectedType);
  const Component = currentType?.component;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText size={32} className="text-primary" />
        <h1 className="text-3xl font-bold">Periode Overzichten</h1>
      </div>

      <div className="card">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Genereer overzichten van je data voor een specifieke periode. Kies een module en selecteer
          een periode om een samengevat overzicht te krijgen dat je kunt lezen of kopiëren.
        </p>
      </div>

      {/* Module Selector */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Selecteer Module</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {OVERVIEW_TYPES.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  selectedType === type.id
                    ? 'border-primary bg-primary bg-opacity-10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={24} className={selectedType === type.id ? 'text-primary' : 'text-gray-600 dark:text-gray-400'} />
                <span className={`text-sm font-medium ${selectedType === type.id ? 'text-primary' : ''}`}>
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Module Overview Component */}
      {Component && <Component />}
    </div>
  );
}
