import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";

export async function POST(request) {
  try {
    const data = await request.json();

    const transactionStatus = data.transaction_status;
    const orderId = data.order_id;
    const grossAmount = data.gross_amount;

    if (transactionStatus === "settlement" || transactionStatus === "capture") {
      const GOOGLE_SHEET_URL_ZAKAT =
        "https://script.google.com/macros/s/AKfycbwEcV1fRA0xe_pCHd0lnEZGI5rbYZfXGw-LtKnX-xdRSV7lAPZbnIeYOrRWWOXl3hg/exec";
      const GOOGLE_SHEET_URL_SPP =
        "https://script.google.com/macros/s/AKfycbwRabFBQg5xrhmG6wwdUrorCd2jAAMNAR2Tfi4ew7HSFnJ8F4QOoi_Se5-lrpugCGlJFw/exec";

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
          jenis: `Zakat ${trx.zakatType}`,
          keterangan: trx.message || "-",
          nominal: `Rp ${parseInt(grossAmount).toLocaleString("id-ID")}`,
          status: trx.status,
        };
        targetSheetUrl = GOOGLE_SHEET_URL_ZAKAT;
      } else if (orderId.startsWith("SPP-")) {
        const trx = await prisma.sppTransaction.update({
          where: { id: orderId.replace("SPP-", "") },
          data: { status: "SUCCESS" },
        });

        // 📦 HANYA 6 DATA
        dataExcel = {
          tanggal: new Date().toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta",
          }),
          nama: trx.studentName,
          jenis: trx.sppType,
          tagihan: `Bulan: ${trx.paymentMonth}`,
          keterangan: trx.message || "-",
          nominal: `Rp ${parseInt(grossAmount).toLocaleString("id-ID")}`,
          status: trx.status,
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

    return NextResponse.json({ message: "Webhook diproses" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error Webhook" }, { status: 500 });
  }
}
