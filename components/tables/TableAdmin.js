'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { addDoc ,db, collection, getDocs, doc, updateDoc, deleteDoc } from '/lib/firebase'; // Tambahkan doc, updateDoc, deleteDoc
import Sidebar from '/components/Sidebar';
import { PencilIcon,PrinterIcon ,TrashIcon , EyeIcon  } from '@heroicons/react/solid';
import { PDFDocument, rgb } from "pdf-lib";
import QRCode from "qrcode";


const logMutation = async (assetId, field, oldValue, newValue, kodeBarang) => {
  try {
    await addDoc(collection(db, 'mutations'), {
      assetID: assetId,
      field: field,
      oldValue: oldValue,
      newValue: newValue,
      kodeBarang: kodeBarang, // Tambahkan kodeBarang di sini
      timestamp: new Date(), // Menyimpan waktu perubahan
    });
  } catch (error) {
    console.error('Error logging mutation:', error);
  }
};

const TableAdmin = () => {
  const router = useRouter();
  const [assets, setAssets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    jenis_barang: '',
    spec: '',
    kode_nomor_urut: '',
    kode_jenis_barang: '',
    kode_barang: '',
    lokasi: '',
    status_PT: '',
    status_kondisi: '',
    keterangan: ''
  });
  const [showFilters, setShowFilters] = useState(true); // State untuk mengontrol tampilan filter
  const [editData, setEditData] = useState(null); // State untuk menyimpan data yang akan diedit
  const [showEditModal, setShowEditModal] = useState(false); // State untuk menampilkan modal edit
  const itemsPerPage = 10; // Pagination untuk 10 data per halaman

  useEffect(() => {
    const fetchAssets = async () => {
      const assetsCollection = collection(db, 'assets');
      const snapshot = await getDocs(assetsCollection);
      const assetList = snapshot.docs.map(doc => ({
        id: doc.id, // Tambahkan id dokumen untuk edit dan delete
        ...doc.data(),
      }));
      setAssets(assetList);
    };

    fetchAssets();
  }, []);

  // Pagination logic
const indexOfLastAsset = currentPage * itemsPerPage;
const indexOfFirstAsset = indexOfLastAsset - itemsPerPage;

// Filtered assets
const filteredAssets = assets.filter((asset) => {
  return Object.keys(filters).every((key) => {
    return asset[key].toLowerCase().includes(filters[key].toLowerCase());
  });
});

// Update current assets based on filtered results
const currentAssets = filteredAssets.slice(indexOfFirstAsset, indexOfLastAsset);

// Calculate total pages based on filtered results
const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

const handlePageChange = (pageNumber) => {
  setCurrentPage(pageNumber);
};

const handleFilterChange = (e) => {
  const { name, value } = e.target;

  // Update filters and reset to page 1
  setFilters((prevFilters) => ({
    ...prevFilters,
    [name]: value,
  }));
  setCurrentPage(1); // Reset to the first page
};

const toggleFilters = () => {
  setShowFilters((prevState) => !prevState); // Toggle the filter visibility
};

  // Handle delete data
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'assets', id)); // Hapus dokumen di Firebase
      setAssets((prevAssets) => prevAssets.filter(asset => asset.id !== id)); // Update state
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  // Handle edit data
  const handleEdit = (asset) => {
    setEditData(asset); // Set data yang akan diedit
    setShowEditModal(true); // Tampilkan modal edit
  };

  const handleSaveEdit = async () => {
    if (editData) {
      try {
        const assetDoc = doc(db, 'assets', editData.id); // Referensi ke dokumen yang akan diupdate
        const oldStatusPT = assets.find(asset => asset.id === editData.id).status_PT; // Ambil nilai lama
        const oldLokasi = assets.find(asset => asset.id === editData.id).lokasi; // Ambil nilai lama
        const kodeBarang = assets.find(asset => asset.id === editData.id).kode_barang; // Ambil kode barang
  
        await updateDoc(assetDoc, editData); // Update data di Firebase
  
        // Cek apakah ada perubahan pada status_PT
        if (editData.status_PT !== oldStatusPT) {
          await logMutation(editData.id, 'status_PT', oldStatusPT, editData.status_PT, kodeBarang);
        }
  
        // Cek apakah ada perubahan pada lokasi
        if (editData.lokasi !== oldLokasi) {
          await logMutation(editData.id, 'lokasi', oldLokasi, editData.lokasi, kodeBarang);
        }
  
        setAssets((prevAssets) =>
          prevAssets.map(asset =>
            asset.id === editData.id ? { ...asset, ...editData } : asset
          )
        ); // Update state
        setShowEditModal(false); // Tutup modal edit
      } catch (error) {
        console.error('Error updating asset:', error);
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const generateSticker = async (asset) => {
    const { kode_barang } = asset;
  
    // Generate QR Code as Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(kode_barang);
  
    // Create PDF Document
    const pdfDoc = await PDFDocument.create();
  
    // Add Page with custom size (50.8 mm x 21.6 mm -> ~144 pt x 61 pt at 72 DPI)
    const page = pdfDoc.addPage([144, 61]);
  
    // Set fonts and content
    const { width, height } = page.getSize();
  
    // Embed Logo
    const logoUrl = "/numi.png"; // Path to logo
    const logoImage = await fetch(logoUrl).then((res) => res.arrayBuffer());
    const logo = await pdfDoc.embedPng(logoImage);
  
    // Draw Layout: Barcode (QR Code), Logo, and Kode Barang
    const qrImage = await pdfDoc.embedPng(qrCodeDataUrl);
    page.drawImage(qrImage, {
      x: 5, // Left margin
      y: height - 60, // Adjust QR position vertically
      width: 55,
      height: 55,
    });
  
    // Logo on the top-right
    page.drawImage(logo, {
      x: 60, // Positioned to the right of QR Code
      y: height - 30, // Adjust Logo position vertically
      width: 70,
      height: 20,
    });
  
    // Kode Barang below the logo
    page.drawText(` ${kode_barang}`, {
      x: 60, // Same x as logo
      y: 15, // Bottom of the page
      size: 10,
      color: rgb(0, 0, 0),
    });
  
    // Download PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${kode_barang}_sticker.pdf`;
    link.click();
  };
  
  
  return (
    <div className="flex min-h-screen font-sans">
      <Sidebar isAdmin />
      <div className="flex-1 p-6 bg-gray-100">
        <h2 className="text-[16px] font-extrabold text-gray-800 mb-6" style={{ fontFamily: 'Poppins' }}>Table Admin</h2>

        {/* Button to toggle filters */}
        <button
          onClick={toggleFilters}
          className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-700 transition duration-300"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* Filter Bar */}
          {showFilters && (
            <div className="mb-4 grid grid-cols-3 gap-4">
              {Object.keys(filters).map((key) => (
                <div key={key} className="flex items-center">
                  <label htmlFor={key} className="mr-2 text-sm">{key.replace(/_/g, ' ').toUpperCase()}:</label>
                  <input
                    type="text"
                    id={key}
                    name={key}
                    value={filters[key]}
                    onChange={handleFilterChange}
                    className="px-3 py-2 border rounded-md text-sm w-full"
                    placeholder={`Filter by ${key.replace(/_/g, ' ')}`}
                  />
                </div>
              ))}
            </div>
          )}

{/* Table and Pagination */}
<div className="overflow-x-auto shadow-lg rounded-lg bg-white">
  <table className="min-w-full table-auto border-collapse">
    <thead className="bg-gray-800 text-white">
      <tr>
        <th className="px-6 py-3 text-left">Jenis Barang</th>
        <th className="px-6 py-3 text-left">Spec</th>
        <th className="px-6 py-3 text-left">Kode Nomor Urut</th>
        <th className="px-6 py-3 text-left">Kode Jenis Barang</th>
        <th className="px-6 py-3 text-left">Kode Barang</th>
        <th className="px-6 py-3 text-left">Lokasi</th>
        <th className="px-6 py-3 text-left">Status PT</th>
        <th className="px-6 py-3 text-left">Status Kondisi</th>
        <th className="px-6 py-3 text-left">Keterangan</th>
        <th className="px-6 py-3 text-left">Actions</th>
      </tr>
    </thead>
    <tbody>
      {currentAssets.map((asset, index) => (
        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
          <td className="px-6 py-4">{asset.jenis_barang}</td>
          <td className="px-6 py-4">{asset.spec}</td>
          <td className="px-6 py-4">{asset.kode_nomor_urut}</td>
          <td className="px-6 py-4">{asset.kode_jenis_barang}</td>
          <td className="px-6 py-4">{asset.kode_barang}</td>
          <td className="px-6 py-4">{asset.lokasi}</td>
          <td className="px-6 py-4">{asset.status_PT}</td>
          <td className="px-6 py-4">{asset.status_kondisi}</td>
          <td className="px-6 py-4">{asset.keterangan}</td>
          <td className="px-4 py-4">
            <button
              onClick={() => handleEdit(asset)}
              className="bg-blue-500 text-white p-1 rounded-md ml-1 hover:bg-blue-700"
            >
              <PencilIcon className="h-3 w-3" />
            </button>
            
            <button
              onClick={() => generateSticker(asset)}
              className="bg-gray-500 text-white p-1 rounded-md ml-1 hover:bg-red-700"
              title="Print"
            >
              <PrinterIcon className="h-3 w-3" />
            </button>
            
            <button
              onClick={() => handleDelete(asset.id)}
              className="bg-red-500 text-white p-1 rounded-md ml-1 hover:bg-red-700"
            >
              <TrashIcon className="h-3 w-3" />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* Pagination */}
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

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-md shadow-lg">
              <h2 className="text-lg font-bold mb-4">Edit Asset</h2>
              {Object.keys(filters).map((key) => (
                <div key={key} className="mb-4">
                  <label htmlFor={key} className="block text-sm font-medium">{key.replace(/_/g, ' ').toUpperCase()}</label>
                  <input
                    type="text"
                    id={key}
                    name={key}
                    value={editData[key] || ''}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              ))}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveEdit}
                  className="bg-green-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableAdmin;
