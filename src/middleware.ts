import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — MUST use getUser(), not getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protect /admin routes (role check happens inside admin layout)
  if (pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect account and checkout
  if (
    (pathname.startsWith("/account") || pathname.startsWith("/checkout")) &&
    !user
  ) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}

// Only run on routes that need the Supabase session: auth redirects, and
// Server Components that call getUser() (the session cookie must be refreshed
// here because Server Components cannot write cookies). Public catalog pages
// are excluded to avoid a Supabase Auth round trip on every request.
export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
    "/products/:slug",
  ],
};
