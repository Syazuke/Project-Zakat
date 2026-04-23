import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";

export async function POST(request) {
  try {
    const data = await request.json();

    // Status pembayaran dari Midtrans
    const transactionStatus = data.transaction_status;
    const orderId = data.order_id; // Contoh: ZAKAT-clnx... atau SPP-clnx...
    const grossAmount = data.gross_amount; // Nominal pembayaran

    // Jika pembayaran sukses (settlement = sukses bayar, capture = sukses kartu kredit)
    if (transactionStatus === "settlement" || transactionStatus === "capture") {
      // ==========================================
      // 1. UPDATE DATABASE PRISMA ANDA
      // ==========================================
      // Pastikan Anda memisahkan logika apakah ini ID Zakat atau SPP
      if (orderId.startsWith("ZAKAT-")) {
        await prisma.zakatTransaction.update({
          where: { id: orderId.replace("ZAKAT-", "") },
          data: { status: "SUCCESS" },
        });
      } else if (orderId.startsWith("SPP-")) {
        await prisma.sppTransaction.update({
          where: { id: orderId.replace("SPP-", "") },
          data: { status: "SUCCESS" },
        });
      }

      // ==========================================
      // ✨ 2. KIRIM DATA KE GOOGLE SHEETS SECARA REAL-TIME ✨
      // ==========================================

      // 🚨 PASTE URL DARI GAMBAR ANDA KE DALAM TANDA KUTIP DI BAWAH INI:
      const GOOGLE_SHEET_URL =
        "https://script.google.com/macros/s/AKfycbzVGGkxEwi4KtQrs5NHR2dxuk-XPld9rq7gxZ2T45Obm_BwCd-PXuPOW2UvhOfu2VVr/exec";

      // Siapkan paket data yang akan ditulis di kolom Excel
      const dataExcel = {
        tanggal: new Date().toLocaleString("id-ID"),
        nama: orderId.startsWith("ZAKAT-") ? "Muzakki" : "Siswa SPP", // Idealnya ambil dari DB
        jenis: orderId.startsWith("ZAKAT-") ? "Zakat" : "SPP",
        keterangan: orderId, // Kita isi dengan Order ID sebagai referensi unik
        nominal: `Rp ${parseInt(grossAmount).toLocaleString("id-ID")}`,
        status: "SUCCESS",
      };

      // Tembakkan datanya ke Google Sheets tanpa membuat user menunggu
      fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(dataExcel),
      }).catch((err) => console.error("Gagal kirim ke Sheets:", err));
    } else if (
      transactionStatus === "expire" ||
      transactionStatus === "cancel"
    ) {
      // Logika jika pembayaran kadaluarsa atau dibatalkan
      if (orderId.startsWith("ZAKAT-")) {
        await prisma.zakatTransaction.update({
          where: { id: orderId.replace("ZAKAT-", "") },
          data: { status: "FAILED" },
        });
      } else if (orderId.startsWith("SPP-")) {
        await prisma.sppTransaction.update({
          where: { id: orderId.replace("SPP-", "") },
          data: { status: "FAILED" },
        });
      }
    }

    return NextResponse.json(
      { message: "Webhook berhasil diproses" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada Server" },
      { status: 500 },
    );
  }
}
