import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";

export async function DELETE(request, { params }) {
  try {
    const id = params.id;

    // PENTING: Ganti 'transaction' dengan nama tabel asli Anda di schema.prisma
    await prisma.ZakatTransaction.delete({
      where: { id: id },
    });

    return NextResponse.json(
      { message: "Data berhasil dihapus" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Gagal Hapus:", error);
    return NextResponse.json(
      { message: "Gagal menghapus data" },
      { status: 500 },
    );
  }
}
