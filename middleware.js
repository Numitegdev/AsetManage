import { NextResponse } from 'next/server';

export function middleware(req) {
  // Ambil URL tujuan
  const { pathname } = req.nextUrl;

  // Periksa apakah pengguna sedang mencoba mengakses halaman admin
  if (pathname.startsWith('/admin')) {
    // Cek apakah pengguna memiliki token login di cookies
    const isLoggedIn = req.cookies.get('isLoggedIn')?.value;

    // Jika tidak login, arahkan ke halaman login
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Jika bukan halaman admin atau pengguna sudah login, izinkan akses
  return NextResponse.next();
}
