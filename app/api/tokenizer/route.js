import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import { prisma } from "@/app/libs/prisma";
import { z } from "zod";

// 1. Buku Aturan Zod
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

    // ✨ 1. DETEKSI JENIS TRANSAKSI (SPP atau Zakat?)
    const isSPP =
      dataBersih.zakatType === "SPP" ||
      dataBersih.zakatType === "Biaya Sekolah";

    // ✨ 2. PILIH KUNCI MIDTRANS YANG TEPAT DARI .ENV
    const serverKey = isSPP
      ? process.env.MIDTRANS_SERVER_KEY_SPP
      : process.env.MIDTRANS_SERVER_KEY_Zakat;

    const clientKey = isSPP
      ? process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SPP
      : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_Zakat;

    let newTransaction;
    let orderIdMidtrans = "";

    // ========================================================
    // ✨ PERCABANGAN GUDANG (ZAKAT vs SPP) ✨
    // ========================================================
    if (isSPP) {
      newTransaction = await prisma.sppTransaction.create({
        data: {
          studentName: dataBersih.nama,
          message: dataBersih.pesan || "-",
          sppType: dataBersih.zakatType,
          paymentMonth: dataBersih.paymentMonth || "Bulan Ini",
          amount: dataBersih.nominal,
          status: "PENDING",
        },
      });
      orderIdMidtrans = `SPP-${newTransaction.id}`;
    } else {
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
      // PERHATIAN: Diubah menjadi ZAKAT- agar sinkron dengan file Webhook
      orderIdMidtrans = `ZAKAT-${newTransaction.id}`;
    }
    // ========================================================

    // ✨ 3. BANGUNKAN MIDTRANS DENGAN KUNCI YANG TERPILIH
    let snap = new Midtrans.Snap({
      isProduction: false,
      serverKey: serverKey,
      clientKey: clientKey,
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

    // ✨ 4. KIRIM TOKEN DAN CLIENT_KEY KE FRONTEND
    return NextResponse.json(
      {
        token: snapToken,
        clientKey: clientKey, // Wajib dikirim agar UI Frontend bisa menyesuaikan!
      },
      { status: 200 },
    );
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
