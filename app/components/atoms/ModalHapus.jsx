"use client";
import React from "react";

const ModalHapus = ({ isOpen, onClose, onConfirm, pesan }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
          Konfirmasi
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          {pesan ||
            "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white font-semibold py-2.5 rounded-lg hover:bg-red-700 transition shadow-sm hover:shadow-md"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalHapus;
