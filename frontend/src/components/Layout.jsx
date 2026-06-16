import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        &copy; 2026 FloraDesigner. All rights reserved.
      </footer>
    </div>
  );
}
