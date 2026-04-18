import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Satpam ini akan mengecek setiap kali ada yang membuka halaman website
export async function middleware(request) {
  // 1. Ambil token dari cookie pengunjung
  const token = request.cookies.get("admin_token")?.value;

  // 2. Jika tidak bawa token, tendang kembali ke halaman login!
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // 3. Jika bawa token, cek apakah tokennya asli (belum expired & segelnya utuh)
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "rahasia_kunci_zakat_123",
    );
    await jwtVerify(token, secret);

    // 4. Lulus sensor! Silakan masuk ke halaman admin.
    return NextResponse.next();
  } catch (error) {
    // Jika tokennya palsu atau kadaluarsa, tendang ke login!
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Beri tahu Satpam halaman mana saja yang harus dijaga ketat:
export const config = {
  // Misal: Semua halaman yang berawalan /admin/ (seperti /admin/dashboard, /admin/transaksi)
  matcher: ["/admin/:path*"],
};
