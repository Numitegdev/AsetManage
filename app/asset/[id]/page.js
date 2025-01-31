// app/asset/[id]/page.js
'use client';
// app/asset/[id]/page.js
import { useEffect, useState } from 'react';
import Sidebar from '/components/Sidebar';
import { db } from '/lib/firebase';
import { use } from 'react'; // Impor use dari React
import { doc, getDoc } from "firebase/firestore";
const AssetDetailPage = ({ params }) => {
  const { id } = use(params); // Menggunakan use untuk mendapatkan id
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAsset = async () => {
      if (id) {
        const assetDoc = doc(db, 'assets', id);
        const snapshot = await getDoc(assetDoc);
        if (snapshot.exists()) {
          setAsset(snapshot.data());
        } else {
          console.log('No such document!');
        }
        setLoading(false);
      }
    };

    fetchAsset();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!asset) {
    return <div>Asset not found</div>;
  }

  return (
    <div className="flex min-h-screen">
          <Sidebar isAdmin={false} />
    
          <div className="p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Asset Detail</h2>

      {/* Card for Jenis Barang and Kode Barang */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold">Jenis Barang</h3>
          <p>{asset.jenis_barang}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold">Kode Barang</h3>
          <p>{asset.kode_barang}</p>
        </div>
      </div>

      {/* Card for Lokasi, Spec, Status Kondisi, and Keterangan */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h3 className="font-bold">Detail Aset</h3>
        <p><strong>Lokasi:</strong> {asset.lokasi}</p>
        <p><strong>Spec:</strong> {asset.spec}</p>
        <p><strong>Status Kondisi:</strong> {asset.status_kondisi}</p>
        <p><strong>Keterangan:</strong> {asset.keterangan}</p>
      </div>

      {/* Card for Status PT */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h3 className="font-bold">Status PT</h3>
        <p>{asset.status_PT}</p>
        <div className="flex space-x-2 mt-2">
          {/* Logo PT */}
          {asset.status_PT === 'bekami' && <img src="/path/to/bekami-logo.png" alt="Bekami" className="h-8 w-8" />}
          {asset.status_PT === 'blueheron' && <img src="/path/to/blueheron-logo.png" alt="Blueheron" className="h-8 w-8" />}
          {asset.status_PT === 'aswa' && <img src="/path/to/aswa-logo.png" alt="Aswa" className="h-8 w-8" />}
          {asset.status_PT === 'briza' && <img src="/path/to/briza-logo.png" alt="Briza" className="h-8 w-8" />}
          {asset.status_PT === 'numiteg' && <img src="/path/to/numiteg-logo.png" alt="Numiteg" className="h-8 w-8" />}
        </div>
      </div>
    </div>




    </div>
  );
};

export default AssetDetailPage;