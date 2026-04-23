"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState("user");

  // State untuk form input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Kirim data ke API Login
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          role: role,
        }),
      });

      const data = await response.json();

      // CEK STATUS: Jika ditolak (401, 404, 403, dll)
      if (!response.ok) {
        alert(`Gagal Masuk: ${data.message}`);
        return; // Hentikan eksekusi di sini! Jangan lanjut ke bawah.
      }

      // Jika berhasil (Status 200/OK), jalankan ini:
      alert(`Selamat datang, ${data.user.name}!`);

      // Simpan data sesi ke localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userName", data.user.name);

      // Catatan: Jika Anda sudah menggunakan HTTP-only cookies lewat JWT di backend,
      // baris document.cookie di bawah ini sebenarnya tidak perlu lagi (bahkan disarankan dihapus demi keamanan).
      // Tapi saya biarkan agar sesuai dengan desain Anda saat ini.
      document.cookie =
        "isLoggedIn=true; path=/; max-age=86400; Secure; SameSite=Strict";

      // Arahkan ke halaman yang sesuai
      if (data.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/"); // Lempar ke halaman Kalkulator Zakat
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan. Silakan coba lagi.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col justify-center items-center p-4 font-sans text-gray-800">
      {/* Tombol Kembali ke Beranda */}
      <a
        href="/"
        className="absolute top-6 left-6 flex items-center text-emerald-700 hover:text-emerald-900 transition font-medium"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Kembali ke Beranda
      </a>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
        {/* Header Logo */}
        <div className="bg-emerald-600 p-8 text-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold text-2xl mx-auto mb-3 shadow-inner">
            Z
          </div>
          <h2 className="text-2xl font-bold text-white">Yayasan Zakat</h2>
          <p className="text-emerald-100 text-sm mt-1">Mensucikan Harta Anda</p>
        </div>

        <div className="p-8">
          {/* Teks Sambutan */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-gray-900">
              Selamat Datang Kembali!
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Silakan masuk ke akun Anda untuk melanjutkan.
            </p>
          </div>

          {/* Tab Pilihan Role (User / Admin) */}
          <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                role === "admin"
                  ? "bg-white text-emerald-700 shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Amil (Admin)
            </button>
          </div>

          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Input Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh@email.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Input Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Kata Sandi
                </label>
                <a
                  href="#"
                  className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                >
                  Lupa Sandi?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-gray-50 focus:bg-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white font-bold text-lg py-3 rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition transform hover:-translate-y-0.5 mt-4"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
