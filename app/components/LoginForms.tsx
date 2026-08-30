"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/lib/api/auth"; // ← IMPORTAR

export default function LoginForm() {
    const router = useRouter();
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            // ✅ LLAMAR A LA FUNCIÓN LOGIN
            await login({
                email,
                password,
            });

            // ✅ REDIRIGIR DESPUÉS DE AUTENTICARSE
            router.push("/automations");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Error al iniciar sesión",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
        >
            {/* ERROR MESSAGE */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-2">
                <label
                    htmlFor="email"
                    className="text-sm font-medium"
                >
                    Correo electrónico
                </label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                    placeholder="correo@empresa.com"
                    autoComplete="email"
                    disabled={loading}
                    required
                    className="
                        w-full
                        rounded-lg
                        border
                        px-4
                        py-3
                        outline-none
                        focus:ring-2
                        disabled:opacity-50
                    "
                />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
                <label
                    htmlFor="password"
                    className="text-sm font-medium"
                >
                    Contraseña
                </label>

                <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                    className="
                        w-full
                        rounded-lg
                        border
                        px-4
                        py-3
                        outline-none
                        focus:ring-2
                        disabled:opacity-50
                    "
                />
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                className="
                    w-full
                    rounded-lg
                    px-4
                    py-3
                    font-medium
                    transition
                    hover:opacity-90
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                "
            >
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
        </form>
    );
}