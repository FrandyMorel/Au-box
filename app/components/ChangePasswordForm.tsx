"use client";

import { useState } from "react";
import Swal from "sweetalert2";
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (newPassword.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Validación",
        text: "La nueva contraseña debe tener al menos 8 caracteres",
        confirmButtonColor: "#6B4071",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Validación",
        text: "La nueva contraseña y la confirmación no coinciden",
        confirmButtonColor: "#6B4071",
      });
      return;
    }

    if (currentPassword === newPassword) {
      Swal.fire({
        icon: "error",
        title: "Validación",
        text: "La nueva contraseña debe ser diferente a la actual",
        confirmButtonColor: "#6B4071",
      });
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

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: response.message || "Contraseña actualizada correctamente",
        confirmButtonColor: "#6B4071",
        timer: 2000,
        timerProgressBar: true,
      });

      onSuccess?.(response.message || "Contraseña actualizada correctamente");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "No se pudo cambiar la contraseña";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#6B4071",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3"
    >
      {/* CONTRASEÑA ACTUAL */}
      <div>
        <label
          htmlFor="currentPassword"
          className="mb-1 block text-xs font-medium"
        >
          Contraseña actual
          <span className="text-red-600 ml-1">*</span>
        </label>

        <div className="relative">
          <input
            id="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(event) =>
              setCurrentPassword(event.target.value)
            }
            disabled={loading}
            required
            placeholder="••••••••"
            className="
              w-full
              rounded-lg
              bg-[#E9DBD7]
              border border-[#14243C]
              px-3
              py-2
              pr-10
              text-sm
              outline-none
              focus:ring-2
              focus:ring-[#6B4071]
              focus:border-transparent
              disabled:opacity-50
              transition
            "
          />
          <button
            type="button"
            onClick={() =>
              setShowCurrentPassword(!showCurrentPassword)
            }
            disabled={loading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6b4071] hover:opacity-70 transition disabled:opacity-50"
          >
            {showCurrentPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 16 16"
                className="w-4 h-4"
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
                className="w-4 h-4"
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

      {/* NUEVA CONTRASEÑA Y CONFIRMACIÓN - GRID 2 COLUMNAS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* NUEVA CONTRASEÑA */}
        <div>
          <label
            htmlFor="newPassword"
            className="mb-1 block text-xs font-medium"
          >
            Nueva contraseña
            <span className="text-red-600 ml-1">*</span>
          </label>

          <div className="relative">
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              minLength={8}
              disabled={loading}
              required
              placeholder="••••••••"
              className="
                w-full
                rounded-lg
                bg-[#E9DBD7]
                border border-[#14243C]
                px-3
                py-2
                pr-10
                text-sm
                outline-none
                focus:ring-2
                focus:ring-[#6B4071]
                focus:border-transparent
                disabled:opacity-50
                transition
              "
            />
            <button
              type="button"
              onClick={() =>
                setShowNewPassword(!showNewPassword)
              }
              disabled={loading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6b4071] hover:opacity-70 transition disabled:opacity-50"
            >
              {showNewPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 16 16"
                  className="w-4 h-4"
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
                  className="w-4 h-4"
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
          <p className="mt-1 text-xs text-gray-600">
            Mínimo 8 caracteres
          </p>
        </div>

        {/* CONFIRMAR */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-xs font-medium"
          >
            Confirmar contraseña
            <span className="text-red-600 ml-1">*</span>
          </label>

          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              minLength={8}
              disabled={loading}
              required
              placeholder="••••••••"
              className="
                w-full
                rounded-lg
                bg-[#E9DBD7]
                border border-[#14243C]
                px-3
                py-2
                pr-10
                text-sm
                outline-none
                focus:ring-2
                focus:ring-[#6B4071]
                focus:border-transparent
                disabled:opacity-50
                transition
              "
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              disabled={loading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6b4071] hover:opacity-70 transition disabled:opacity-50"
            >
              {showConfirmPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 16 16"
                  className="w-4 h-4"
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
                  className="w-4 h-4"
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
      </div>

      {/* BOTONES */}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="buttonPrimary px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Cambiando..." : "Cambiar contraseña"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="buttonSecondary px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}