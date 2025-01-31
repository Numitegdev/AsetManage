'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Periksa apakah token login ada di cookies
    const isLoggedInCookie = document.cookie.includes('isLoggedIn=true');
    setIsLoggedIn(isLoggedInCookie);
  }, []);

  return (
    <div className="bg-gray-800 text-white flex items-center justify-between p-4">
      <div className="text-xl font-semibold">Dashboard</div>
      <div className="flex items-center space-x-4">
       
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Login
          </Link>
        
      </div>
    </div>
  );
}
