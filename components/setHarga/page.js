"use client";

import { useEffect, useState } from "react";
import { db, collection, getDocs, addDoc, updateDoc, query, where, doc } from "/lib/firebase";
import Sidebar from '/components/Sidebar';
const SetHargaPage = () => {
  const [dataPT, setDataPT] = useState({});
  const [hargaInput, setHargaInput] = useState({});
  const [hargaAset, setHargaAset] = useState({}); // Menyimpan harga yang sudah disimpan
  const [selectedPT, setSelectedPT] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "assets"));
        const assets = querySnapshot.docs.map((doc) => doc.data());

        // Kelompokkan data berdasarkan status_PT dan jenis_barang
        const groupedData = {};
        assets.forEach((asset) => {
          const { status_PT, jenis_barang } = asset;
          if (!groupedData[status_PT]) groupedData[status_PT] = {};
          if (!groupedData[status_PT][jenis_barang]) {
            groupedData[status_PT][jenis_barang] = { jumlah: 0 };
          }
          groupedData[status_PT][jenis_barang].jumlah += 1;
        });

        setDataPT(groupedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchHargaAset = async () => {
      try {
        const hargaSnapshot = await getDocs(collection(db, "hargaAset"));
        const hargaData = {};
        hargaSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          hargaData[`${data.status_PT}-${data.jenis_barang}`] = {
            harga: data.setHarga,
            docId: doc.id, // Simpan docId untuk update nanti
          };
        });

        setHargaAset(hargaData);
      } catch (error) {
        console.error("Error fetching harga aset:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
    fetchHargaAset();
  }, []);

  const handleHargaChange = (pt, jenis, value) => {
    setHargaInput((prev) => ({
      ...prev,
      [`${pt}-${jenis}`]: value,
    }));
  };

  const handleSubmitHarga = async (pt, jenis) => {
    const harga = hargaInput[`${pt}-${jenis}`];
    if (!harga) {
      alert("Masukkan harga terlebih dahulu!");
      return;
    }

    try {
      if (hargaAset[`${pt}-${jenis}`]) {
        // Jika harga sudah ada, lakukan update
        await updateDoc(doc(db, "hargaAset", hargaAset[`${pt}-${jenis}`].docId), {
          setHarga: Number(harga),
        });
        alert(`Harga ${jenis} untuk ${pt} berhasil diperbarui!`);
      } else {
        // Jika harga belum ada, lakukan insert
        const docRef = await addDoc(collection(db, "hargaAset"), {
          jenis_barang: jenis,
          setHarga: Number(harga),
          status_PT: pt,
        });
        setHargaAset((prev) => ({
          ...prev,
          [`${pt}-${jenis}`]: { harga: Number(harga), docId: docRef.id },
        }));
        alert(`Harga ${jenis} untuk ${pt} berhasil disimpan!`);
      }
    } catch (error) {
      console.error("Error menyimpan harga:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isAdmin />
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Set Harga Barang per PT
        </h1>

        {/* Dropdown Pilih PT */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Pilih Status PT:
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedPT}
            onChange={(e) => setSelectedPT(e.target.value)}
          >
            <option value="">Semua PT</option>
            {Object.keys(dataPT).map((pt) => (
              <option key={pt} value={pt}>
                {pt}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading data...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-md rounded-md overflow-hidden">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="border p-3">Status PT</th>
                  <th className="border p-3">Jenis Barang</th>
                  <th className="border p-3">Jumlah</th>
                  <th className="border p-3">Set Harga</th>
                  <th className="border p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(dataPT)
                  .filter(([pt]) => !selectedPT || pt === selectedPT) // Filter PT
                  .map(([pt, barang]) =>
                    Object.entries(barang).map(([jenis, data]) => (
                      <tr key={`${pt}-${jenis}`} className="border">
                        <td className="border p-3">{pt}</td>
                        <td className="border p-3">{jenis}</td>
                        <td className="border p-3">{data.jumlah}</td>
                        <td className="border p-3">
                          <input
                            type="number"
                            className="border p-2 w-full rounded-md"
                            placeholder="Masukkan harga"
                            value={
                              hargaInput[`${pt}-${jenis}`] !== undefined
                                ? hargaInput[`${pt}-${jenis}`]
                                : hargaAset[`${pt}-${jenis}`]?.harga || ""
                            }
                            onChange={(e) =>
                              handleHargaChange(pt, jenis, e.target.value)
                            }
                          />
                        </td>
                        <td className="border p-3">
                          <button
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                            onClick={() => handleSubmitHarga(pt, jenis)}
                          >
                            {hargaAset[`${pt}-${jenis}`] ? "Update" : "Simpan"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default SetHargaPage;
