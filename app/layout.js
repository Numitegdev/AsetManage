// app/layout.js
'use client';

import '/styles/globals.css';
import { AuthProvider } from '/components/AuthContext'; // Pastikan path sesuai
import Navbar from '../components/Navbar'; // Pastikan path sesuai
import { usePathname } from 'next/navigation';
import { PencilIcon, TrashIcon } from '@heroicons/react/solid';
export default function Layout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin'); // Periksa apakah path dimulai dengan "/admin"

  return (
    <html lang="en">
        <head>
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap" 
        />
      </head>
      <body>
        <AuthProvider>
          <div className="min-h-screen bg-gray-100 font-sans">
            {!isAdmin && <Navbar />} {/* Tampilkan Navbar hanya jika bukan di halaman admin */}
            <div className="flex">
              <div className="flex-1">{children}</div>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
