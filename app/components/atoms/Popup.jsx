"use client";

import { Apple, Check, CheckCheck } from "lucide-react";

const PopUp = ({ isOpen, onClose, pesan, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl transform transition-all scale-100 animate-fade-in">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
          <Check className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 text-sm">{pesan}</p>
        <button
          onClick={onClose}
          className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition"
        >
          Tutup & Selesai
        </button>
      </div>
    </div>
  );
};

export default PopUp;
