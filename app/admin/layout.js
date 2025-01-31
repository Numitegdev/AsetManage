import '@/styles/globals.css';
import { AuthProvider } from '/components/AuthContext'; // Pastikan path sesuai
import NavbarAdmin from '../../components/NavbarAdmin'; // Pastikan path sesuai

export default function AdminLayout({ children }) {
  return (
    
        <AuthProvider>
          <div className="min-h-screen bg-gray-100">
            <NavbarAdmin /> {/* Navbar ditempatkan di sini */}
            <div className="flex">
              <div className="flex-1">
                {/* Menampilkan konten yang di-passing ke Layout */}
                {children}
              </div>
            </div>
          </div>
        </AuthProvider>
 
  );
}

