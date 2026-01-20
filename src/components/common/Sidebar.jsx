import { Home, BookOpen, Bookmark, Lightbulb, Calendar, CheckSquare, Target, Eye, FileText, Utensils, Settings, X, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { APP_VERSION } from '../../version';

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

export default function Sidebar({ isOpen, onClose, session }) {
  const location = useLocation();

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
    transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div className="flex items-center justify-between p-6">
          <h1 className="text-2xl font-bold text-primary">Levenstracker</h1>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
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

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {session ? (
            <div className="text-xs text-center text-green-600 font-medium">
              ● Ingelogd: {session.user.email}
            </div>
          ) : (
            <div className="text-xs text-center text-red-500 font-bold">
              ● NIET Ingelogd (Opslaan werkt niet)
            </div>
          )}
          <p className="text-xs text-gray-400 text-center">{APP_VERSION}</p>
        </div>
      </aside>
    </>
  );
}
