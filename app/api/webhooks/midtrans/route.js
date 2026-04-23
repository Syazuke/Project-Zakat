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
      const GOOGLE_SHEET_URL =
        "https://script.google.com/macros/s/AKfycbwEcV1fRA0xe_pCHd0lnEZGI5rbYZfXGw-LtKnX-xdRSV7lAPZbnIeYOrRWWOXl3hg/exec";

      // Siapkan paket data yang akan ditulis di kolom Excel
      const dataExcel = {
        tanggal: new Date().toLocaleString("id-ID"),
        nama: orderId.startsWith("ZAKAT-") ? "Muzakki" : "Siswa SPP",
        jenis: orderId.startsWith("ZAKAT-") ? "Zakat" : "SPP",
        keterangan: orderId,
        nominal: `Rp ${parseInt(grossAmount).toLocaleString("id-ID")}`,
        status: "SUCCESS",
      };

      console.log("🚨 Mengirim data ke Google Sheets...");

      // ✨ PERBAIKAN FATAL: Tambahkan 'await' agar Vercel mau menunggu proses ini selesai
      await fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(dataExcel),
      })
        .then((res) => res.text())
        .then((text) => console.log("✅ Balasan dari Sheets:", text))
        .catch((err) => console.error("❌ Gagal kirim ke Sheets:", err));
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

    // Pastikan response ini dipanggil paling akhir
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
