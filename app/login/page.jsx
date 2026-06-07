"use client";

import { ArrowLeft, Eye, EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(`Gagal Masuk: ${data.message}`);
        setIsLoading(false);
        return;
      }
      toast.success(`Selamat datang!`);
      localStorage.setItem("isLoggedIn", "true");
      document.cookie =
        "isLoggedIn=true; path=/; max-age=86400; Secure; SameSite=Strict";
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1000);
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan. Silakan coba lagi.");
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col justify-center items-center p-4 font-sans text-gray-800">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            fontWeight: "bold",
          },
        }}
      />
      <a
        href="/"
        className="absolute top-[5%] left-6 flex items-center text-emerald-700 hover:text-emerald-900 transition font-medium"
      >
        <ArrowLeft />
        Kembali ke Beranda
      </a>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-gray-900">
              Selamat Datang Kembali!
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Silakan masuk ke akun Anda untuk melanjutkan.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
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
                  {showPassword ? <Eye /> : <EyeClosed />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 text-white font-bold text-lg py-3 rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition transform hover:-translate-y-0.5 mt-4"
            >
              {isLoading ? "Memprosess..." : "Masuk sekarang"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
