"use client";

import { useState } from "react";

import EditUserNameForm from "./EditUserNameForm";
import type { User } from "@/app/lib/api/types";

interface UserProfileProps {
  user: User;
  onUserUpdated: (user: User) => void;
}

export default function UserProfile({
  user,
  onUserUpdated,
}: UserProfileProps) {
  const [editingName, setEditingName] = useState(false);

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Información personal
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Información asociada a tu cuenta.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* NOMBRE */}
        <div>
          <p className="text-xs font-medium text-gray-500">
            Nombre
          </p>

          {!editingName ? (
            <>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {user.name}
              </p>

              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Editar nombre
              </button>
            </>
          ) : (
            <EditUserNameForm
              currentName={user.name}
              onUpdated={(updatedUser) => {
                onUserUpdated(updatedUser);
                setEditingName(false);
              }}
              onCancel={() => setEditingName(false)}
            />
          )}
        </div>

        {/* EMAIL */}
        <div>
          <p className="text-xs font-medium text-gray-500">
            Correo electrónico
          </p>

          <p className="mt-1 text-sm font-medium text-gray-900">
            {user.email}
          </p>
        </div>

        {/* DEPARTAMENTO */}
        <div>
          <p className="text-xs font-medium text-gray-500">
            Departamento
          </p>

          <p className="mt-1 text-sm font-medium text-gray-900">
            {user.department}
          </p>
        </div>

        {/* ID */}
        <div>
          <p className="text-xs font-medium text-gray-500">
            ID de usuario
          </p>

          <p className="mt-1 text-sm font-medium text-gray-900">
            #{user.id}
          </p>
        </div>
      </div>
    </section>
  );
}