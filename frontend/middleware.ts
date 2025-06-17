// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// // Export default function (bắt buộc)
// export default function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   const accessToken = request.cookies.get('accessToken')?.value;
  
//   console.log('Middleware check:', {
//     pathname,
//     hasToken: !!accessToken
//   });

//   // Protected routes
//   const protectedRoutes = ['/candidate/dashboard', '/recruiter/dashboard'];
//   const isProtectedRoute = protectedRoutes.some(route => 
//     pathname.startsWith(route)
//   );
  
//   // Auth routes
//   const authRoutes = ['/auth/login', '/auth/register'];
//   const isAuthRoute = authRoutes.some(route => 
//     pathname.startsWith(route)
//   );
  
//   // Nếu truy cập protected route mà không có token
//   if (isProtectedRoute && !accessToken) {
//     console.log('Redirecting to login - no token');
//     const loginUrl = new URL('/auth/login', request.url);
//     return NextResponse.redirect(loginUrl);
//   }
  
//   // Nếu có token và truy cập auth route
//   if (isAuthRoute && accessToken) {
//     console.log('Redirecting to dashboard - already authenticated');
//     return NextResponse.redirect(new URL('/candidate/dashboard', request.url));
//   }
  
//   return NextResponse.next();
// }

// // Export config object
// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// };
// middleware.ts
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;
  
  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Full URL:', request.url);
  console.log('Pathname:', pathname);
  console.log('Search params:', search);
  console.log('Has token:', !!accessToken);
  console.log('All cookies:', request.cookies.getAll());
  
  // Kiểm tra nếu đang truy cập dashboard mà không có token
  if (pathname.startsWith('/candidate/dashboard') && !accessToken) {
    console.log('🚫 No token - redirecting to login');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  if (pathname.startsWith('/recruiter/dashboard') && !accessToken) {
    console.log('🚫 No token - redirecting to login');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  console.log('✅ Allowing access');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

