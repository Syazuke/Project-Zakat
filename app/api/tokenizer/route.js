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
  metode: z.string().optional(), // ✨ TAMBAHAN: Untuk menangkap metode (online/tunai)
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

    // ✨ 2. TENTUKAN STATUS BERDASARKAN METODE BAYAR
    // Jika tunai, statusnya beda agar mudah difilter oleh Admin
    const statusTransaksi =
      dataBersih.metode === "tunai" ? "PENDING_TUNAI" : "PENDING";

    // ✨ 3. PILIH KUNCI MIDTRANS YANG TEPAT DARI .ENV
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
          status: statusTransaksi, // ✨ Status Dinamis
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
          paymentMethod:
            dataBersih.metode === "tunai"
              ? "Tunai (Ke Admin)"
              : "Midtrans (Virtual Account / QRIS)", // ✨ Catat metode yang benar
          status: statusTransaksi, // ✨ Status Dinamis
        },
      });
      orderIdMidtrans = `ZAKAT-${newTransaction.id}`;
    }

    // ========================================================
    // ✨ JEMBATAN KE GOOGLE SPREADSHEET (UNTUK KEDUANYA) ✨
    // ========================================================
    try {
      // ⚠️ GANTI STRING DI BAWAH DENGAN URL WEB APP GOOGLE SCRIPT ANDA
      const SPREADSHEET_URL =
        "https://script.google.com/macros/s/AKfycbwKmv9IrID6lU4iTWLg1EsKteYXtNKKGi7NjQ398hrW0PDkAlyvPi-gMXZpJO9G-SKTkw/exec";

      // Kita jalankan fetch tanpa await di depan jika tidak ingin proses loading bayar terlalu lama,
      // tapi pakai await juga aman.
      await fetch(SPREADSHEET_URL, {
        method: "POST",
        body: JSON.stringify({
          order_id: orderIdMidtrans,
          nama: dataBersih.nama,
          jenis: dataBersih.zakatType,
          nominal: dataBersih.nominal,
          metode: dataBersih.metode === "tunai" ? "Tunai" : "Online",
          status: statusTransaksi,
        }),
      });
    } catch (sheetError) {
      console.error("Gagal mengirim ke Spreadsheet:", sheetError);
      // Kita abaikan error ini agar gagalnya spreadsheet tidak menggagalkan proses pembayaran
    }

    // ========================================================
    // ✨ LOGIKA POTONG JALAN UNTUK TUNAI ✨
    // ========================================================
    if (dataBersih.metode === "tunai") {
      // Langsung kembalikan respon sukses, Midtrans tidak perlu dipanggil!
      return NextResponse.json(
        { isTunai: true, message: "Berhasil dicatat sebagai Tunai" },
        { status: 200 },
      );
    }

    // ========================================================
    // ✨ 4. BANGUNKAN MIDTRANS JIKA ONLINE
    // ========================================================
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

    // ✨ 5. KIRIM TOKEN DAN CLIENT_KEY KE FRONTEND
    return NextResponse.json(
      {
        token: snapToken,
        clientKey: clientKey,
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
