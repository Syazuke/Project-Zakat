import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";

export async function POST(request) {
  try {
    const data = await request.json();

    // Status pembayaran dari Midtrans
    const transactionStatus = data.transaction_status;
    const orderId = data.order_id;
    const grossAmount = data.gross_amount;

    if (transactionStatus === "settlement" || transactionStatus === "capture") {
      // ✨ 1. SIAPKAN 2 ALAMAT GOOGLE SHEETS BERBEDA
      const GOOGLE_SHEET_URL_ZAKAT =
        "https://script.google.com/macros/s/AKfycbwEcV1fRA0xe_pCHd0lnEZGI5rbYZfXGw-LtKnX-xdRSV7lAPZbnIeYOrRWWOXl3hg/exec";

      const GOOGLE_SHEET_URL_SPP =
        "https://script.google.com/macros/s/AKfycbwevzDVjL_8pG-FRntzXxDDfhJdAM622flsKDpEDwv08wD97rwotvYqeIvauRiRtUs3IQ/exec";

      // Variabel untuk menentukan tujuan pengiriman
      let targetSheetUrl = "";
      let dataExcel;

      // ==========================================
      // 2. UPDATE DATABASE & PILIH TUJUAN SHEETS
      // ==========================================
      if (orderId.startsWith("ZAKAT-")) {
        const trx = await prisma.zakatTransaction.update({
          where: { id: orderId.replace("ZAKAT-", "") },
          data: { status: "SUCCESS" },
        });

        // 📦 PAKET DATA KHUSUS ZAKAT
        dataExcel = {
          tanggal: new Date().toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta",
          }),
          nama: trx.name || "Hamba Allah",
          jenis: `Zakat ${trx.zakatType}`,
          tagihan: "-", // ✨ TAMBAHAN: Zakat tidak ada tagihan, kita isi strip agar rapi
          keterangan: trx.message || "-", // ✨ Menangkap keterangan/pesan
          nominal: `Rp ${parseInt(grossAmount).toLocaleString("id-ID")}`,
          status: "SUCCESS",
        };
        targetSheetUrl = GOOGLE_SHEET_URL_ZAKAT;
      } else if (orderId.startsWith("SPP-")) {
        const trx = await prisma.sppTransaction.update({
          where: { id: orderId.replace("SPP-", "") },
          data: { status: "SUCCESS" },
        });

        // 📦 PAKET DATA KHUSUS SPP
        dataExcel = {
          tanggal: new Date().toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta",
          }),
          nama: trx.studentName,
          jenis: trx.sppType,
          tagihan: `Bulan: ${trx.paymentMonth}`, // ✨ Menangkap bulan tagihan
          keterangan: trx.message || "-", // ✨ Menangkap keterangan
          nominal: `Rp ${parseInt(grossAmount).toLocaleString("id-ID")}`,
        };
        targetSheetUrl = GOOGLE_SHEET_URL_SPP;
      }

      // ==========================================
      // 3. EKSEKUSI PENGIRIMAN KE GOOGLE SHEETS
      // ==========================================
      if (targetSheetUrl !== "" && dataExcel) {
        console.log(`🚨 Mengirim data ke Sheets ${dataExcel.jenis}...`);

        await fetch(targetSheetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify(dataExcel),
        })
          .then((res) => res.text())
          .then((text) => console.log("✅ Balasan dari Sheets:", text))
          .catch((err) => console.error("❌ Gagal kirim ke Sheets:", err));
      }
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
