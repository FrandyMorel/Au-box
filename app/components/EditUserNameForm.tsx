"use client";

import { useState } from "react";

import { updateUserName } from "@/app/lib/api/users";
import type { User } from "@/app/lib/api/types";

interface EditUserNameFormProps {
  currentName: string;
  onUpdated: (user: User) => void;
  onCancel: () => void;
}

export default function EditUserNameForm({
  currentName,
  onUpdated,
  onCancel,
}: EditUserNameFormProps) {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("El nombre no puede estar vacío");
      return;
    }

    if (trimmedName.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await updateUserName({
        name: trimmedName,
      });

      const updatedUser: User = {
        id: response.id,
        name: response.name,
        email: response.email,
        department: response.department,
        updatedAt: response.updatedAt,
        createdAt: "",
      };

      // Actualizar localStorage
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsedUser,
              name: response.name,
            }),
          );
        } catch {
          // Ignorar datos inválidos de localStorage
        }
      }

      onUpdated(updatedUser);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el nombre",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2"
    >
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={100}
        disabled={loading}
        autoFocus
        className="w-full rounded-lg border px-4 py-2"
      />

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}