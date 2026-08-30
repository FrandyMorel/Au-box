"use client";

import { useState } from "react";

export default function LoginForm() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        console.log({
            email,
            password,
        });
    }

    return (
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
                    required
                    className="
                        w-full
                        rounded-lg
                        border
                        px-4
                        py-3
                        outline-none
                        focus:ring-2
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
                    required
                    className="
                        w-full
                        rounded-lg
                        border
                        px-4
                        py-3
                        outline-none
                        focus:ring-2
                    "
                />

            </div>

            {/* Submit */}
            <button
                type="submit"
                className="
                    w-full
                    rounded-lg
                    px-4
                    py-3
                    font-medium
                    transition
                    hover:opacity-90
                "
            >
                Iniciar sesión
            </button>

        </form>
    );
}

