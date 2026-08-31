"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { itemSidebar } from "../lib/sidebar/itemsSidebar";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#88809C]">
      {/* Logo */}
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold  text-[#14243C]">
          AU-BOX
        </h1>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4">
        <div className="space-y-2">
          {itemSidebar.map((item) => {
            const isActive =
              pathname === item.link ||
              pathname.startsWith(`${item.link}/`);

            return (
              <Link
                key={item.id}
                href={item.link}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center">
                  {item.icon}
                </span>

                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Perfil */}
      <div className="border-t border-white/20 p-4">
        <Link
          href="/users"
          className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
            pathname === "/users" || pathname.startsWith("/users/")
              ? "bg-white/20 text-white"
              : "text-white hover:bg-white/10"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 32 32"
          >
            <path d="M0 0h32v32H0z" fill="none" />

            <path
              fill="#ffffff"
              d="M16 8a5 5 0 1 0 5 5a5 5 0 0 0-5-5"
            />

            <path
              fill="#ffffff"
              d="M16 2a14 14 0 1 0 14 14A14.016 14.016 0 0 0 16 2m7.993 22.926A5 5 0 0 0 19 20h-6a5 5 0 0 0-4.992 4.926a12 12 0 1 1 15.985 0"
            />
          </svg>

          <span>Perfil</span>
        </Link>
      </div>
    </aside>
  );
}