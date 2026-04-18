import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose"; // 1. Tambahkan import ini
import { cookies } from "next/headers"; // 2. Tambahkan import ini

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    const user = await prisma.user.findUnique({ where: { email: email } });

    if (!user) {
      return NextResponse.json(
        { message: "Akun tidak ditemukan." },
        { status: 404 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Kata sandi salah!" },
        { status: 401 },
      );
    }

    if (role === "admin" && user.role !== "admin") {
      return NextResponse.json({ message: "Akses ditolak!" }, { status: 403 });
    }

    // =========================================================
    // ✨ PERUBAHAN BARU: MEMBUAT TOKEN DAN MENYIMPANNYA DI COOKIE
    // =========================================================

    // a. Buat Kunci Rahasia (Ambil dari .env)
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "rahasia_kunci_zakat_123",
    );

    // b. Buat Token (Karcis yang berlaku 1 hari)
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(secret);

    // c. Masukkan Token ke Cookie Browser (HttpOnly agar tidak bisa dicuri hacker)
    cookies().set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Wajib HTTPS saat di Vercel
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // Umur cookie: 1 hari (dalam detik)
      path: "/",
    });

    // =========================================================

    // =========================================================

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
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
