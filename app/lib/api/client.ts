const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está definida");
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  // ✅ Obtener token de forma segura
  let token: string | null = null;
  
  if (typeof window !== "undefined") {
    token = localStorage.getItem("access_token");
    
    // 🔍 DEBUG: Verificar token
    if (!token) {
      console.warn("⚠️ No hay token en localStorage");
    }
  }

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
    console.log("✅ Token enviado en Authorization header");
  } else {
    console.warn("❌ No hay token disponible");
  }

  const fullUrl = `${API_URL}${endpoint}`;

  console.log("📡 API REQUEST:", {
    url: fullUrl,
    method: options.method || "GET",
    hasToken: !!token,
    tokenLength: token?.length,
  });

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type");
    const data =
      contentType?.includes("application/json")
        ? await response.json()
        : null;

    console.log("📊 API RESPONSE:", {
      status: response.status,
      ok: response.ok,
      data,
    });

    if (!response.ok) {
      console.error("❌ API ERROR:", {
        status: response.status,
        statusText: response.statusText,
        data,
        url: fullUrl,
        hasToken: !!token,
      });

      // Error message más útil
      const errorMessage =
        Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || 
            (response.status === 401
              ? "No autorizado. Verifica tu sesión."
              : response.statusText);

      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error) {
    console.error("🔴 FETCH ERROR:", error);
    throw error;
  }
}