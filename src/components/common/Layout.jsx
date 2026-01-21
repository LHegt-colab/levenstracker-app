import { APP_VERSION } from '../../version';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '../../contexts/AppContextSupabase';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Header from './Header';


export default function Layout() {
  const { session } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        session={session}
      />

      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
