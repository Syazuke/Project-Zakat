import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import { prisma } from "@/app/libs/prisma";
import { z } from "zod";

// 1. Buku Aturan Zod (Sudah disesuaikan dengan schema baru)
const PembayaranSchema = z.object({
  nama: z
    .string()
    .max(100, "Nama maksimal 100 karakter")
    .default("Hamba Allah"),
  pesan: z.string().max(500, "Pesan kepanjangan!").optional(),
  nominal: z.number().min(10000, "Minimal pembayaran Rp 10.000"),
  zakatType: z.enum([
    "penghasilan",
    "maal",
    "fitrah",
    "fidyah",
    "sedekah",
    "Zakat",
    "SPP",
    "Biaya Sekolah",
  ]),
  // Hanya paymentMonth yang tersisa untuk SPP
  paymentMonth: z.string().optional(),
});

export async function POST(request) {
  try {
    const rawData = await request.json();
    const validasi = PembayaranSchema.safeParse(rawData);

    if (!validasi.success) {
      console.error("Validasi gagal:", validasi.error.format());
      return NextResponse.json(
        { message: "Data tidak valid!", errors: validasi.error.format() },
        { status: 400 },
      );
    }

    const dataBersih = validasi.data;

    let newTransaction;
    let orderIdMidtrans = "";

    // ========================================================
    // ✨ PERCABANGAN GUDANG (ZAKAT vs SPP) ✨
    // ========================================================
    if (
      dataBersih.zakatType === "SPP" ||
      dataBersih.zakatType === "Biaya Sekolah"
    ) {
      // 1. Masukkan ke Gudang SPP (Sesuai Schema Baru)
      newTransaction = await prisma.sppTransaction.create({
        data: {
          studentName: dataBersih.nama,
          message: dataBersih.pesan || "-",
          sppType: dataBersih.zakatType, // Menyimpan jenis: "SPP" atau "Biaya Sekolah"
          paymentMonth: dataBersih.paymentMonth || "Bulan Ini",
          amount: dataBersih.nominal,
          status: "PENDING",
        },
      });
      // Beri label SPP- agar tidak bentrok di Midtrans
      // Catatan: newTransaction.id sekarang berupa String (cuid), contoh: "SPP-clnx..."
      orderIdMidtrans = `SPP-${newTransaction.id}`;
    } else {
      // 2. Masukkan ke Gudang Zakat
      newTransaction = await prisma.zakatTransaction.create({
        data: {
          name: dataBersih.nama,
          message: dataBersih.pesan || "",
          zakatType: dataBersih.zakatType,
          amount: dataBersih.nominal,
          paymentMethod: "Midtrans (Virtual Account / QRIS)",
          status: "PENDING",
        },
      });
      // Beri label ZKT- agar tidak bentrok di Midtrans
      orderIdMidtrans = `ZKT-${newTransaction.id}`;
    }
    // ========================================================

    // Inisialisasi Midtrans
    let snap = new Midtrans.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });

    let parameter = {
      transaction_details: {
        order_id: orderIdMidtrans,
        gross_amount: dataBersih.nominal,
      },
      customer_details: {
        first_name: dataBersih.nama,
      },
    };

    const snapToken = await snap.createTransactionToken(parameter);

    return NextResponse.json({ token: snapToken }, { status: 200 });
  } catch (error) {
    console.error("ERROR ASLI MIDTRANS:", error.message || error);
    return NextResponse.json(
      {
        message: "Gagal membuat tagihan",
        detail: error.message || "Cek log Vercel untuk detail",
      },
      { status: 500 },
    );
  }
}
