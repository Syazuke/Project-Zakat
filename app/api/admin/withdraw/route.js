import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    // Simpan data penarikan ke database
    const tarikDana = await prisma.withdrawal.create({
      data: {
        amount: Number(body.amount),
        source: body.source, // "ZAKAT" atau "SPP"
        note: body.note || "-",
        withdrawnBy: body.adminName || "Admin",
      },
    });

    return NextResponse.json(
      { success: true, data: tarikDana },
      { status: 200 },
    );
  } catch (error) {
    console.error("Gagal mencatat penyaluran:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
