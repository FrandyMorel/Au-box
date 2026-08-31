"use client";

import { useEffect, useState } from "react";

import {
  getCurrentUser,
} from "@/app/lib/api/users";

import type { User } from "@/app/lib/api/types";

import UserProfile from "@/app/components/UserProfile";
import ChangePasswordForm from "@/app/components/ChangePasswordForm";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [changingPassword, setChangingPassword] =
    useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        setError("");

        const data = await getCurrentUser();

        setUser(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar la información del usuario",
        );
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  function handleUserUpdated(updatedUser: User) {
    setUser((current) =>
      current
        ? {
            ...current,
            name: updatedUser.name,
            updatedAt: updatedUser.updatedAt,
          }
        : current,
    );

    setSuccess("Nombre actualizado correctamente");
  }

  if (loading) {
    return (
      <main className="min-h-screen p-4 md:p-6" style={{ backgroundColor: "#E9DBD7" }}>
        <div className="mx-auto max-w-3xl">
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-sm text-gray-500">
              Cargando información del usuario...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen p-4 md:p-6" style={{ backgroundColor: "#E9DBD7" }}>
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-800">
              No se pudo cargar el usuario
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error ||
                "No se encontró la información del usuario."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-6" style={{ backgroundColor: "#E9DBD7" }}>
      <div className="mx-auto max-w-3xl space-y-4">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#6B4071" }}>
            Mi perfil
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Consulta y administra tu información personal.
          </p>
        </div>

        {/* MENSAJE DE ERROR */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* MENSAJE DE ÉXITO */}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* PERFIL */}
        <UserProfile
          user={user}
          onUserUpdated={handleUserUpdated}
        />

        {/* SEGURIDAD */}
        <section className="rounded-xl border bg-transparent p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold" style={{ color: "#6B4071" }}>
              Seguridad
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Cambia la contraseña de tu cuenta.
            </p>
          </div>

          {!changingPassword ? (
            <button
              type="button"
              onClick={() => {
                setChangingPassword(true);
                setSuccess("");
                setError("");
              }}
              className="buttonPrimary px-4 py-2 text-sm font-medium"
            >
              Cambiar contraseña
            </button>
          ) : (
            <ChangePasswordForm
              onSuccess={(message) => {
                setChangingPassword(false);
                setSuccess(message);
              }}
              onCancel={() => {
                setChangingPassword(false);
                setError("");
              }}
            />
          )}
        </section>
      </div>
    </main>
  );
}