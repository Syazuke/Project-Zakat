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
  Type: z.enum([
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
  metode: z.string().optional(),
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

    const isSPP =
      dataBersih.Type === "SPP" || dataBersih.Type === "Biaya Sekolah";

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
          message: dataBersih.message || "-",
          sppType: dataBersih.Type,
          paymentMonth: dataBersih.paymentMonth || "Bulan Ini",
          amount: dataBersih.nominal,
          status: statusTransaksi,
        },
      });
      orderIdMidtrans = `SPP-${newTransaction.id}`;
    } else {
      newTransaction = await prisma.zakatTransaction.create({
        data: {
          name: dataBersih.nama,
          message: dataBersih.pesan || "",
          zakatType: dataBersih.jenisZakat,
          amount: dataBersih.nominal,
          paymentMethod:
            dataBersih.metode === "tunai"
              ? "Tunai (Ke Admin)"
              : "Midtrans (Virtual Account / QRIS)",
          status: statusTransaksi,
        },
      });
      orderIdMidtrans = `ZAKAT-${newTransaction.id}`;
    }

    try {
      const SPREADSHEET_URL_SPP =
        "https://script.google.com/macros/s/AKfycbxcidZsQJSK356GVZcHQf-ScLNlpFTFZ0uTHevlo2YUJnZXzaNWnkOuwSPJl5_ta703KA/exec";
      const SPREADSHEET_URL_ZAKAT =
        "https://script.google.com/macros/s/AKfycbwEcV1fRA0xe_pCHd0lnEZGI5rbYZfXGw-LtKnX-xdRSV7lAPZbnIeYOrRWWOXl3hg/exec";

      const targetUrl = isSPP ? SPREADSHEET_URL_SPP : SPREADSHEET_URL_ZAKAT;

      if (targetUrl) {
        await fetch(targetUrl, {
          method: "POST",
          body: JSON.stringify({
            order_id: orderIdMidtrans,
            nama: dataBersih.nama,
            jenisZakat: dataBersih.Type,
            jenisSPP: dataBersih.Type,
            nominal: dataBersih.nominal,
            metode: dataBersih.metode === "tunai" ? "Tunai" : "Online",
            status: statusTransaksi,
            keterangan: dataBersih.message,
            bulan: dataBersih.paymentMonth || "-",
            pesan: dataBersih.pesan || "-",
          }),
        });
      }
    } catch (sheetError) {
      console.error("Gagal mengirim ke Spreadsheet:", sheetError);
    }

    // ========================================================
    // ✨ LOGIKA POTONG JALAN UNTUK TUNAI ✨
    // ========================================================
    if (dataBersih.metode === "tunai") {
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
