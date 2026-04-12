import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    // 1. Cari pengguna berdasarkan email di database
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Akun tidak ditemukan. Silakan daftar terlebih dahulu." },
        { status: 404 },
      );
    }

    // 2. Cek apakah kata sandi cocok
    // CATATAN: Ini membandingkan teks biasa (karena kita sedang belajar).
    // Di aplikasi nyata, Anda harus menggunakan bcrypt.compare()
    if (user.password !== password) {
      return NextResponse.json(
        { message: "Kata sandi yang Anda masukkan salah!" },
        { status: 401 },
      );
    }

    // 3. Cek apakah Peran (Role) sesuai
    // Jika ada yang mencoba login ke tab Admin, tapi rolenya di database bukan admin
    if (role === "admin" && user.role !== "admin") {
      return NextResponse.json(
        { message: "Akses ditolak! Anda tidak memiliki izin sebagai Admin." },
        { status: 403 },
      );
    }

    // 4. Jika semua benar, kembalikan data user (TIDAK BOLEH mengirim ulang password ke frontend)
    return NextResponse.json(
      {
        message: "Login berhasil!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error Login:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
