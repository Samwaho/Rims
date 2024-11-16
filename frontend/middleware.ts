import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Add your middleware logic here if needed
  return NextResponse.next();
}

// Configure the paths that should be handled by this middleware
export const config = {
  matcher: [
    "/api/uploadthing/:path*",
    // Add other paths that need middleware here
  ],
};
