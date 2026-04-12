/** @type {import('next').NextConfig} */

// Kita buat Daftar VIP (Whitelist) di sini
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://app.sandbox.midtrans.com https://app.midtrans.com;
  style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
  font-src 'self' https://cdnjs.cloudflare.com;
  img-src 'self' data: https:;
  connect-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com;
  frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig = {
  async headers() {
    return [
      {
        // Terapkan pelindung ini ke seluruh halaman website /(.*)
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "X-Frame-Options", // Mencegah web Anda di-copy ke dalam iframe (Clickjacking)
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options", // Mencegah browser menebak-nebak tipe file
            value: "nosniff",
          },
          {
            key: "Strict-Transport-Security", // Memaksa selalu pakai HTTPS
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
