import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET(request) {
  try {
    // 1. Cek Karcis Satpam (Opsional tapi penting agar data tidak dicuri orang luar)
    const token = cookies().get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Akses Ditolak" }, { status: 401 });
    }

    // 2. Ambil data dari database (HANYA YANG SUKSES)
    // CATATAN: Ubah "PAID" menjadi "settlement" jika database Anda mencatat sukses dengan kata settlement
    const transactions = await prisma.ZakatTransaction.findMany({
      where: {
        status: {
          in: [
            "SUCCESS",
            "success",
            "PAID",
            "paid",
            "settlement",
            "Settlement",
          ],
        },
      },
      orderBy: {
        createdAt: "desc", // Urutkan dari yang terbaru
      },
    });

    // 3. Kirim datanya ke Frontend
    return NextResponse.json({ data: transactions }, { status: 200 });
  } catch (error) {
    console.error("Error Export API:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
