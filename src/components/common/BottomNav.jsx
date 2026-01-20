import { Home, BookOpen, Calendar, CheckSquare, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const mobileMenuItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/dagboek', icon: BookOpen, label: 'Dagboek' },
  { path: '/kalender', icon: Calendar, label: 'Kalender' },
  { path: '/gewoontes', icon: CheckSquare, label: 'Gewoontes' },
  { path: '/instellingen', icon: Settings, label: 'Menu' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-around items-center h-16">
        {mobileMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
