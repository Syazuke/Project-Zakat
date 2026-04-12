import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import { prisma } from "@/app/libs/prisma";
import { z } from "zod";

// 1. Buku Aturan Zod
const ZakatSchema = z.object({
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
  ]),
});

export async function POST(request) {
  try {
    // 1. Tangkap data utuh dari frontend
    const rawData = await request.json();

    // 2. Suruh Zod memeriksa datanya
    const validasi = ZakatSchema.safeParse(rawData);

    // Jika data melanggar aturan, langsung tolak sebelum masuk database!
    if (!validasi.success) {
      console.error("Validasi gagal:", validasi.error.format());
      return NextResponse.json(
        { message: "Data tidak valid!", errors: validasi.error.format() },
        { status: 400 },
      );
    }

    // Ambil data yang sudah dipastikan aman dan bersih
    const dataBersih = validasi.data;

    // 3. SIMPAN KE DATABASE (Gunakan dataBersih)
    const newTransaction = await prisma.zakatTransaction.create({
      data: {
        name: dataBersih.nama,
        message: dataBersih.pesan || "",
        zakatType: dataBersih.zakatType,
        amount: dataBersih.nominal,
        paymentMethod: "Midtrans (Virtual Account / QRIS)",
        status: "PENDING",
      },
    });

    // 4. Inisialisasi Midtrans
    let snap = new Midtrans.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });

    // 5. Buat Parameter Tagihan (Gunakan ID dari database)
    let parameter = {
      transaction_details: {
        order_id: newTransaction.id,
        gross_amount: dataBersih.nominal,
      },
      customer_details: {
        first_name: dataBersih.nama,
      },
    };

    // 6. Minta Token
    const snapToken = await snap.createTransactionToken(parameter);

    return NextResponse.json({ token: snapToken }, { status: 200 });
  } catch (error) {
    console.error("Error Tokenizer:", error);
    return NextResponse.json(
      { message: "Gagal membuat tagihan" },
      { status: 500 },
    );
  }
}
