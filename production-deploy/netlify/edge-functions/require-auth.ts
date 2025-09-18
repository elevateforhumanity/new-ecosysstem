// deno-lint-ignore-file no-explicit-any
export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const loginUrl = new URL("/login.html", url.origin);
  loginUrl.searchParams.set("redirect", url.pathname + url.search);

  const token = getToken(request);
  if (!token) {
    return Response.redirect(loginUrl.toString(), 302);
  }

  // Verify token with Supabase
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  if (!supabaseUrl || !anonKey) {
    console.error("Missing Supabase environment variables");
    return Response.redirect(loginUrl.toString(), 302);
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 
        Authorization: `Bearer ${token}`, 
        apikey: anonKey 
      }
    });

    if (!response.ok) {
      return Response.redirect(loginUrl.toString(), 302);
    }

    // Token is valid, allow access
    return context.next();
  } catch (error) {
    console.error("Auth verification error:", error);
    return Response.redirect(loginUrl.toString(), 302);
  }
};

function getToken(request: Request): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Check cookie as fallback
  const cookieHeader = request.headers.get("cookie") || "";
  const match = /(?:^|;\s*)sb-access-token=([^;]+)/.exec(cookieHeader);
  return match ? decodeURIComponent(match[1]) : null;
}