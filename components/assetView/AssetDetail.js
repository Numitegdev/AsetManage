// app/components/assetView/AssetDetail.js
'use client';
import { useEffect, useState } from 'react';
import { db, doc, getDoc } from '/lib/firebase';

const AssetDetail = ({ id }) => {
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
    <div className="p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Asset Detail</h2>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <p><strong>Jenis Barang:</strong> {asset.jenis_barang}</p>
        <p><strong>Spec:</strong> {asset.spec}</p>
        <p><strong>Kode Nomor Urut:</strong> {asset.kode_nomor_urut}</p>
        <p><strong>Kode Jenis Barang:</strong> {asset.kode_jenis_barang}</p>
        <p><strong>Kode Barang:</strong> {asset.kode_barang}</p>
        <p><strong>Lokasi:</strong> {asset.lokasi}</p>
        <p><strong>Status PT:</strong> {asset.status_PT}</p>
        <p><strong>Status Kondisi:</strong> {asset.status_kondisi}</p>
        <p><strong>Keterangan:</strong> {asset.keterangan}</p>
      </div>
    </div>
  );
};

export default AssetDetail;