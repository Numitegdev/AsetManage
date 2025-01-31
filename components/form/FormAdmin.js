'use client';

import { useState, useEffect } from 'react';
import { db } from '/lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import Sidebar from '/components/Sidebar';

const jenisBarangOptions = {
  'Leptop': '97',
  'Monitor': '05',
  'Printer': '03',
};

const lokasiOptions = {
  '02': 'R. Admin',
  '05': 'R. ACT',
  '07': 'R. Server Utama',
};

const statusPTOptions = ['Bekami', 'Aswa', 'Briza', 'Numiteg', 'BlueHeron'];

export default function AssetForm() {
  const [jenisBarang, setJenisBarang] = useState('Leptop');
  const [kodeJenisBarang, setKodeJenisBarang] = useState(jenisBarangOptions['Leptop']);
  const [kodeNomorUrut, setKodeNomorUrut] = useState('001');
  const [lokasi, setLokasi] = useState('02');
  const [statusPT, setStatusPT] = useState('Bekami');
  const [statusKondisi, setStatusKondisi] = useState('ok');
  const [keterangan, setKeterangan] = useState('');
  const [spec, setSpec] = useState('');

  useEffect(() => {
    setKodeJenisBarang(jenisBarangOptions[jenisBarang]);
    generateKodeNomorUrut(jenisBarangOptions[jenisBarang]);
  }, [jenisBarang]);

  async function generateKodeNomorUrut(kodeJenis) {
    const q = query(collection(db, 'assets'), where('kode_jenis_barang', '==', kodeJenis));
    const querySnapshot = await getDocs(q);
    let maxNomorUrut = 0;
    querySnapshot.forEach((doc) => {
      const nomorUrut = parseInt(doc.data().kode_nomor_urut);
      if (nomorUrut > maxNomorUrut) {
        maxNomorUrut = nomorUrut;
      }
    });
    setKodeNomorUrut(String(maxNomorUrut + 1).padStart(3, '0'));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const kodeBarang = `${kodeJenisBarang}-${kodeNomorUrut}-00-${lokasi}`;
    const newAsset = {
      jenis_barang: jenisBarang,
      spec,
      kode_nomor_urut: kodeNomorUrut,
      kode_jenis_barang: kodeJenisBarang,
      kode_barang: kodeBarang,
      lokasi: lokasiOptions[lokasi], // Simpan nama lokasi, bukan kodenya
      status_PT: statusPT,
      status_kondisi: statusKondisi,
      keterangan,
    };
    await addDoc(collection(db, 'assets'), newAsset);
    alert('Data berhasil ditambahkan!');
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isAdmin />
      <div className="w-full max-w-4xl mx-auto p-8">
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          <h2 className="text-2xl font-semibold text-center">Tambah Data Aset</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Jenis Barang</label>
              <select
                value={jenisBarang}
                onChange={(e) => setJenisBarang(e.target.value)}
                className="w-full mt-1 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(jenisBarangOptions).map((label) => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Lokasi</label>
              <select
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                className="w-full mt-1 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(lokasiOptions).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status PT</label>
              <select
                value={statusPT}
                onChange={(e) => setStatusPT(e.target.value)}
                className="w-full mt-1 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusPTOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status Kondisi</label>
              <select
                value={statusKondisi}
                onChange={(e) => setStatusKondisi(e.target.value)}
                className="w-full mt-1 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ok">OK</option>
                <option value="trouble">Trouble</option>
                <option value="service">Service</option>
                <option value="hilang / dpo">Hilang / DPO</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Spesifikasi</label>
            <input
              type="text"
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Keterangan</label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">Kode Barang: <strong>{kodeJenisBarang}-{kodeNomorUrut}-00-{lokasi}</strong></p>
            <button
              type="submit"
              className="w-full mt-4 bg-blue-600 text-white py-3 px-6 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
