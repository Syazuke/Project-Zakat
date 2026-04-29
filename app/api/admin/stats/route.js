import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
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

    // ========================================================
    // 1. HITUNG DATA ZAKAT
    // ========================================================
    const resultDanaZakat = await prisma.zakatTransaction.aggregate({
      _sum: { amount: true },
      where: {
        status: "SUCCESS",
        createdAt: { gte: firstDayOfMonth },
      },
    });
    const totalAmountZakat = resultDanaZakat._sum.amount || 0;

    const muzakkiList = await prisma.zakatTransaction.findMany({
      where: {
        status: "SUCCESS",
        createdAt: { gte: firstDayOfMonth },
      },
      select: { name: true },
      distinct: ["name"],
    });
    const totalMuzakkiZakat = muzakkiList.length;

    const pendingZakat = await prisma.zakatTransaction.count({
      where: { status: "PENDING" },
    });

    // ========================================================
    // 2. HITUNG DATA SPP
    // ========================================================
    const resultDanaSPP = await prisma.sppTransaction.aggregate({
      _sum: { amount: true },
      where: {
        status: "SUCCESS",
        createdAt: { gte: firstDayOfMonth },
      },
    });
    const totalAmountSPP = resultDanaSPP._sum.amount || 0;

    const siswaList = await prisma.sppTransaction.findMany({
      where: {
        status: "SUCCESS",
        createdAt: { gte: firstDayOfMonth },
      },
      select: { studentName: true },
      distinct: ["studentName"],
    });
    const totalSiswaSPP = siswaList.length;

    const pendingSPP = await prisma.sppTransaction.count({
      where: { status: "PENDING" },
    });

    // ========================================================
    // ✨ 3. HITUNG PENARIKAN (DIPISAH ZAKAT & SPP) ✨
    // ========================================================
    const resultPenarikanZakat = await prisma.withdrawal.aggregate({
      _sum: { amount: true },
      where: { source: "ZAKAT" }, // Tarik total pengeluaran khusus Zakat
    });
    const zakatDitarik = resultPenarikanZakat._sum.amount || 0;

    const resultPenarikanSPP = await prisma.withdrawal.aggregate({
      _sum: { amount: true },
      where: { source: "SPP" }, // Tarik total pengeluaran khusus SPP
    });
    const sppDitarik = resultPenarikanSPP._sum.amount || 0;

    // ========================================================
    // ✨ 4. KIRIM DATA KE DASHBOARD (SUDAH DIPISAH) ✨
    // ========================================================
    return NextResponse.json(
      {
        detailZakat: totalAmountZakat,
        zakatDitarik: zakatDitarik,
        detailSPP: totalAmountSPP,
        sppDitarik: sppDitarik,
        totalMuzakki: totalMuzakkiZakat + totalSiswaSPP,
        pendingVerifikasi: pendingZakat + pendingSPP,
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
