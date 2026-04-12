import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma"; // Sesuaikan path jika berbeda
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const cookieStore = cookies();
    const isLoggedIn = cookieStore.get("isLoggedIn");

    if (!isLoggedIn) {
      return NextResponse.json({ message: "Akses Ditolak" }, { status: 401 });
    }
    // 1. Menghitung Total Dana (Sudah ada sebelumnya)
    const resultDana = await prisma.zakatTransaction.aggregate({
      _sum: { amount: true },
      where: {
        status: "SUCCESS",
        createdAt: { gte: firstDayOfMonth },
      },
    });
    const totalAmount = resultDana._sum.amount || 0;

    // 2. TUGAS BARU: Menghitung Total Muzakki (Orang Unik yang sudah bayar bulan ini)
    // Kita gunakan 'distinct' agar nama yang sama tidak dihitung dua kali
    const muzakkiList = await prisma.zakatTransaction.findMany({
      where: {
        status: "SUCCESS",
        createdAt: { gte: firstDayOfMonth },
      },
      select: { name: true },
      distinct: ["name"],
    });
    const totalMuzakki = muzakkiList.length;

    // 3. TUGAS BARU: Menghitung Transaksi Menunggu Verifikasi (Status PENDING)
    const pendingCount = await prisma.zakatTransaction.count({
      where: { status: "PENDING" },
    });

    // Kirim ketiga data tersebut ke Dashboard
    return NextResponse.json(
      {
        totalZakat: totalAmount,
        totalMuzakki: totalMuzakki,
        pendingVerifikasi: pendingCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error ambil statistik:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}
