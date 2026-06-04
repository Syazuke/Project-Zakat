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

    const transactions = await prisma.zakatTransaction.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json({ data: transactions }, { status: 200 });
  } catch (error) {
    console.error("Error Get API Zakat:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
