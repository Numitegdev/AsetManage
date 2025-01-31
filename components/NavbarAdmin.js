'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function NavbarAdmin() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Periksa apakah token login ada di cookies
    const isLoggedInCookie = document.cookie.includes('isLoggedIn=true');
    setIsLoggedIn(isLoggedInCookie);
  }, []);

  const handleLogout = () => {
    // Hapus token login dari cookies
    document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';

    // Arahkan ke halaman login
    router.push('/login');
  };

  return (
    <div className="bg-gray-800 text-white flex items-center justify-between p-4">
      <div className="text-xl font-semibold">Dashboard</div>
      <div className="flex items-center space-x-4">
        
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Logout
          </button>
       
      </div>
    </div>
  );
}
