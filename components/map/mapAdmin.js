"use client";

import { useState } from "react";
import Sidebar from "/components/Sidebar";

export default function MapWithButtons() {
  // State untuk menyimpan peta yang sedang aktif
  const [activeMap, setActiveMap] = useState(0);

  // Data peta, termasuk tooltip untuk setiap titik
  const maps = [
    {
      id: 0,
      src: "/petaA.jpg",
      name: "Peta A",
      points: [
        // { top: "30%", left: "40%", label: "Informasi Peta A - Titik 1" },
        // { top: "50%", left: "60%", label: "Informasi Peta A - Titik 2" },
      ],
    },
    {
      id: 1,
      src: "/petaB.jpg",
      name: "Peta B",
      points: [
        // { top: "20%", left: "50%", label: "Informasi Peta B - Titik 1" },
        // { top: "60%", left: "70%", label: "Informasi Peta B - Titik 2" },
      ],
    },
    {
      id: 2,
      src: "/petaC.jpg",
      name: "Peta C",
      points: [
        // { top: "40%", left: "30%", label: "Informasi Peta C - Titik 1" },
        // { top: "70%", left: "50%", label: "Informasi Peta C - Titik 2" },
      ],
    },
    {
        id: 3,
        src: "/petaD.jpg",
        name: "Peta D",
        points: [
          // { top: "40%", left: "30%", label: "Informasi Peta C - Titik 1" },
          // { top: "70%", left: "50%", label: "Informasi Peta C - Titik 2" },
        ],
      },
  ];

  return (
    <div className="flex min-h-screen font-sans">
      <Sidebar isAdmin />
      <div className="flex flex-col w-full h-screen p-4">
        {/* Tombol pemilihan peta */}
        <div className="flex justify-center mb-4 bg-gray-200 p-2 rounded shadow">
          {maps.map((map) => (
            <button
              key={map.id}
              onClick={() => setActiveMap(map.id)}
              className={`mx-2 px-4 py-2 rounded-lg ${
                activeMap === map.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            >
              {map.name}
            </button>
          ))}
        </div>

        {/* Box peta */}
        <div className="relative mx-auto w-[80%] h-[80%] border rounded-lg overflow-hidden shadow-lg">
          {/* Gambar Peta */}
          <img
            src={maps[activeMap].src}
            alt={maps[activeMap].name}
            className="w-full h-full object-cover"
          />

          {/* Titik-titik interaktif dengan tooltip */}
          {maps[activeMap].points.map((point, index) => (
            <div
              key={index}
              className="absolute group"
              style={{ top: point.top, left: point.left }}
            >
              <button className="bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-600">
                Titik {index + 1}
              </button>
              <div className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-sm p-2 rounded">
                {point.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
