import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// ==========================================
// ✨ 1. GET: MENGAMBIL DATA TRANSAKSI ZAKAT
// ==========================================
export async function GET() {
  try {
    const cookieStore = cookies();
    const isLoggedIn = cookieStore.get("isLoggedIn");

    if (!isLoggedIn) {
      return NextResponse.json({ message: "Akses Ditolak" }, { status: 401 });
    }

    const transactions = await prisma.zakatTransaction.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Kirim datanya kembali dalam format JSON
    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error) {
    console.error("Error ambil data transaksi:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

// ==========================================
// ✨ 2. PATCH: UPDATE STATUS JADI LUNAS (TUNAI)
// ==========================================
export async function PATCH(request) {
  try {
    // Tetap gunakan sistem keamanan Cookie Anda
    const cookieStore = cookies();
    const isLoggedIn = cookieStore.get("isLoggedIn");

    if (!isLoggedIn) {
      return NextResponse.json({ message: "Akses Ditolak" }, { status: 401 });
    }

    // Tangkap data yang dikirim dari tombol "Terima Tunai"
    const body = await request.json();
    const { id, type } = body;

    if (!id || !type) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    // Eksekusi update database sesuai tipe transaksinya
    if (type === "SPP") {
      await prisma.sppTransaction.update({
        where: { id: id },
        data: { status: "settlement" }, // Ubah jadi lunas
      });
    } else if (type === "ZAKAT") {
      await prisma.zakatTransaction.update({
        where: { id: id },
        data: { status: "settlement" }, // Ubah jadi lunas
      });
    }

    return NextResponse.json(
      { message: "Berhasil disahkan Lunas!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error update status tunai:", error);
    return NextResponse.json(
      { message: "Gagal mengesahkan transaksi" },
      { status: 500 },
    );
  }
}
