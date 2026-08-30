const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL no está definida");
}

export async function apiClient<T>(
    endpoint: string,
    options?: RequestInit,
): Promise<T> {

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            Array.isArray(data?.message)
                ? data.message.join(", ")
                : data?.message || "Error en la petición",
        );
    }

    return data;
}