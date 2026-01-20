import { Home, BookOpen, Bookmark, Lightbulb, Calendar, CheckSquare, Target, Eye, FileText, Utensils, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/dagboek', icon: BookOpen, label: 'Dagboek' },
  { path: '/verzameling', icon: Bookmark, label: 'Verzameling' },
  { path: '/ideeen', icon: Lightbulb, label: 'Ideeën' },
  { path: '/kalender', icon: Calendar, label: 'Kalender' },
  { path: '/gewoontes', icon: CheckSquare, label: 'Gewoontes' },
  { path: '/doelen', icon: Target, label: 'Doelen' },
  { path: '/reflectie', icon: Eye, label: 'Reflectie' },
  { path: '/overzichten', icon: FileText, label: 'Overzichten' },
  { path: '/voeding', icon: Utensils, label: 'Voeding' },
  { path: '/instellingen', icon: Settings, label: 'Instellingen' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Levenstracker</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
