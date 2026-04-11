'use client'

import { useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../_contexts';
import { 
  Logout as LogoutIcon, 
  Dashboard as DashboardIcon, 
  People as PeopleIcon,
} from '@mui/icons-material';

export const Sidebar = () => {
  const { user, cleanToken } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = () => {
    cleanToken();
    router.push('/login');
  };

  return (
    <aside className="h-screen w-20 md:w-64 bg-[#0A0A0A] flex flex-col border-r border-gray-800 transition-all duration-300">
      <div className="p-4 flex justify-center items-center border-b border-gray-800 h-fit">
        <Image 
          src="/logo.png" 
          alt="Logo" 
          width={100} 
          height={100} 
          className="rounded-full"
        />
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
        {user && (
          <>
            <Link 
              href="/admin" 
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors text-white group"
            >
              <DashboardIcon className="text-gray-400 group-hover:text-primary transition-colors" />
              <span className="hidden md:block font-medium">Dashboard</span>
            </Link>
            <Link 
              href="/admin/usuarios" 
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors text-white group"
            >
              <PeopleIcon className="text-gray-400 group-hover:text-primary transition-colors" />
              <span className="hidden md:block font-medium">Usuários</span>
            </Link>
          </>
        )}
      </nav>

      {user && (
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-red-500/10 transition-colors text-red-500 group cursor-pointer"
          >
            <LogoutIcon />
            <span className="hidden md:block font-medium">Sair</span>
          </button>
        </div>
      )}
    </aside>
  );
};
