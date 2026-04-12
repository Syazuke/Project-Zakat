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

    const mySignature = crypto
      .createHash("sha512")
      .update(
        notificationJson.order_id +
          notificationJson.status_code +
          notificationJson.gross_amount +
          process.env.MIDTRANS_SERVER_KEY, // Gunakan Server Key Anda
      )
      .digest("hex");

    // 2. Bandingkan dengan signature dari Midtrans
    if (mySignature !== notificationJson.signature_key) {
      // Jika beda, berarti ini HACKER! Tendang!
      return NextResponse.json({ message: "Akses Ditolak!" }, { status: 403 });
    }

    const transactionStatus = notificationJson.transaction_status;
    const orderId = notificationJson.order_id;

    // --- LOGIKA BARU UNTUK MENGATASI TEST MIDTRANS ---
    // Jika tidak ada orderId, atau Midtrans sedang mengirim data 'test'
    if (!orderId) {
      return NextResponse.json(
        { message: "Test Webhook Midtrans Berhasil Terhubung!" },
        { status: 200 },
      );
    }

    // Cek dulu apakah orderId tersebut BENAR-BENAR ADA di database kita
    const existingTransaction = await prisma.zakatTransaction.findUnique({
      where: { id: orderId },
    });

    // Jika transaksinya tidak ada (misal data dummy dari Midtrans), beri respon 200 saja agar Midtrans senang
    if (!existingTransaction) {
      return NextResponse.json(
        {
          message:
            "Transaksi tidak ditemukan di database, tapi webhook terhubung.",
        },
        { status: 200 },
      );
    }
    // --------------------------------------------------

    let finalStatus = "PENDING";

    if (transactionStatus == "capture" || transactionStatus == "settlement") {
      finalStatus = "SUCCESS";
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      finalStatus = "FAILED";
    } else if (transactionStatus == "pending") {
      finalStatus = "PENDING";
    }

    // Update database Prisma Anda
    await prisma.zakatTransaction.update({
      where: {
        id: orderId,
      },
      data: {
        status: finalStatus,
      },
    });

    return NextResponse.json({ status: "OK" }, { status: 200 });
  } catch (error) {
    console.error("Error Webhook Midtrans:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
