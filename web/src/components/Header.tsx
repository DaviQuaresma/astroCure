"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const routes = [
  { href: "/", label: "Início" },
  { href: "/admin/group-post", label: "Postar Vídeos" },
  { href: "/admin/manage-profiles", label: "Gerenciamento de Perfis" },
  { href: "/admin/endpoint", label: "Gerenciamento do AdsPower" },
  { href: "/admin/log-panel", label: "Logs" },
//   { href: "", label: "Configurações" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-gray-900 border-b border-gray-800 py-3">
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo bem à esquerda */}
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/Logotipos-05.png"
              alt="AstroCure Logo"
              width={150}
              height={40}
              className="h-18 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Menu à direita */}
        <ul className="flex items-center gap-6">
          {routes.map((route) => (
            <li key={route.href + route.label}>
              <Link
                href={route.href}
                className={`text-sm font-medium transition px-3 py-1 rounded-md ${
                  pathname === route.href
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                {route.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
