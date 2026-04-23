import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";

export async function POST(request) {
  try {
    const data = await request.json();

    // Status pembayaran dari Midtrans
    const transactionStatus = data.transaction_status;
    const orderId = data.order_id; // Contoh: ZAKAT-clnx... atau SPP-clnx...
    const grossAmount = data.gross_amount; // Nominal pembayaran

    // Jika pembayaran sukses
    if (transactionStatus === "settlement" || transactionStatus === "capture") {
      // ✨ KITA SIAPKAN VARIABEL KOSONG UNTUK MENAMPUNG NAMA
      let namaPembayar = "Hamba Allah";

      // ==========================================
      // 1. UPDATE DATABASE PRISMA & AMBIL NAMANYA
      // ==========================================
      if (orderId.startsWith("ZAKAT-")) {
        // Simpan hasil update ke dalam variabel 'trx'
        const trx = await prisma.zakatTransaction.update({
          where: { id: orderId.replace("ZAKAT-", "") },
          data: { status: "SUCCESS" },
        });
        // Ambil nama dari database (fallback ke Hamba Allah jika kosong)
        namaPembayar = trx.name || "Hamba Allah";
      } else if (orderId.startsWith("SPP-")) {
        // Simpan hasil update ke dalam variabel 'trx'
        const trx = await prisma.sppTransaction.update({
          where: { id: orderId.replace("SPP-", "") },
          data: { status: "SUCCESS" },
        });
        // Ambil nama siswa dari database
        namaPembayar = trx.studentName || "Siswa SPP";
      }

      // ==========================================
      // ✨ 2. KIRIM DATA KE GOOGLE SHEETS SECARA REAL-TIME ✨
      // ==========================================
      const GOOGLE_SHEET_URL =
        "https://script.google.com/macros/s/AKfycbwEcV1fRA0xe_pCHd0lnEZGI5rbYZfXGw-LtKnX-xdRSV7lAPZbnIeYOrRWWOXl3hg/exec";

      // Siapkan paket data yang akan ditulis di kolom Excel
      const dataExcel = {
        tanggal: new Date().toLocaleString("id-ID"),
        nama: namaPembayar, // 🎯 SEKARANG MENGGUNAKAN NAMA ASLI DARI DATABASE
        jenis: orderId.startsWith("ZAKAT-") ? "Zakat" : "SPP",
        keterangan: orderId,
        nominal: `Rp ${parseInt(grossAmount).toLocaleString("id-ID")}`,
        status: "SUCCESS",
      };

      console.log("🚨 Mengirim data ke Google Sheets...", dataExcel);

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
