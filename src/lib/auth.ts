/**
 * Authentication Helper Utilities
 */

// Simple client-side helper to check if a user session is active
export function isClientAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  // Fallback check against localStorage if cookies are opaque
  return localStorage.getItem("authenticated") === "true";
}

export function setClientAuthStatus(isAuthenticated: boolean): void {
  if (typeof window !== "undefined") {
    if (isAuthenticated) {
      localStorage.setItem("authenticated", "true");
    } else {
      localStorage.removeItem("authenticated");
    }
  }
}
