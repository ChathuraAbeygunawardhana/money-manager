import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware function that does nothing - all routes are public
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// No routes are protected
export const config = {
  matcher: [],
};
