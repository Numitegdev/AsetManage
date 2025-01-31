'use client';

import { useEffect, useState } from 'react';
import { db, collection, getDocs } from '/lib/firebase';
import Sidebar from '/components/Sidebar';
import { EyeIcon } from '@heroicons/react/solid';
import Link from 'next/link';

const TableView = () => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    jenis_barang: '',
    spec: '',
    status_PT: '',
    status_kondisi: ''
  });

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const assetsCollection = collection(db, 'assets');
        const snapshot = await getDocs(assetsCollection);
        const assetList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAssets(assetList);
        setFilteredAssets(assetList);
      } catch (error) {
        console.error('Error fetching assets:', error);
      }
    };

    fetchAssets();
  }, []);

  const applyFilters = () => {
    let filtered = assets;

    if (filters.jenis_barang) {
      filtered = filtered.filter(asset =>
        asset.jenis_barang.toLowerCase().includes(filters.jenis_barang.toLowerCase())
      );
    }
    if (filters.spec) {
      filtered = filtered.filter(asset =>
        asset.spec.toLowerCase().includes(filters.spec.toLowerCase())
      );
    }
    if (filters.status_PT) {
      filtered = filtered.filter(asset =>
        asset.status_PT.toLowerCase().includes(filters.status_PT.toLowerCase())
      );
    }
    if (filters.status_kondisi) {
      filtered = filtered.filter(asset =>
        asset.status_kondisi.toLowerCase().includes(filters.status_kondisi.toLowerCase())
      );
    }

    setFilteredAssets(filtered);
    setCurrentPage(1);
  };

  const indexOfLastAsset = currentPage * itemsPerPage;
  const indexOfFirstAsset = indexOfLastAsset - itemsPerPage;
  const currentAssets = filteredAssets.slice(indexOfFirstAsset, indexOfLastAsset);

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex min-h-screen font-sans">
      <Sidebar isAdmin={false} />
      <div className="flex-1 p-6 bg-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Asset Table</h2>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-gray-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-gray-700 transition duration-300"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {showFilters && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
            {['jenis_barang', 'spec', 'status_PT', 'status_kondisi'].map((filterKey) => (
              <input
                key={filterKey}
                type="text"
                placeholder={`Filter by ${filterKey.replace('_', ' ')}`}
                value={filters[filterKey]}
                onChange={(e) => setFilters({ ...filters, [filterKey]: e.target.value })}
                className="border p-2 mb-2 w-full rounded-md"
              />
            ))}
            <button
              onClick={applyFilters}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Apply Filters
            </button>
          </div>
        )}

        <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-800 text-white">
              <tr>
                {['Jenis Barang', 'Spec', 'Kode Nomor Urut', 'Kode Jenis Barang', 'Kode Barang', 'Lokasi', 'Status PT', 'Status Kondisi', 'Keterangan', 'Aksi'].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-sm font-medium">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentAssets.map((asset, index) => (
                <tr key={asset.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  {['jenis_barang', 'spec', 'kode_nomor_urut', 'kode_jenis_barang', 'kode_barang', 'lokasi', 'status_PT', 'status_kondisi', 'keterangan'].map((key) => (
                    <td key={key} className="px-6 py-4 border-b text-sm">{asset[key]}</td>
                  ))}
                  <td className="px-6 py-4 border-b text-center">
                    <Link href={`/asset/${asset.id}`}>
                      <button
                        className="bg-amber-500 text-white p-1 rounded-md ml-1 hover:bg-red-700"
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center p-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
            >
              Prev
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableView;
