import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const isLoggedIn = cookieStore.get("isLoggedIn");

    if (!isLoggedIn) {
      return NextResponse.json({ message: "Akses Ditolak" }, { status: 401 });
    }

    // ✨ Perbedaannya hanya di sini: Mengambil dari sppTransaction ✨
    const transactions = await prisma.sppTransaction.findMany({
      where: {
        status: {
          in: [
            "SUCCESS",
            "success",
            "PAID",
            "paid",
            "settlement",
            "Settlement",
          ],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data: transactions }, { status: 200 });
  } catch (error) {
    console.error("Error Export API SPP:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
