import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// ========================================================
// 1. FUNGSI GET: Untuk mengambil data ke tabel Dashboard
// ========================================================
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
      take: 50, // Mengambil 50 data terbaru agar tidak berat
    });

    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error) {
    console.error("Error ambil data transaksi:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

// ========================================================
// 2. FUNGSI PATCH: Untuk mengonfirmasi "LUNAS" & kirim ke Sheets
// ========================================================
export async function PATCH(request) {
  try {
    const cookieStore = cookies();
    const isLoggedIn = cookieStore.get("isLoggedIn");

    if (!isLoggedIn) {
      return NextResponse.json({ message: "Akses Ditolak" }, { status: 401 });
    }

    const body = await request.json();
    const { id, type } = body;

    if (!id || !type) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    const GOOGLE_SHEET_URL_ZAKAT_MASUK =
      "https://script.google.com/macros/s/AKfycbwEcV1fRA0xe_pCHd0lnEZGI5rbYZfXGw-LtKnX-xdRSV7lAPZbnIeYOrRWWOXl3hg/exec";
    const GOOGLE_SHEET_URL_SPP_MASUK =
      "https://script.google.com/macros/s/AKfycbwRabFBQg5xrhmG6wwdUrorCd2jAAMNAR2Tfi4ew7HSFnJ8F4QOoi_Se5-lrpugCGlJFw/exec";
    const GOOGLE_SHEET_URL_INFAQ_MASUK =
      "https://script.google.com/macros/s/AKfycbwn4GyHoVPSyIeyxUz1kfWLD6yBC-Aw86c-P23uQ-V53RQLgfMXX3tgjLJal1RPzqvjCQ/exec";

    if (type === "SPP") {
      const oldSpp = await prisma.sppTransaction.findUnique({
        where: { id: id },
      });
      const metodePembayaran =
        oldSpp.status === "PENDING_TUNAI" ? "Tunai/Cash" : "Transfer";

      const trx = await prisma.sppTransaction.update({
        where: { id: id },
        data: { status: "PAID" },
      });

      const dataExcel = {
        tanggal: new Date().toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        }),
        nama: trx.studentName,
        jenis: trx.sppType,
        tagihan: trx.paymentMonth,
        metode: metodePembayaran,
        keterangan: trx.message || "-",
        nominal: `Rp ${trx.amount.toLocaleString("id-ID")}`,
        status: "LUNAS",
      };

      await fetch(GOOGLE_SHEET_URL_SPP_MASUK, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(dataExcel),
      }).catch((err) => console.error("Gagal kirim ke Sheets SPP:", err));
    } else if (type === "ZAKAT") {
      const trx = await prisma.zakatTransaction.update({
        where: { id: id },
        data: { status: "PAID" },
      });

      const dataExcel = {
        tanggal: new Date().toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        }),
        nama: trx.name || "Hamba Allah",
        jenis: `${trx.zakatType}`,
        metode: trx.paymentMethod,
        keterangan: trx.message || "-",
        nominal: `Rp ${trx.amount.toLocaleString("id-ID")}`,
        status: "LUNAS",
      };

      let targetSheetUrl = GOOGLE_SHEET_URL_ZAKAT_MASUK;
      if (trx.zakatType === "sedekah") {
        targetSheetUrl = GOOGLE_SHEET_URL_INFAQ_MASUK;
      }

      await fetch(targetSheetUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(dataExcel),
      }).catch((err) => console.error("Gagal kirim ke Sheets:", err));
    }

    return NextResponse.json(
      { message: "Berhasil disahkan Lunas!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error update status:", error);
    return NextResponse.json(
      { message: "Gagal mengesahkan transaksi" },
      { status: 500 },
    );
  }
}
