import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import { prisma } from "@/app/libs/prisma";
import { z } from "zod";

// 1. Buku Aturan Zod (Sudah Pintar & Fleksibel)
const PembayaranSchema = z.object({
  nama: z
    .string()
    .max(100, "Nama maksimal 100 karakter")
    .default("Hamba Allah"),
  pesan: z.string().max(500, "Pesan kepanjangan!").optional(),
  nominal: z.number().min(10000, "Minimal pembayaran Rp 10.000"),

  // ✨ Bisa menerima 'zakatType' (dari Zakat) atau 'Type' (dari SPP)
  zakatType: z.string().optional(),
  Type: z.string().optional(),

  paymentMonth: z.string().optional(),
  metode: z.string().optional(), // ✨ Wajib untuk membedakan Tunai / Online
});

export async function POST(request) {
  try {
    const rawData = await request.json();
    const validasi = PembayaranSchema.safeParse(rawData);

    if (!validasi.success) {
      return NextResponse.json(
        { message: "Data tidak valid!", errors: validasi.error.format() },
        { status: 400 },
      );
    }

    const dataBersih = validasi.data;

    // ✨ GABUNGKAN CERDAS: Pakai 'Type' kalau ada, kalau tidak pakai 'zakatType'
    const jenisTransaksi =
      dataBersih.Type || dataBersih.zakatType || "Tidak Diketahui";
    const isSPP =
      jenisTransaksi === "SPP" || jenisTransaksi === "Biaya Sekolah";
    const statusTransaksi =
      dataBersih.metode === "tunai" ? "PENDING_TUNAI" : "PENDING";

    let newTransaction;
    let orderIdMidtrans = "";

    // ========================================================
    // ✨ PERCABANGAN GUDANG (ZAKAT vs SPP)
    // ========================================================
    if (isSPP) {
      newTransaction = await prisma.sppTransaction.create({
        data: {
          studentName: dataBersih.nama,
          message: dataBersih.pesan || "-",
          sppType: jenisTransaksi,
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
          zakatType: jenisTransaksi,
          amount: dataBersih.nominal,
          paymentMethod:
            dataBersih.metode === "tunai"
              ? "Tunai (Ke Admin)"
              : "Midtrans (VA / QRIS)",
          status: statusTransaksi,
        },
      });
      orderIdMidtrans = `ZAKAT-${newTransaction.id}`;
    }

    // ========================================================
    // ✨ JIKA TUNAI: LANGSUNG KIRIM KE GOOGLE SHEETS & POTONG JALAN
    // ========================================================
    if (dataBersih.metode === "tunai") {
      try {
        // ⚠️ MASUKKAN URL SPREADSHEET ANDA DI SINI
        const GOOGLE_SHEET_URL_SPP =
          "https://script.google.com/macros/s/AKfycbwevzDVjL_8pG-FRntzXxDDfhJdAM622flsKDpEDwv08wD97rwotvYqeIvauRiRtUs3IQ/exec";
        const GOOGLE_SHEET_URL_ZAKAT =
          "https://script.google.com/macros/s/AKfycbwEcV1fRA0xe_pCHd0lnEZGI5rbYZfXGw-LtKnX-xdRSV7lAPZbnIeYOrRWWOXl3hg/exec";

        const targetUrl = isSPP ? GOOGLE_SHEET_URL_SPP : GOOGLE_SHEET_URL_ZAKAT;

        // 📦 PASTIKAN HANYA 6 DATA (Persis seperti format Webhook)
        const dataExcel = {
          tanggal: new Date().toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta",
          }),
          nama: dataBersih.nama,
          jenis: isSPP ? jenisTransaksi : `Zakat ${jenisTransaksi}`,
          tagihan: isSPP ? `Bulan: ${dataBersih.paymentMonth || "-"}` : "-",
          keterangan: dataBersih.pesan || "-",
          nominal: `Rp ${dataBersih.nominal.toLocaleString("id-ID")}`,
        };

        await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(dataExcel),
        });
      } catch (err) {
        console.error("Gagal kirim sheet tunai", err);
      }

      // Bypass Midtrans (Langsung sukses)
      return NextResponse.json(
        { isTunai: true, message: "Berhasil dicatat sebagai Tunai" },
        { status: 200 },
      );
    }

    // ========================================================
    // ✨ JIKA ONLINE: BANGUNKAN MIDTRANS
    // ========================================================
    const serverKey = isSPP
      ? process.env.MIDTRANS_SERVER_KEY_SPP
      : process.env.MIDTRANS_SERVER_KEY_Zakat;
    const clientKey = isSPP
      ? process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SPP
      : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_Zakat;

    let snap = new Midtrans.Snap({
      isProduction: false,
      serverKey: serverKey,
      clientKey: clientKey,
    });

    const snapToken = await snap.createTransactionToken({
      transaction_details: {
        order_id: orderIdMidtrans,
        gross_amount: dataBersih.nominal,
      },
      customer_details: {
        first_name: dataBersih.nama,
      },
    });

    return NextResponse.json(
      { token: snapToken, clientKey: clientKey },
      { status: 200 },
    );
  } catch (error) {
    console.error("ERROR ASLI MIDTRANS:", error.message || error);
    return NextResponse.json(
      { message: "Gagal membuat tagihan", detail: error.message },
      { status: 500 },
    );
  }
}
