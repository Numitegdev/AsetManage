'use client';
import { useState, useEffect } from 'react';
import Sidebar from '/components/Sidebar';
import { db, collection, getDocs } from '/lib/firebase';
import Link from 'next/link';
export default function StatistikStatusPT() {
  const [groupedData, setGroupedData] = useState({});
  const [statusKeys, setStatusKeys] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mutations, setMutations] = useState([]);

  useEffect(() => {
    const fetchAssetsAndMutations = async () => {
      try {
        // Fetch assets data
        const assetsSnapshot = await getDocs(collection(db, 'assets'));
        const assetsData = assetsSnapshot.docs.map((doc) => doc.data());

        const grouped = {};
        assetsData.forEach((item) => {
          const status = item.status_PT
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());

          if (!grouped[status]) grouped[status] = [];
          grouped[status].push(item);
        });

        setGroupedData(grouped);
        setStatusKeys(Object.keys(grouped));

        // Fetch mutations data
        const mutationsSnapshot = await getDocs(collection(db, 'mutations'));
        const mutationsData = mutationsSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((mutation) => {
            const mutationDate = new Date(mutation.timestamp.seconds * 1000);
            const now = new Date();
            return (
              mutationDate.getMonth() === now.getMonth() &&
              mutationDate.getFullYear() === now.getFullYear()
            );
          });

        setMutations(mutationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAssetsAndMutations();
  }, []);

  const renderData = () => {
    if (statusKeys.length === 0) return <p>Loading...</p>;

    const currentStatus = statusKeys[currentIndex];
    const currentData = groupedData[currentStatus] || [];

    const totalAssets = currentData.length;
    const jenisBarangCount = {};

    currentData.forEach((item) => {
      const jenisBarang = item.jenis_barang
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());

      if (!jenisBarangCount[jenisBarang]) {
        jenisBarangCount[jenisBarang] = 0;
      }
      jenisBarangCount[jenisBarang] += 1;
    });

    // Filter mutations based on current status_PT
    const filteredMutations = mutations.filter(
      (mutation) =>
        mutation.oldValue?.toLowerCase() === currentStatus.toLowerCase() ||
        mutation.newValue?.toLowerCase() === currentStatus.toLowerCase()
    );

    return (
<div className="bg-white shadow-md flex-1 rounded-lg p-6 border border-gray-200">
  {/* Title Status PT */}
  <div className="mb-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold text-gray-800">Status PT: {currentStatus}</h2>

      {/* Tombol Previous dan Next */}
      <div className="flex space-x-4">
        <button
          onClick={handlePrev}
          className="flex items-center justify-center bg-blue-500 text-white py-3 px-6 rounded-lg shadow hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={currentIndex === 0}
        >
          Previous
        </button>

        <button
          onClick={handleNext}
          className="flex items-center justify-center bg-blue-500 text-white py-3 px-6 rounded-lg shadow hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={currentIndex === statusKeys.length - 1}
        >
          Next
        </button>
      </div>
    </div>

    {/* total aset */}
    <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center space-x-6">
      <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full">
        {/* Ikon besar */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 4H8m4-8H8m6 10a4 4 0 100-8 4 4 0 000 8z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">Total Assets</p>
        <p className="text-3xl font-bold text-gray-800">{totalAssets}</p>   
      </div>
      <div>
      <Link href="/admin/invo">
          <button
          className="flex items-center justify-center bg-blue-500 text-white py-3 px-6 rounded-lg shadow hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed">
          Invoice
        </button>
      </Link>   
      </div>
    </div>
  </div>

  {/* Detail Jenis Barang */}
  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
    <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">Detail Jenis Barang:</h3>
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 list-none">
      {Object.entries(jenisBarangCount).map(([jenisBarang, count]) => (
        <li key={jenisBarang} className="text-gray-600 mb-1">
          <div className=" w-full h-16 px-4 py-2 border border-gray-300 rounded-lg bg-gray-200 flex items-center justify-center">
            <span className="font-medium text-gray-800 text-sm">
              {jenisBarang}: {count}
            </span>
          </div>
        </li>
      ))}
    </ul>
    
  </div>


  {/* Tabel Mutasi */}
  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
    <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-700">Mutasi Bulan Ini</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto bg-white border border-gray-300 rounded-lg shadow-md">
        <thead className="bg-blue-500 text-white">
          <tr>
            <th className="px-4 py-2 border-b">No</th>
            <th className="px-4 py-2 border-b">Old Value</th>
            <th className="px-4 py-2 border-b">New Value</th>
            <th className="px-4 py-2 border-b">Kode Barang</th>
          </tr>
        </thead>
        <tbody>
          {filteredMutations.length > 0 ? (
            filteredMutations.map((mutation, index) => (
              <tr
                key={mutation.id}
                className={`${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-gray-100 transition-all duration-200`}
              >
                <td className="px-4 py-2 border-b text-center">{index + 1}</td>
                <td className="px-4 py-2 border-b text-center">{mutation.oldValue || '-'}</td>
                <td className="px-4 py-2 border-b text-center">{mutation.newValue || '-'}</td>
                <td className="px-4 py-2 border-b text-center">{mutation.kodeBarang || '-'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-2 border-b text-center" colSpan="4">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>

    );
  };

  const handleNext = () => {
    if (currentIndex < statusKeys.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-gray-100">
      <Sidebar isAdmin />
      <div className="flex flex-col flex-auto items-center p-6 space-y-6">
            <div className="w-full max-w-full">{renderData()}</div>
      </div>
    </div>
  );
}
