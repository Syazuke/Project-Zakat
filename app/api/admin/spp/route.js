import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import { cookies } from "next/headers"; // 1. Tambahkan import untuk membaca cookie

// 2. Wajib ditambahkan agar Next.js selalu menarik data terbaru (tidak di-cache)
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 3. ✨ CEK KEAMANAN (SATPAM) ✨
    const cookieStore = cookies();
    const isLoggedIn = cookieStore.get("isLoggedIn");

    if (!isLoggedIn) {
      return NextResponse.json({ message: "Akses Ditolak" }, { status: 401 });
    }

    // 4. Tarik data SPP dari database
    const transactions = await prisma.sppTransaction.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Batasi 50 data terbaru agar layar tidak lemot / nge-lag
    });

    // Kirim data ke Dashboard
    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error) {
    console.error("Gagal memuat riwayat SPP:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
