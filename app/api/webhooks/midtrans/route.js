import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";

export async function POST(request) {
  try {
    const data = await request.json();

    const transactionStatus = data.transaction_status;
    const orderId = data.order_id;
    const grossAmount = parseInt(data.gross_amount); // Pastikan jadi angka
    const paymentType = data.payment_type; // ✨ TANGKAP METODE PEMBAYARAN DARI MIDTRANS

    if (transactionStatus === "settlement" || transactionStatus === "capture") {
      const GOOGLE_SHEET_URL_ZAKAT =
        "https://script.google.com/macros/s/AKfycbwEcV1fRA0xe_pCHd0lnEZGI5rbYZfXGw-LtKnX-xdRSV7lAPZbnIeYOrRWWOXl3hg/exec";
      const GOOGLE_SHEET_URL_SPP =
        "https://script.google.com/macros/s/AKfycbwRabFBQg5xrhmG6wwdUrorCd2jAAMNAR2Tfi4ew7HSFnJ8F4QOoi_Se5-lrpugCGlJFw/exec";
      const GOOGLE_SHEET_URL_INFAQ =
        "https://script.google.com/macros/s/AKfycbwn4GyHoVPSyIeyxUz1kfWLD6yBC-Aw86c-P23uQ-V53RQLgfMXX3tgjLJal1RPzqvjCQ/exec";

      let biayaAdminGateway = 0;

      if (paymentType === "qris") {
        biayaAdminGateway = Math.floor(grossAmount * 0.007); // 0.7%
      } else if (paymentType === "gopay" || paymentType === "shopeepay") {
        biayaAdminGateway = Math.floor(grossAmount * 0.02); // 2%
      } else if (paymentType === "dana") {
        biayaAdminGateway = Math.floor(grossAmount * 0.015); // 1.5%
      } else {
        biayaAdminGateway = 4000;
      }

      const nominalBersihKeBank = grossAmount - biayaAdminGateway;

      let targetSheetUrl = "";
      let dataExcel;

      if (orderId.startsWith("ZAKAT-")) {
        const trx = await prisma.zakatTransaction.update({
          where: { id: orderId.replace("ZAKAT-", "") },
          data: { status: "SUCCESS" },
        });

        dataExcel = {
          tanggal: new Date().toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta",
          }),
          nama: trx.name || "Hamba Allah",
          jenis: `${trx.zakatType}`,
          keterangan: trx.message || "-",
          nominalKotor: `Rp ${grossAmount.toLocaleString("id-ID")}`,
          biayaAdmin: `- Rp ${biayaAdminGateway.toLocaleString("id-ID")}`,
          nominalBersih: `Rp ${nominalBersihKeBank.toLocaleString("id-ID")}`,
          status: `${trx.status} (${paymentType.toUpperCase()})`,
        };

        // ✨ PERBAIKAN LOGIKA PEMBAGIAN SHEET ZAKAT vs INFAQ ✨
        if (trx.zakatType === "sedekah") {
          targetSheetUrl = GOOGLE_SHEET_URL_INFAQ;
        } else {
          targetSheetUrl = GOOGLE_SHEET_URL_ZAKAT;
        }
      } else if (orderId.startsWith("SPP-")) {
        const trx = await prisma.sppTransaction.update({
          where: { id: orderId.replace("SPP-", "") },
          data: { status: "SUCCESS" },
        });

        dataExcel = {
          tanggal: new Date().toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta",
          }),
          nama: trx.studentName,
          jenis: trx.sppType,
          tagihan: `Bulan: ${trx.paymentMonth}`,
          keterangan: trx.message || "-",
          nominalKotor: `Rp ${grossAmount.toLocaleString("id-ID")}`,
          biayaAdmin: `- Rp ${biayaAdminGateway.toLocaleString("id-ID")}`,
          nominalBersih: `Rp ${nominalBersihKeBank.toLocaleString("id-ID")}`,
          status: `${trx.status} (${paymentType.toUpperCase()})`,
        };
        targetSheetUrl = GOOGLE_SHEET_URL_SPP;
      }

      if (targetSheetUrl !== "" && dataExcel) {
        await fetch(targetSheetUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(dataExcel),
        }).catch((err) => console.error("❌ Gagal kirim ke Sheets:", err));
      }
    } else if (
      transactionStatus === "expire" ||
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "failure"
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

    return NextResponse.json({ message: "Webhook diproses" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error Webhook" }, { status: 500 });
  }
}
