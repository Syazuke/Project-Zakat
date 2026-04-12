import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

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
