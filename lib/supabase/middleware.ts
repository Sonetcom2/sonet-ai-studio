import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function updateSession(
  request: NextRequest
) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(name, value);
            }
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log(
    "MIDDLEWARE USER:",
    user?.email ?? null
  );

  if (authError) {
    console.log(
      "MIDDLEWARE AUTH ERROR:",
      authError.message
    );
  }

  const pathname = request.nextUrl.pathname;

  /*
   * Protected user routes
   */
  const protectedRoutes = [
    "/dashboard",
    "/ai-image",
    "/ai-video",
    "/prompt-library",
  ];

  const isProtected = protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  if (isProtected && !user) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  /*
   * Admin routes must remain accessible.
   * requireAdmin() handles administrator authorization.
   */
  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  /*
   * Maintenance page must always be accessible.
   */
  const isMaintenancePage =
    pathname === "/maintenance" ||
    pathname.startsWith("/maintenance/");

  /*
   * Never redirect API routes to maintenance.
   */
  const isApiRoute =
    pathname === "/api" ||
    pathname.startsWith("/api/");

  /*
   * Maintenance mode applies to public pages.
   */
  if (
    !isAdminRoute &&
    !isMaintenancePage &&
    !isApiRoute
  ) {
    const { data: settings, error } =
      await supabaseAdmin
        .from("settings")
        .select("maintenance_mode")
        .limit(1)
        .single();

    if (
      !error &&
      settings?.maintenance_mode === true
    ) {
      return NextResponse.redirect(
        new URL("/maintenance", request.url)
      );
    }
  }

  return response;
}