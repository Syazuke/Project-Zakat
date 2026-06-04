import { prisma } from "@/app/libs/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const dataBersih = await request.json();

    const jenisTransaksi =
      dataBersih.Type || dataBersih.zakatType || "Tidak diketahui";
    const isSPP =
      jenisTransaksi === "SPP" || jenisTransaksi === "Biaya Sekolah";

    const statusTransaksi =
      dataBersih.metode === "tunai" ? "PENDING_TUNAI" : "PENDING";

    if (isSPP) {
      await prisma.sppTransaction.create({
        data: {
          studentName: dataBersih.nama,
          message: dataBersih.pesan || "-",
          sppType: jenisTransaksi,
          paymentMonth: dataBersih.paymentMonth || "-",
          amount: dataBersih.nominal,
          status: statusTransaksi,
        },
      });
    } else {
      await prisma.zakatTransaction.create({
        data: {
          name: dataBersih.nama,
          message: dataBersih.pesan || "",
          zakatType: jenisTransaksi,
          amount: dataBersih.nominal,
          paymentMethod:
            dataBersih.metode === "tunai" ? "Tunai/Cash" : `Transfer`,
          status: statusTransaksi,
        },
      });
    }

    return NextResponse.json(
      { message: "Berhasil dicatat sebagai pending" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error checkout database:", error);
    return NextResponse.json(
      { message: "Gagal memuat tagihan ke database" },
      { status: 500 },
    );
  }
}
