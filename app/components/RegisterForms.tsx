"use client";

import { useState } from "react";
import { register } from "@/app/lib/api/auth";

export default function RegisterForm() {

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        try {

            const response = await register({
                email,
                name,
                department,
                password,
            });

            console.log("Registro exitoso:", response);

        } catch (error) {

            console.error("Error al registrarse:", error);

        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
        >

            {/* Nombre */}
            <div className="flex flex-col gap-2">

                <label htmlFor="name">
                    Nombre
                </label>

                <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                        setName(event.target.value)
                    }
                    placeholder="Tu nombre"
                    autoComplete="name"
                    minLength={2}
                    required
                />

            </div>


            {/* Email */}
            <div className="flex flex-col gap-2">

                <label htmlFor="email">
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
                />

            </div>


            {/* Departamento */}
            <div className="flex flex-col gap-2">

                <label htmlFor="department">
                    Departamento
                </label>

                <input
                    id="department"
                    name="department"
                    type="text"
                    value={department}
                    onChange={(event) =>
                        setDepartment(event.target.value)
                    }
                    placeholder="Ej. IT"
                    minLength={2}
                    required
                />

            </div>


            {/* Password */}
            <div className="flex flex-col gap-2">

                <label htmlFor="password">
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
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    minLength={8}
                    required
                />

            </div>


            {/* Submit */}
            <button
                type="submit"
                className="w-full rounded-lg px-4 py-3"
            >
                Crear cuenta
            </button>

        </form>
    );
}