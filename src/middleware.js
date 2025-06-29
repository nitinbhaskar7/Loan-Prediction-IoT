import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Define routes that require auth
const protectedRoutes = ['/dashboard'];


export function middleware(request) {
  const { pathname } = request.nextUrl;
  // Only apply middleware to protected routes
  const token = request.cookies.get('token')?.value;
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
  
    
    if (!token) {
      const loginUrl = new URL('/', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Optionally validate token format or decode here
    // e.g., check if it's a JWT and not expired
  }

  if(pathname == '/' && token) {
      console.log("User already logged in, redirecting to dashboard");
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    

  return NextResponse.next();
}

// Apply middleware to all routes (but filter inside)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
