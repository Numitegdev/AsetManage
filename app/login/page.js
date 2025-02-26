'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validasi username dan password
    if (username === 'admin' && password === 'N03m1t3g') {
      // Simpan status login ke cookies
      document.cookie = 'isLoggedIn=true; path=/';

      // Arahkan ke halaman admin
      router.push('/admin');
    } else {
      setError('Invalid username or password');
    }
  };

  const handleBack = () => {
    // Arahkan kembali ke halaman utama
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-hidden md:grid md:grid-cols-2 md:gap-4">
        {/* Kolom Form Login */}
        <div className="p-8">
          <form onSubmit={handleLogin}>
            <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Login</h1>

            <div className="mb-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition duration-300"
            >
              Login
            </button>

            {/* Tombol Back */}
            <button
              type="button"
              onClick={handleBack}
              className="mt-4 text-blue-500 hover:underline w-full"
            >
              Back to Home
            </button>
          </form>
        </div>

        {/* Kolom Gambar */}
        <div className="hidden md:block">
          <img
            src="/hero.jpg"
            alt="Random"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
