'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase'; // Pastikan konfigurasi Firebase sudah benar
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { CheckCircleIcon, QuestionMarkCircleIcon, XCircleIcon } from '@heroicons/react/solid';
import Sidebar from '/components/Sidebar';

export default function AssetTable() {
  const [assets, setAssets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [codeFilter, setCodeFilter] = useState('');
  const [kondisiFilter, setCodeFilter] = useState('');
  const [jenisFilter, setCodeFilter] = useState('');

  useEffect(() => {
    async function fetchAssets() {
      const querySnapshot = await getDocs(collection(db, 'assets'));
      const assetList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssets(assetList);
    }
    fetchAssets();
  }, []);

  const updateAction = async (id, action) => {
    const assetRef = doc(db, 'assets', id);
    await updateDoc(assetRef, { action });
    setAssets(assets.map(asset => (asset.id === id ? { ...asset, action } : asset)));
  };

  const resetActions = async () => {
    // Update all assets to have no action status
    const updatedAssets = assets.map(asset => ({ ...asset, action: '' }));
    setAssets(updatedAssets);
    // Optionally update them in Firebase as well
    updatedAssets.forEach(async (asset) => {
      const assetRef = doc(db, 'assets', asset.id);
      await updateDoc(assetRef, { action: '' });
    });
  };

  const getRowColor = (action) => {
    switch (action) {
      case '✅': return 'bg-green-100 text-green-700';
      case '❓': return 'bg-orange-100 text-orange-700';
      case '❌': return 'bg-red-100 text-red-700';
      default: return 'bg-white';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isAdmin />
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">Cheklist bulanan</h1>
          <div className="mb-4 space-y-2">
            <input
              type="text"
              placeholder="Filter by Status PT"
              className="border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-400"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by Jenis Barang"
              className="border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-400"
              value={jenisFilter}
              onChange={(e) => setJenisFilter(e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by Kondisi"
              className="border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-400"
              value={kondisiFilter}
              onChange={(e) => setkondisiFilter(e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by Lokasi"
              className="border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-400"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by Kode Barang"
              className="border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-400"
              value={codeFilter}
              onChange={(e) => setCodeFilter(e.target.value)}
            />
          </div>
          <div className="flex justify-end mb-4">
            <button
              className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              onClick={resetActions}
            >
              Reset
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse shadow-sm rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="p-3 text-left">Jenis Barang</th>
                  <th className="p-3 text-left">Kode Barang</th>
                  <th className="p-3 text-left">Lokasi</th>
                  <th className="p-3 text-left">Status PT</th>
                  <th className="p-3 text-left">Status Kondisi</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {assets
                  .filter(asset => {
                    return (
                      (statusFilter ? asset.status_PT.toLowerCase().includes(statusFilter.toLowerCase()) : true) &&
                      (locationFilter ? asset.lokasi.toLowerCase().includes(locationFilter.toLowerCase()) : true) &&
                      (jenisFilter ? asset.jenis_barang.toLowerCase().includes(jenisFilter.toLowerCase()) : true) &&
                      (kondisiFilter ? asset.status_kondisi.toLowerCase().includes(kondisiFilter.toLowerCase()) : true) &&
                      (codeFilter ? asset.kode_barang.toLowerCase().includes(codeFilter.toLowerCase()) : true)
                    );
                  })
                  .map((asset) => (
                    <tr key={asset.id} className={`border-b ${getRowColor(asset.action)}`}>
                      <td className="p-3">{asset.jenis_barang}</td>
                      <td className="p-3">{asset.kode_barang}</td>
                      <td className="p-3">{asset.lokasi}</td>
                      <td className="p-3">{asset.status_PT}</td>
                      <td className="p-3">{asset.status_kondisi}</td>
                      <td className="p-3 flex justify-center gap-2">
                        <button className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600" onClick={() => updateAction(asset.id, '✅')}>
                          <CheckCircleIcon className="w-6 h-6" />
                        </button>
                        <button className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600" onClick={() => updateAction(asset.id, '❓')}>
                          <QuestionMarkCircleIcon className="w-6 h-6" />
                        </button>
                        <button className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600" onClick={() => updateAction(asset.id, '❌')}>
                          <XCircleIcon className="w-6 h-6" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
