"use client";

import { useState } from "react";

import { changePassword } from "@/app/lib/api/users";

interface ChangePasswordFormProps {
  onSuccess?: (message: string) => void;
  onCancel?: () => void;
}

export default function ChangePasswordForm({
  onSuccess,
  onCancel,
}: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (newPassword.length < 8) {
      setError(
        "La nueva contraseña debe tener al menos 8 caracteres",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "La nueva contraseña y la confirmación no coinciden",
      );
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "La nueva contraseña debe ser diferente a la actual",
      );
      return;
    }

    try {
      setLoading(true);

      const response = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      onSuccess?.(response.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cambiar la contraseña",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* CONTRASEÑA ACTUAL */}

      <div>
        <label
          htmlFor="currentPassword"
          className="mb-2 block text-sm font-medium"
        >
          Contraseña actual
        </label>

        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(event) =>
            setCurrentPassword(event.target.value)
          }
          disabled={loading}
          required
          className="w-full rounded-lg border px-4 py-3"
        />
      </div>

      {/* NUEVA CONTRASEÑA */}

      <div>
        <label
          htmlFor="newPassword"
          className="mb-2 block text-sm font-medium"
        >
          Nueva contraseña
        </label>

        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(event) =>
            setNewPassword(event.target.value)
          }
          minLength={8}
          disabled={loading}
          required
          className="w-full rounded-lg border px-4 py-3"
        />

        <p className="mt-1 text-xs text-gray-500">
          Mínimo 8 caracteres.
        </p>
      </div>

      {/* CONFIRMAR */}

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium"
        >
          Confirmar nueva contraseña
        </label>

        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(event.target.value)
          }
          minLength={8}
          disabled={loading}
          required
          className="w-full rounded-lg border px-4 py-3"
        />
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* BOTONES */}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm text-white disabled:opacity-50"
        >
          {loading
            ? "Cambiando..."
            : "Cambiar contraseña"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border px-5 py-3 text-sm"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}