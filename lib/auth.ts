const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthToken {
  accessToken: string;
  user: AuthUser;
}

function parseJwt(token: string): any {
  try {
    const base64Payload = token.split(".")[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export function extractAuthFromCallback(
  searchParams: URLSearchParams,
): AuthToken | null {
  const token = searchParams.get("token");
  if (!token) return null;

  const payload = parseJwt(token);
  if (!payload) return null;

  return {
    accessToken: token,
    user: {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    },
  };
}

export function saveAuthToken(auth: AuthToken) {
  if (typeof window === "undefined") return;

  localStorage.setItem(AUTH_TOKEN_KEY, auth.accessToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(auth.user));
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem(AUTH_USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function clearAuth() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getBackendGoogleAuthUrl() {
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`;
}
