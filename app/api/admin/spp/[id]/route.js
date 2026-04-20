import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";

export async function DELETE(request, { params }) {
  try {
    const id = params.id;

    // 🚨 PENTING: Ganti 'sppTransaction' dengan nama tabel SPP di schema.prisma Anda!
    await prisma.sppTransaction.delete({
      where: {
        id: parseInt(id), // Asumsi ID berupa angka (Int)
      },
    });

    return NextResponse.json(
      { message: "Data SPP berhasil dihapus" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Gagal Hapus SPP:", error);
    return NextResponse.json(
      { message: "Gagal menghapus data SPP" },
      { status: 500 },
    );
  }
}
