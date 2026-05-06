import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import { prisma } from "@/app/libs/prisma";
import { z } from "zod";

const PembayaranSchema = z.object({
  nama: z
    .string()
    .max(100, "Nama maksimal 100 karakter")
    .default("Hamba Allah"),
  pesan: z.string().max(500, "Pesan kepanjangan!").optional(),
  nominal: z.number().min(10000, "Minimal pembayaran Rp 10.000"),
  zakatType: z.string().optional(),
  Type: z.string().optional(),
  paymentMonth: z.string().optional(),
  metode: z.string().optional(),
  pilihan_metode: z.string().optional(),
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

    const jenisTransaksi =
      dataBersih.Type || dataBersih.zakatType || "Tidak Diketahui";
    const isSPP =
      jenisTransaksi === "SPP" || jenisTransaksi === "Biaya Sekolah";

    const statusTransaksi =
      dataBersih.metode === "tunai" ? "PENDING_TUNAI" : "PENDING";

    let newTransaction;
    let orderIdMidtrans = "";

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

    if (dataBersih.metode === "tunai") {
      return NextResponse.json(
        { isTunai: true, message: "Berhasil dicatat sebagai PENDING_TUNAI" },
        { status: 200 },
      );
    }

    let biayaAdmin = 0;
    let kodeMidtrans = [];
    const metodeDipilih = dataBersih.pilihan_metode || "";

    if (metodeDipilih === "qris") {
      biayaAdmin = Math.floor(dataBersih.nominal * 0.007);
      kodeMidtrans = ["other_qris"];
    } else if (metodeDipilih === "gopay") {
      biayaAdmin = Math.floor(dataBersih.nominal * 0.02);
      kodeMidtrans = ["gopay"];
    } else if (metodeDipilih === "shopeepay") {
      biayaAdmin = Math.floor(dataBersih.nominal * 0.02);
      kodeMidtrans = ["shopeepay"];
    } else if (metodeDipilih === "dana") {
      biayaAdmin = Math.floor(dataBersih.nominal * 0.015);
      kodeMidtrans = ["dana"];
    } else if (
      ["bca_va", "bni_va", "bri_va", "cimb_va", "permata_va"].includes(
        metodeDipilih,
      )
    ) {
      biayaAdmin = 4000;
      kodeMidtrans = [metodeDipilih];
    } else if (metodeDipilih === "mandiri_va") {
      biayaAdmin = 4000;
      kodeMidtrans = ["echannel"];
    }

    const totalBayar = dataBersih.nominal + biayaAdmin;

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

    const parameterMidtrans = {
      transaction_details: {
        order_id: orderIdMidtrans,
        gross_amount: totalBayar,
      },
      item_details: [
        {
          id: "item-01",
          price: dataBersih.nominal,
          quantity: 1,
          name: isSPP
            ? `SPP ${dataBersih.paymentMonth || ""}`
            : `Zakat ${jenisTransaksi}`,
        },
      ],
      customer_details: {
        first_name: dataBersih.nama,
      },
    };

    if (biayaAdmin > 0) {
      parameterMidtrans.item_details.push({
        id: "fee-01",
        price: biayaAdmin,
        quantity: 1,
        name: `Biaya Layanan ${metodeDipilih.replace("_", " ").toUpperCase()}`,
      });
    }

    if (kodeMidtrans.length > 0) {
      parameterMidtrans.enabled_payments = kodeMidtrans;
    }

    const snapToken = await snap.createTransactionToken(parameterMidtrans);

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
