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
      let namaPembayar = "Hamba Allah";
      let keteranganTambahan = orderId;

      // ✨ 1. SIAPKAN 2 ALAMAT GOOGLE SHEETS BERBEDA
      // Masukkan URL Google Sheets lama Anda di sini
      const GOOGLE_SHEET_URL_ZAKAT =
        "https://script.google.com/macros/s/AKfycbwEcV1fRA0xe_pCHd0lnEZGI5rbYZfXGw-LtKnX-xdRSV7lAPZbnIeYOrRWWOXl3hg/exec";

      // Masukkan URL Google Sheets SPP yang BARU di sini
      const GOOGLE_SHEET_URL_SPP =
        "https://script.google.com/macros/s/AKfycbwevzDVjL_8pG-FRntzXxDDfhJdAM622flsKDpEDwv08wD97rwotvYqeIvauRiRtUs3IQ/exec";

      // Variabel untuk menentukan tujuan pengiriman
      let targetSheetUrl = "";

      // ==========================================
      // 2. UPDATE DATABASE & PILIH TUJUAN SHEETS
      // ==========================================
      if (orderId.startsWith("ZAKAT-")) {
        const trx = await prisma.zakatTransaction.update({
          where: { id: orderId.replace("ZAKAT-", "") },
          data: { status: "SUCCESS" },
        });

        namaPembayar = trx.name || "Hamba Allah";
        keteranganTambahan = trx.zakatType; // Menampilkan jenis zakatnya
        targetSheetUrl = GOOGLE_SHEET_URL_ZAKAT; // Arahkan ke Sheets Zakat
      } else if (orderId.startsWith("SPP-")) {
        const trx = await prisma.sppTransaction.update({
          where: { id: orderId.replace("SPP-", "") },
          data: { status: "SUCCESS" },
        });

        namaPembayar = trx.studentName || "Siswa SPP";
        keteranganTambahan = `Bulan: ${trx.paymentMonth}`; // Menampilkan bulan tagihan
        targetSheetUrl = GOOGLE_SHEET_URL_SPP; // Arahkan ke Sheets SPP
      }

      // ==========================================
      // 3. KIRIM DATA KE GOOGLE SHEETS TERPILIH
      // ==========================================
      const dataExcel = {
        tanggal: new Date().toLocaleString("id-ID"),
        nama: namaPembayar,
        jenis: orderId.startsWith("ZAKAT-") ? "Zakat" : "SPP",
        keterangan: keteranganTambahan, // Jauh lebih rapi untuk dibaca Admin!
        nominal: `Rp ${parseInt(grossAmount).toLocaleString("id-ID")}`,
        status: "SUCCESS",
      };

      console.log(`🚨 Mengirim data ke Sheets ${dataExcel.jenis}...`);

      if (targetSheetUrl !== "") {
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
