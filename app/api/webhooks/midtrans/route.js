import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import crypto from "crypto";

export async function POST(request) {
  try {
    const notificationJson = await request.json();

    console.log(
      "🔔 WEBHOOK MASUK! Status:",
      notificationJson.transaction_status,
      " | Order ID:",
      notificationJson.order_id,
    );

    // 1. Verifikasi Keamanan Signature Midtrans
    const mySignature = crypto
      .createHash("sha512")
      .update(
        notificationJson.order_id +
          notificationJson.status_code +
          notificationJson.gross_amount +
          process.env.MIDTRANS_SERVER_KEY,
      )
      .digest("hex");

    if (mySignature !== notificationJson.signature_key) {
      return NextResponse.json({ message: "Akses Ditolak!" }, { status: 403 });
    }

    const transactionStatus = notificationJson.transaction_status;
    const rawOrderId = notificationJson.order_id; // Bentuk asli dari Midtrans (misal: ZKT-cln... atau SPP-cln...)

    if (!rawOrderId) {
      return NextResponse.json(
        { message: "Test Webhook Midtrans Berhasil Terhubung!" },
        { status: 200 },
      );
    }

    // ✨ Bersihkan label awalan (ZKT- atau SPP-) untuk mendapatkan ID asli di database
    const orderIdBersih = rawOrderId.replace("ZKT-", "").replace("SPP-", "");

    // ================================================================
    // ✨ LOGIKA PENCARIAN GANDA (ZAKAT & SPP) ✨
    // ================================================================

    let transactionType = null;
    let existingTransaction = null;

    // A. Cari di tabel Zakat (ID berupa String, langsung pakai orderIdBersih)
    existingTransaction = await prisma.zakatTransaction.findUnique({
      where: { id: orderIdBersih },
    });

    if (existingTransaction) {
      transactionType = "ZAKAT";
    } else {
      // B. Jika tidak ada di Zakat, cari di tabel SPP
      existingTransaction = await prisma.sppTransaction.findUnique({
        where: { id: orderIdBersih },
      });

      if (existingTransaction) {
        transactionType = "SPP";
      }
    }

    // Jika di kedua tabel tetap tidak ada
    if (!existingTransaction) {
      return NextResponse.json(
        { message: "Transaksi tidak ditemukan di database Zakat maupun SPP." },
        { status: 200 },
      );
    }
    // ================================================================

    // Tentukan Status Akhir
    let finalStatus = "PENDING";
    if (transactionStatus == "capture" || transactionStatus == "settlement") {
      finalStatus = "SUCCESS";
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      finalStatus = "FAILED";
    }

    // ================================================================
    // ✨ UPDATE TABEL YANG SESUAI ✨
    // ================================================================
    if (transactionType === "ZAKAT") {
      await prisma.zakatTransaction.update({
        where: { id: orderIdBersih }, // Menggunakan ID yang sudah dibersihkan
        data: { status: finalStatus },
      });
    } else if (transactionType === "SPP") {
      await prisma.sppTransaction.update({
        where: { id: orderIdBersih }, // Menggunakan ID yang sudah dibersihkan
        data: { status: finalStatus },
      });
    }

    return NextResponse.json({ status: "OK" }, { status: 200 });
  } catch (error) {
    console.error("Error Webhook Midtrans:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
