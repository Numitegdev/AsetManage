'use client';
import { useEffect, useState } from 'react';
import { db, collection, getDocs } from '/lib/firebase'; // Pastikan Anda mengimpor Firestore
import { format } from 'date-fns';
import Sidebar from '/components/Sidebar';

const MutationsPage = () => {
  const [mutations, setMutations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(''); // Filter teks
  const [filterMonth, setFilterMonth] = useState(''); // Filter bulan
  const [filterYear, setFilterYear] = useState(''); // Filter tahun
  const [currentPage, setCurrentPage] = useState(1); // Halaman aktif
  const pageSize = 10; // Jumlah data per halaman

  useEffect(() => {
    const fetchMutations = async () => {
      const mutationsCollection = collection(db, 'mutations');
      const snapshot = await getDocs(mutationsCollection);
      const mutationList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(), // Mengonversi timestamp ke Date
      }));
      setMutations(mutationList);
      setLoading(false);
    };

    fetchMutations();
  }, []);

  // Filter berdasarkan teks, bulan, dan tahun
  const filteredMutations = mutations.filter((mutation) => {
    const matchesText = mutation.field?.toLowerCase().includes(filter.toLowerCase()) ||
      mutation.kodeBarang?.toLowerCase().includes(filter.toLowerCase());
    const matchesMonth = filterMonth
      ? mutation.timestamp && mutation.timestamp.getMonth() + 1 === parseInt(filterMonth)
      : true;
    const matchesYear = filterYear
      ? mutation.timestamp && mutation.timestamp.getFullYear() === parseInt(filterYear)
      : true;

    return matchesText && matchesMonth && matchesYear;
  });

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedMutations = filteredMutations.slice(
    startIndex,
    startIndex + pageSize
  );

  const totalPages = Math.ceil(filteredMutations.length / pageSize);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Helper untuk membuat daftar tahun unik dari data timestamp
  const years = Array.from(
    new Set(mutations.map(m => m.timestamp?.getFullYear()).filter(Boolean))
  ).sort((a, b) => b - a); // Mengurutkan dari yang terbaru ke yang terlama

  return (
    <div className="flex min-h-screen">
      <Sidebar isAdmin />
      <div className="flex-1 p-6 bg-gray-100">
        <h2 className="text-2xl font-bold mb-6">Mutations Log</h2>

        {/* Filter Section */}
        <div className="flex gap-4 mb-4">
          {/* Filter Teks */}
          <input
            type="text"
            placeholder="Filter by field or kode barang..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg w-full"
          />

          {/* Filter Bulan */}
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          {/* Filter Tahun */}
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Field</th>
                <th className="px-6 py-3 text-left">Kode Barang</th>
                <th className="px-6 py-3 text-left">Old Value</th>
                <th className="px-6 py-3 text-left">New Value</th>
                <th className="px-6 py-3 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMutations.length > 0 ? (
                paginatedMutations.map((mutation) => (
                  <tr key={mutation.id} className="hover:bg-gray-100">
                    <td className="px-6 py-4">{mutation.field}</td>
                    <td className="px-6 py-4">{mutation.kodeBarang}</td>
                    <td className="px-6 py-4">{mutation.oldValue}</td>
                    <td className="px-6 py-4">{mutation.newValue}</td>
                    <td className="px-6 py-4">
                      {mutation.timestamp ? format(mutation.timestamp, "yyyy-MM-dd HH:mm:ss") : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No mutations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:bg-gray-200"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:bg-gray-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default MutationsPage;
