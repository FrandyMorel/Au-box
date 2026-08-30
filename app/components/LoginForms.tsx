"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { login } from "@/app/lib/api/auth";

export default function LoginForm() {
    const router = useRouter();
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();
        setLoading(true);

        try {
            await login({
                email,
                password,
            });

            Swal.fire({
                icon: "success",
                title: "¡Éxito!",
                text: "Sesión iniciada correctamente",
                confirmButtonColor: "#6B4071",
                timer: 2000,
                timerProgressBar: true,
            });

            router.push("/automations");
            router.refresh();
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    err instanceof Error
                        ? err.message
                        : "Error al iniciar sesión",
                confirmButtonColor: "#6B4071",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
            >
                {/* Email */}
                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="email"
                        className="text-sm font-medium"
                    >
                        Correo electrónico
                        <span className="text-red-600 ml-1">*</span>
                    </label>

                    <div className="relative">
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
                                bg-[#E9DBD7]
                                border border-[#14243C]
                                px-4
                                py-3
                                outline-none
                                focus:ring-2
                                focus:ring-[#6B4071]
                                focus:border-transparent
                                disabled:opacity-50
                            "
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="password"
                        className="text-sm font-medium"
                    >
                        Contraseña
                        <span className="text-red-600 ml-1">*</span>
                    </label>

                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
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
                                bg-[#E9DBD7]
                                border border-[#14243C]
                                px-4
                                py-3
                                outline-none
                                focus:ring-2
                                focus:ring-[#6B4071]
                                focus:border-transparent
                                disabled:opacity-50
                                pr-10
                            "
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                            disabled={loading}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6b4071] hover:opacity-70 transition disabled:opacity-50"
                        >
                            {showPassword ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1em"
                                    height="1em"
                                    viewBox="0 0 16 16"
                                    className="w-5 h-5"
                                >
                                    <path
                                        d="M0 0h16v16H0z"
                                        fill="none"
                                    />
                                    <g
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                    >
                                        <path d="m1.75 8s2-4.25 6.25-4.25 6.25 4.25 6.25 4.25-2 4.25-6.25 4.25-6.25-4.25-6.25-4.25z" />
                                        <circle
                                            cx="8"
                                            cy="8"
                                            r="1.25"
                                            fill="currentColor"
                                        />
                                    </g>
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1em"
                                    height="1em"
                                    viewBox="0 0 16 16"
                                    className="w-5 h-5"
                                >
                                    <path
                                        d="M0 0h16v16H0z"
                                        fill="none"
                                    />
                                    <g
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                    >
                                        <path d="m8.75 3.75c3.5.5 5.5 4.25 5.5 4.25s-.5 1.25-1.5 2.25m-2.5 1.5c-6 2-8.5-3.75-8.5-3.75s.5-1.75 3-3.25" />
                                        <path
                                            fill="currentColor"
                                            d="m8.625 9.08253a1.25 1.25 0 0 1 -1.64894 -.36556 1.25 1.25 0 0 1 .22046 -1.67453l.80348.95756z"
                                        />
                                        <path d="m3.75 1.75 8.5 12.5" />
                                    </g>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="buttonAuth w-full py-3 font-medium mt-2"
                >
                    {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </button>

                {/* Register Link */}
                <div className="text-center text-sm">
                    ¿No tienes cuenta?{" "}
                    <Link
                        href="/register"
                        className="text-[#6B4071] font-semibold hover:underline"
                    >
                        Regístrate aquí
                    </Link>
                </div>
            </form>
        </>
    );
}