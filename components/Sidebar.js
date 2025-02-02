
'use client';

import { useState, useEffect } from 'react';
import { 
  HomeIcon, 
  UsersIcon, 
  ChartBarIcon, 
  CogIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  DocumentAddIcon, 
  TableIcon
} from '@heroicons/react/outline';

import Link from 'next/link';

export default function Sidebar({ isAdmin = false }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
        setIsOpen(false);
      } else {
        setIsMobile(false);
        setIsOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative min-h-screen">
      <div className={`bg-gray-800 text-white flex flex-col h-full ${isOpen ? 'w-64' : 'w-16'} transition-all duration-300`}>
        <div className="flex flex-col items-center justify-center p-4 bg-gray-900">
          <img
            src="/numi.png"
            alt="Logo"
            className="h-16 w-16 mb-2"
          />
          {isOpen && <span className="text-lg font-semibold">DashBoard Data Aset</span>}
        </div>

        <div className="flex-1 p-6">
          <ul className="space-y-4">
          <li>
            <Link 
              href={isAdmin ? "/admin" : "/"} 
              className="flex items-center space-x-4 hover:bg-gray-700 p-2 rounded-lg transition-colors"
            >
              <HomeIcon className="h-6 w-6 text-gray-300" />
              {isOpen && <span>Statistik</span>}
            </Link>

            </li>

            {/* Menu Tabel dengan Link untuk routing */}
            <li>
            <Link 
              href={isAdmin ? "/admin/table" : "/viewer/table"} 
              className="flex items-center space-x-4 hover:bg-gray-700 p-2 rounded-lg transition-colors"
            >
              <TableIcon className="h-6 w-6 text-gray-300" />
              {isOpen && <span>Tabel</span>}
            </Link>

            </li>
           
            {/* Tambahkan menu khusus admin */}
            {isAdmin && (
              <>
                <li>
                  
                  <Link href="/admin/form" className="flex items-center space-x-4 hover:bg-gray-700 p-2 rounded-lg transition-colors">
                    <DocumentAddIcon className="h-6 w-6 text-gray-300" />
                      {isOpen && <span>Form</span>}
                  </Link>
                </li>
                <li>  
                  <Link href="/admin/mutasi" className="flex items-center space-x-4 hover:bg-gray-700 p-2 rounded-lg transition-colors">
                    <DocumentAddIcon className="h-6 w-6 text-gray-300" />
                      {isOpen && <span>Mutasi</span>}
                  </Link>
                </li>
                <li>  
                  <Link href="/admin/uploadCSV" className="flex items-center space-x-4 hover:bg-gray-700 p-2 rounded-lg transition-colors">
                    <DocumentAddIcon  className="h-6 w-6 text-gray-300" />
                      {isOpen && <span>Upload / Download</span>}
                  </Link>
                </li>
                <li>  
                  <Link href="/admin/cheklist" className="flex items-center space-x-4 hover:bg-gray-700 p-2 rounded-lg transition-colors">
                    <DocumentAddIcon  className="h-6 w-6 text-gray-300" />
                      {isOpen && <span> Cheklist</span>}
                  </Link>
                </li>
               
              </>
            )}
          </ul>
        </div>
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute top-4 -right-4 bg-gray-700 text-white p-2 rounded-full shadow-md focus:outline-none hover:bg-gray-600 transition-all"
      >
        {isOpen ? <ChevronLeftIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}
