import { apiClient } from "./client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "./types";

/**
 * Login del usuario
 * Guarda el token en localStorage y en cookie
 */
export async function login(
  data: LoginRequest,
): Promise<AuthResponse> {
  try {
    const response = await apiClient<AuthResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );

    if (!response.token) {
      throw new Error("El servidor no retornó un token");
    }

    // ✅ Guardar en localStorage
    localStorage.setItem("access_token", response.token);

    // ✅ Guardar datos del usuario
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: response.id,
        name: response.name,
        email: response.email,
        department: response.department,
      }),
    );

    // ✅ Guardar en cookie para middleware
    if (typeof window !== "undefined") {
      document.cookie = `access_token=${response.token}; path=/; max-age=86400`; // 24 horas
    }

    console.log("✅ Login exitoso, token guardado");

    return response;
  } catch (error) {
    console.error("❌ Error en login:", error);
    throw error;
  }
}

/**
 * Registrar nuevo usuario
 */
export async function register(
  data: RegisterRequest,
): Promise<AuthResponse> {
  try {
    const response = await apiClient<AuthResponse>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );

    if (!response.token) {
      throw new Error("El servidor no retornó un token");
    }

    localStorage.setItem("access_token", response.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: response.id,
        name: response.name,
        email: response.email,
        department: response.department,
      }),
    );

    if (typeof window !== "undefined") {
      document.cookie = `access_token=${response.token}; path=/; max-age=86400`;
    }

    return response;
  } catch (error) {
    console.error("❌ Error en registro:", error);
    throw error;
  }
}

/**
 * Logout del usuario
 * Elimina token de localStorage y cookies
 */
export function logout(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");

  // Limpiar cookie
  if (typeof window !== "undefined") {
    document.cookie = "access_token=; path=/; max-age=0";
  }

  console.log("✅ Logout exitoso");
}

/**
 * Obtener token actual
 */
export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem("access_token");

  if (!token) {
    console.warn("⚠️ No hay token disponible");
    return null;
  }

  return token;
}

/**
 * Obtener usuario actual
 */
export function getCurrentUser<T = AuthResponse>(): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as T;
  } catch (error) {
    console.error("❌ Error al parsear usuario:", error);
    return null;
  }
}

/**
 * Verificar si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  
  if (!token) {
    return false;
  }

  // ✅ Verificar si el token no ha expirado
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expirationTime = payload.exp * 1000; // Convertir a milisegundos
    
    if (Date.now() > expirationTime) {
      console.warn("⚠️ Token expirado");
      logout();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("❌ Error al validar token:", error);
    return false;
  }
}

/**
 * Hook para verificar autenticación en componentes
 * Uso: const isAuth = useIsAuthenticated();
 */
export function useIsAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return isAuthenticated();
}