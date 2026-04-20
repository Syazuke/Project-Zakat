import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";

export async function DELETE(request) {
  try {
    // 1. Dapatkan tanggal persis 1 bulan yang lalu dari hari ini
    const satuBulanLalu = new Date();
    satuBulanLalu.setMonth(satuBulanLalu.getMonth() - 1);

    // 2. Hapus semua data yang tanggal buatnya (createdAt) LEBIH KECIL (lt) dari satuBulanLalu
    // PENTING: Ganti 'transaction' dengan nama tabel asli Anda
    const hasil = await prisma.ZakatTransaction.deleteMany({
      where: {
        createdAt: {
          lt: satuBulanLalu,
        },
      },
    });

    return NextResponse.json(
      { message: `${hasil.count} data lama berhasil dibersihkan!` },
      { status: 200 },
    );
  } catch (error) {
    console.error("Gagal Bersihkan Data:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
