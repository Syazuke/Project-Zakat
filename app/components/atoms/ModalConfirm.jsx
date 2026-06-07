"use client";
import React from "react";

const ModalHapus = ({ isOpen, onClose, onConfirm, pesan, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100">
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
          Warning!
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          {pesan ||
            "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`flex-1 font-semibold py-2.5 rounded-lg transition ${
              isLoading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 font-semibold py-2.5 rounded-lg transition shadow-sm ${
              isLoading
                ? "bg-red-400 text-white cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700 hover:shadow-md"
            }`}
          >
            {isLoading ? "Memproses..." : "Accept"}{" "}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalHapus;
