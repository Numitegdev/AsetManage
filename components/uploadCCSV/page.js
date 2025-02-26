'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse'; // Install dulu dengan `npm install papaparse`
import { db, collection, getDocs , addDoc} from '/lib/firebase'; // Pastikan Firebase sudah diimpor dengan benar

import Sidebar from '/components/Sidebar';

const UploadCSVPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [assetsData, setAssetsData] = useState([]);

  // Mengambil data assets dari Firebase
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'assets'));
      const data = querySnapshot.docs.map((doc) => doc.data());
      setAssetsData(data);
    };

    fetchData();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a CSV file first.');
      return;
    }

    setUploading(true);
    setMessage('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        const data = result.data;

        try {
          const assetsCollection = collection(db, 'assets');
          const promises = data.map((row) => addDoc(assetsCollection, row));
          await Promise.all(promises);

          setMessage('Data successfully uploaded to Firebase!');
        } catch (error) {
          console.error('Error uploading data:', error);
          setMessage('Failed to upload data. Please check the file format and try again.');
        } finally {
          setUploading(false);
          setFile(null);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setMessage('Failed to parse CSV file. Please check the file format.');
        setUploading(false);
      },
    });
  };

  const handleExport = () => {
    // Konversi data ke CSV menggunakan papaparse
    const csv = Papa.unparse(assetsData);

    // Buat file CSV dan unduh
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'assets_data.csv';
    link.click();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar isAdmin />
   
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 px-6">
  {/* Header Image */}
  <div className="w-full flex justify-center mb-6">
    <img
      src= "https://picsum.photos/800/200" // Random image from Unsplash
      alt= "Header"
      className= "rounded-lg shadow-lg w-full max-w-xl xl:h-52 md:h-24 object-cover"
    />
  </div>

  {/* Form Container with Two Columns */}
  <div className="w-full max-w-6xl flex flex-wrap justify-center gap-6">
    {/* Upload CSV Section */}
    <div className="bg-white shadow rounded-lg p-8 w-full max-w-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700 text-center">Upload CSV File</h2>
      <p className="text-sm text-gray-500 mb-6 text-center">
        File CSV akan dimasukkan ke database, pastikan tidak ada data kosong dalam CSV
      </p>
      <label
        htmlFor="file-upload"
        className="block w-full cursor-pointer bg-indigo-50 text-indigo-600 text-sm font-semibold px-4 py-3 rounded-lg border border-dashed border-indigo-400 hover:bg-indigo-100 transition"
      >
        <input
          type="file"
          id="file-upload"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        Click to upload your file
      </label>
      {file && (
        <div className="mt-3 text-sm text-gray-600">
          <span className="font-medium">Selected file:</span> {file.name}
        </div>
      )}
      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="mt-6 w-full bg-indigo-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {message && (
        <div
          className={`mt-4 text-sm p-3 rounded-lg ${
            message.includes('successfully')
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {message}
        </div>
      )}
    </div>

    {/* Download CSV Section */}
    <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 text-center mb-6">Download Data</h3>
      <p className="text-sm text-gray-500 text-center mb-4">
        Klik tombol di bawah ini untuk mengunduh data dalam format CSV.
      </p>
      <div className="flex justify-center">
        <button
          onClick={handleExport}
          className="w-full bg-green-600 text-white text-sm font-semibold py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-300 ease-in-out"
        >
          Download Data to CSV
        </button>
      </div>
    </div>
  </div>
</div>



    </div>
  );
};

export default UploadCSVPage;
