import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";

export async function DELETE(request, { params }) {
  try {
    const id = params.id; // Sekarang berupa Teks/String (cuid)

    await prisma.sppTransaction.delete({
      where: {
        id: id, // ✨ PERUBAHAN DI SINI: Tidak lagi menggunakan parseInt(id)
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
