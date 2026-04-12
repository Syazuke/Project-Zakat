import { NextResponse } from "next/server";

// Ini adalah fungsi Satpam Gerbang Depan
export function middleware(request) {
  // 1. Cek apakah pengunjung punya tiket masuk (Cookies)
  const isLoggedIn = request.cookies.get("isLoggedIn");

  // 2. Jika pengunjung mencoba masuk ke area yang URL-nya diawali "/admin"...
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // 3. ...dan ternyata dia TIDAK punya tiket (belum login)
    if (!isLoggedIn?.value) {
      // Langsung tendang ke halaman /login sebelum halaman admin sempat terbuka!
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Jika aman, persilakan lewat
  return NextResponse.next();
}

// Aturan: Satpam ini hanya berjaga di area /admin dan semua sub-foldernya
export const config = {
  matcher: ["/admin/:path*"],
};
