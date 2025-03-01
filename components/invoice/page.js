"use client";

import { useEffect, useState } from "react";
import { db, collection, getDocs } from "/lib/firebase";
import { Document, Packer, Paragraph, Table, TableCell, TableRow ,AlignmentType,HeadingLevel ,WidthType,BorderStyle,Header, ImageRun } from "docx";
import { saveAs } from "file-saver";
import Sidebar from '/components/Sidebar';
const InvoicePage = () => {
  const [dataPT, setDataPT] = useState({});
  const [hargaAset, setHargaAset] = useState({});
  const [selectedPT, setSelectedPT] = useState("");

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
        console.error("Error fetching assets:", error);
      }
    };

    const fetchHargaAset = async () => {
      try {
        const hargaSnapshot = await getDocs(collection(db, "hargaAset"));
        const hargaData = {};
        hargaSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          hargaData[`${data.status_PT}-${data.jenis_barang}`] = data.setHarga;
        });

        setHargaAset(hargaData);
      } catch (error) {
        console.error("Error fetching harga aset:", error);
      }
    };

    fetchAssets();
    fetchHargaAset();
  }, []);

  const calculateTotals = (pt) => {
    let totalHargaSewa = 0;
    let totalPPN = 0;

    if (!dataPT[pt]) return { totalHargaSewa: 0, totalPPN: 0, totalFinal: 0, totalPPH: 0 };

    Object.entries(dataPT[pt]).forEach(([jenis, data]) => {
      const setHarga = hargaAset[`${pt}-${jenis}`] || 0;
      const hargaSewa = data.jumlah * setHarga;
      const ppn = hargaSewa * (12 * ((11 / 12) * 0.01));

      totalHargaSewa += hargaSewa;
      totalPPN += ppn;
    });

    const totalPPH = totalHargaSewa * 0.02;
    const totalFinal = totalHargaSewa + totalPPN - totalPPH;

    return { totalHargaSewa, totalPPN, totalPPH, totalFinal };
  };
  
  const getPenerimaInvoice = (selectedPT) => {
    switch (selectedPT) {
      case "Bekami":
        return "PT. Berkah Barokah Bersama Ibu";
         case "Bekami A":
        return "PT. Berkah Barokah Bersama Ibu";
      case "Aswa":
        return "PT. Aswaja Sari JawaDwipa";
      case "Blueheron":
        return "PT. Berkah Putra Boga";
      case "Briza":
        return "PT. Berkah Rizki Abdurahman BIN AUF";
        case "Briza A":
        return "PT. Berkah Rizki Abdurahman BIN AUF";
      default:
        return "PT. Tidak Diketahui"; // Jika tidak cocok dengan opsi yang ada
    }
  };
  const getAlamatInvoice = (selectedPT) => {
    switch (selectedPT) {
      case "Bekami":
        return "Jl. Cantel No. 16 RT 001 RW 001 Mujamuju Umbulharjo, Yogyakarta, 55165";
         case "Bekami A":
        return "Jl. Cantel No. 16 RT 001 RW 001 Mujamuju Umbulharjo, Yogyakarta, 55165";
      case "Aswa":
        return "Jl. Tumenggung Jogonegoro Singkir RT 004 RW 012 Kel. Jaraksari Kec. Wonosobo, Wonosobo 56314";
      case "Blueheron":
        return "Jl. Asem Gede No. 23 Sanggrahan, Condongcatur Kec. Depok, Sleman 55281";
      case "Briza":
        return "Jl. May. Jend. Bambang Sugeng KM 2 Ruko Green Harmoni RT 006 RW 001 Rojoimo, Wonosobo";
         case "Briza A":
        return "Jl. May. Jend. Bambang Sugeng KM 2 Ruko Green Harmoni RT 006 RW 001 Rojoimo, Wonosobo";
      default:
        return "PT. Tidak Diketahui"; // Jika tidak cocok dengan opsi yang ada
    }
  };
  const getTelponInvoice = (selectedPT) => {
    switch (selectedPT) {
      case "Bekami":
        return "(0274) 541591";
        case "Bekami A":
        return "(0274) 541591";
      case "Aswa":
        return "-";
      case "Blueheron":
        return "-";
      case "Briza":
        return "-";
        case "Briza A":
        return "-";
      default:
        return "PT. Tidak Diketahui"; // Jika tidak cocok dengan opsi yang ada
    }
  };
  const exportToWord = () => {
    const tanggalInvoice = new Date().toLocaleDateString("id-ID");
    const jatuhTempo = new Date();
    jatuhTempo.setDate(jatuhTempo.getDate() + 4);
    const nomorInvoice = `INV.${Math.floor(100 + Math.random() * 900)}.${new Date().getFullYear()}`;
    const penerimaInvoice =  getPenerimaInvoice(selectedPT);
    const alamatPenerima = getAlamatInvoice(selectedPT);
    const teleponPenerima = " . ";

    const doc = new Document({
      sections: [
        {
          children: [
          
            new Paragraph({
              text: "FAKTUR TAGIHAN",
              bold: true,
              size: 28,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: "INVOICE",
              bold: true,
              size: 24,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "", spacing: { after: 200 } }), // Spasi
  
            // **Detail Invoice**

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE }, // Lebar otomatis
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({ text: `Kepada `, bold: true }),
                        new Paragraph({ text: `Alamat ` }),
                        new Paragraph({ text: `Telp. ` }),
                      ],
                      width: { size: 15, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ text: `:`, bold: true }),
                        new Paragraph({ text: `:` }),
                        new Paragraph({ text: `:` }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ text: ` ${penerimaInvoice}`, bold: true }),
                        new Paragraph({ text: ` ${alamatPenerima}` }),
                        new Paragraph({ text: ` ${teleponPenerima}` }),
                      ],
                      width: { size: 30, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ text: `No. Inv.`, alignment: AlignmentType.RIGHT }),
                        new Paragraph({ text: `Tanggal Inv.`, alignment: AlignmentType.RIGHT }),
                        new Paragraph({ text: `Jatuh Tempo `, alignment: AlignmentType.RIGHT }),
                      ],
                      width: { size: 20, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ text: `: `, alignment: AlignmentType.RIGHT }),
                        new Paragraph({ text: `: `, alignment: AlignmentType.RIGHT }),
                        new Paragraph({ text: `: `, alignment: AlignmentType.RIGHT }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ text: `${nomorInvoice}`, alignment: AlignmentType.RIGHT }),
                        new Paragraph({ text: `${tanggalInvoice}`, alignment: AlignmentType.RIGHT }),
                        new Paragraph({ text: `${jatuhTempo.toLocaleDateString("id-ID")}`, alignment: AlignmentType.RIGHT }),
                      ],
                      width: { size: 25, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
              ],
            }),
            //
            new Paragraph({ text: "", spacing: { after: 200 } }), // Spasi
  
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: "Jenis Barang",
                          alignment: AlignmentType.CENTER,
                          heading: HeadingLevel.HEADING_3,
                        }),
                      ],
                      shading: { fill: "4A90E2" }, // Warna biru
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: "Jumlah",
                          alignment: AlignmentType.CENTER,
                          heading: HeadingLevel.HEADING_3,
                        }),
                      ],
                      shading: { fill: "4A90E2" },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: "Set Harga",
                          alignment: AlignmentType.CENTER,
                          heading: HeadingLevel.HEADING_3,
                        }),
                      ],
                      shading: { fill: "4A90E2" },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: "Harga Sewa",
                          alignment: AlignmentType.CENTER,
                          heading: HeadingLevel.HEADING_3,
                        }),
                      ],
                      shading: { fill: "4A90E2" },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: "PPN",
                          alignment: AlignmentType.CENTER,
                          heading: HeadingLevel.HEADING_3,
                        }),
                      ],
                      shading: { fill: "4A90E2" },
                    }),
                  ],
                }),
                ...Object.entries(dataPT[selectedPT] || {}).map(([jenis, data]) => {
                  const setHarga = hargaAset[`${selectedPT}-${jenis}`] || 0;
                  const hargaSewa = data.jumlah * setHarga;
                  const ppn = hargaSewa * (12 * ((11 / 12) * 0.01));
  
                  return new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(jenis)] }),
                      new TableCell({ children: [new Paragraph(data.jumlah.toString())] }),
                      new TableCell({ children: [new Paragraph(`Rp ${setHarga.toLocaleString()}`)] }),
                      new TableCell({ children: [new Paragraph(`Rp ${hargaSewa.toLocaleString()}`)] }),
                      new TableCell({ children: [new Paragraph(`Rp ${ppn.toLocaleString()}`)] }),
                    ],
                  });
                }),
                // Tambahkan total di akhir tabel
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Total Harga Sewa")], columnSpan: 3 }),
                    new TableCell({
                      children: [
                        new Paragraph(`Rp ${calculateTotals(selectedPT).totalHargaSewa.toLocaleString()}`),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Total PPN")], columnSpan: 3 }),
                    new TableCell({
                      children: [
                        new Paragraph(`Rp ${calculateTotals(selectedPT).totalPPN.toLocaleString()}`),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("PPH 23 (2%)")], columnSpan: 3 }),
                    new TableCell({
                      children: [
                        new Paragraph(`Rp ${calculateTotals(selectedPT).totalPPH.toLocaleString()}`),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Total Harga Final")], columnSpan: 3 }),
                    new TableCell({
                      children: [
                        new Paragraph(`Rp ${calculateTotals(selectedPT).totalFinal.toLocaleString()}`),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new Paragraph({ text: "", spacing: { after: 200 } }), // Spasi

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE }, // Lebar otomatis
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: "BANK: BCA – KCP KUSUMANEGARA, YK",
                          alignment: AlignmentType.LEFT,
                        }),
                        new Paragraph({
                          text: "ATAS NAMA: ANUGERAH MITRA INTEGRASI",
                          alignment: AlignmentType.LEFT,
                        }),
                        new Paragraph({
                          text: "NO. REKENING: 8455821821",
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: `Yogyakarta, ${tanggalInvoice}`,
                          alignment: AlignmentType.RIGHT,
                        }),
                        new Paragraph({
                          text: "PT ANUGERAH MITRA INTEGRASI",
                          alignment: AlignmentType.RIGHT,
                        }),
                        new Paragraph({ text: "", spacing: { after: 300 } }), // Spasi
              
                        new Paragraph({
                          text: "FRIZA LIBI EL BERID, S.T.",
                          bold: true,
                          alignment: AlignmentType.RIGHT,
                        }),
                        new Paragraph({
                          text: "DIREKTUR",
                          alignment: AlignmentType.RIGHT,
                        }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
              ],
            }),
            
          ],
        },
      ],
    });
  
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `Invoice_${selectedPT}.docx`);
    });
  };
  

  return (
    <div className="flex min-h-screen font-sans">
      <Sidebar isAdmin />
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Invoice Per PT</h1>

        {/* Dropdown Pilih PT */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Pilih Status PT:</label>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedPT}
            onChange={(e) => setSelectedPT(e.target.value)}
          >
            <option value="">Pilih PT</option>
            {Object.keys(dataPT).map((pt) => (
              <option key={pt} value={pt}>
                {pt}
              </option>
            ))}
          </select>
        </div>

        {selectedPT && (
          <div className="overflow-x-auto">
            
            <table className="w-full border-collapse bg-white shadow-md rounded-md overflow-hidden">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="border p-3">Jenis Barang</th>
                  <th className="border p-3">Jumlah</th>
                  <th className="border p-3">Set Harga</th>
                  <th className="border p-3">Harga Sewa</th>
                  <th className="border p-3">PPN</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(dataPT[selectedPT] || {}).map(([jenis, data]) => {
                  const setHarga = hargaAset[`${selectedPT}-${jenis}`] || 0;
                  const hargaSewa = data.jumlah * setHarga;
                  const ppn = hargaSewa * (12 * ((11 / 12) * 0.01));

                  return (
                    <tr key={`${selectedPT}-${jenis}`} className="border">
                      <td className="border p-3">{jenis}</td>
                      <td className="border p-3">{data.jumlah}</td>
                      <td className="border p-3">Rp {setHarga.toLocaleString()}</td>
                      <td className="border p-3">Rp {hargaSewa.toLocaleString()}</td>
                      <td className="border p-3">Rp {ppn.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-200">
                <tr>
                  <td colSpan="3" className="border p-3 font-bold">Total Harga Sewa</td>
                  <td colSpan="2" className="border p-3 font-bold">
                    Rp {calculateTotals(selectedPT).totalHargaSewa.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td colSpan="3" className="border p-3 font-bold">Total PPN</td>
                  <td colSpan="2" className="border p-3 font-bold">
                    Rp {calculateTotals(selectedPT).totalPPN.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td colSpan="3" className="border p-3 font-bold">PPH 23 (2%)</td>
                  <td colSpan="2" className="border p-3 font-bold">
                    Rp {calculateTotals(selectedPT).totalPPH.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-green-500 text-white">
                  <td colSpan="3" className="border p-3 font-bold">Total Harga Final</td>
                  <td colSpan="2" className="border p-3 font-bold">
                    Rp {calculateTotals(selectedPT).totalFinal.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
            <button
  onClick={exportToWord}
  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
>
  Export ke Word
</button>

          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default InvoicePage;
