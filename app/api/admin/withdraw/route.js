import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    const tarikDana = await prisma.withdrawal.create({
      data: {
        amount: Number(body.amount),
        source: body.source,
        note: body.note || "-",
        withdrawnBy: body.adminName || "Admin",
      },
    });

    const GOOGLE_SHEET_URL_PENGELUARAN_ZAKAT =
      "https://script.google.com/macros/s/AKfycbzHCk91RUfzJrfNraJnKpSOHvhq7Dcw6CyT25jeGEcpeAQN7z6DFWM9HzsRXdTVd37P/exec";

    const GOOGLE_SHEET_URL_PENGELUARAN_SPP =
      "https://script.google.com/macros/s/AKfycbx6_wiu_f2n0jevc1iJk_cLtO8tw3nPQRbbRnq1vcGe1kpMlbPD4f3PVOFpy00DupJQ/exec";

    const targetUrl =
      body.source === "ZAKAT"
        ? GOOGLE_SHEET_URL_PENGELUARAN_ZAKAT
        : GOOGLE_SHEET_URL_PENGELUARAN_SPP;

    const dataExcel = {
      tanggal: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
      sumber: body.source === "ZAKAT" ? "KAS ZAKAT" : "KAS SPP",
      nominal: Number(body.amount),
      keterangan: body.note || "-",
    };

    fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(dataExcel),
    }).catch((err) =>
      console.error(`Gagal kirim ke Laporan Pengeluaran ${body.source}:`, err),
    );

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
