import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";

export async function DELETE(request) {
  try {
    const satuBulanLalu = new Date();
    satuBulanLalu.setMonth(satuBulanLalu.getMonth() - 1);

    // 🚨 PENTING: Ganti 'sppTransaction' dengan nama tabel SPP di schema.prisma Anda!
    const hasil = await prisma.sppTransaction.deleteMany({
      where: {
        createdAt: {
          lt: satuBulanLalu,
        },
      },
    });

    return NextResponse.json(
      { message: `${hasil.count} data SPP lama berhasil dibersihkan!` },
      { status: 200 },
    );
  } catch (error) {
    console.error("Gagal Bersihkan Data SPP:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
