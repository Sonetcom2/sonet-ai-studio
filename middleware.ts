import { type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  console.log("🔥 Middleware running:", request.nextUrl.pathname);

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ai-image/:path*",
    "/ai-video/:path*",
    "/prompt-library/:path*",
  ],
};