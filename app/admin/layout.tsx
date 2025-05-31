"use client";

import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  LuLayoutDashboard,
  LuUsers,
  LuBox,
  LuNewspaper,
  LuLightbulb,
  LuShoppingCart,
  LuLogOut,
  LuUser,
} from "react-icons/lu";
import { useAuth } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isAdmin: isAdminUser, logout } = useAuth();

  // Redirect if not admin
  useEffect(() => {
    if (!isAdminUser) {
      redirect("/login");
    }
  }, [isAdminUser]);

  // Handle logout
  const handleLogout = () => {
    logout();
    redirect("/login");
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isLinkActive = (href: string) => {
    if (href === "/admin") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white min-h-screen shadow-md fixed left-0 top-0 z-10">
        <div className="p-6 border-b logoAdmin">
          <h2 className="text-4xl font-bold text-white font-dancing-script">
            Saturn Beauty
          </h2>
          <p className="text-xs text-mint-green-light mt-1">
            Panel de Administración
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6">
          <Link
            href="/admin"
            className={`flex items-center px-6 py-3 transition-colors ${
              isLinkActive("/admin")
                ? "bg-lavender-light text-lavender-dark font-medium border-r-4 border-lavender-dark"
                : "text-gray-700 hover:bg-lavender-light hover:text-lavender-dark"
            }`}
          >
            <LuLayoutDashboard className="mr-3" />
            Panel de Control
          </Link>
          <Link
            href="/admin/usuarios"
            className={`flex items-center px-6 py-3 transition-colors ${
              isLinkActive("/admin/usuarios")
                ? "bg-lavender-light text-lavender-dark font-medium border-r-4 border-lavender-dark"
                : "text-gray-700 hover:bg-lavender-light hover:text-lavender-dark"
            }`}
          >
            <LuUsers className="mr-3" />
            Usuarios
          </Link>
          <Link
            href="/admin/productos"
            className={`flex items-center px-6 py-3 transition-colors ${
              isLinkActive("/admin/productos")
                ? "bg-lavender-light text-lavender-dark font-medium border-r-4 border-lavender-dark"
                : "text-gray-700 hover:bg-lavender-light hover:text-lavender-dark"
            }`}
          >
            <LuBox className="mr-3" />
            Productos
          </Link>
          <Link
            href="/admin/pedidos"
            className={`flex items-center px-6 py-3 transition-colors ${
              isLinkActive("/admin/pedidos")
                ? "bg-lavender-light text-lavender-dark font-medium border-r-4 border-lavender-dark"
                : "text-gray-700 hover:bg-lavender-light hover:text-lavender-dark"
            }`}
          >
            <LuShoppingCart className="mr-3" />
            Pedidos
          </Link>
          <Link
            href="/admin/noticias"
            className={`flex items-center px-6 py-3 transition-colors ${
              isLinkActive("/admin/noticias")
                ? "bg-lavender-light text-lavender-dark font-medium border-r-4 border-lavender-dark"
                : "text-gray-700 hover:bg-lavender-light hover:text-lavender-dark"
            }`}
          >
            <LuNewspaper className="mr-3" />
            Noticias
          </Link>
          <Link
            href="/admin/consejos"
            className={`flex items-center px-6 py-3 transition-colors ${
              isLinkActive("/admin/consejos")
                ? "bg-lavender-light text-lavender-dark font-medium border-r-4 border-lavender-dark"
                : "text-gray-700 hover:bg-lavender-light hover:text-lavender-dark"
            }`}
          >
            <LuLightbulb className="mr-3" />
            Consejos
          </Link>
        </nav>

        {/* Logout button at the bottom */}
        <div className="absolute bottom-0 w-full p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-lavender-light hover:text-lavender-dark transition-colors w-full"
          >
            <LuLogOut className="mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-6">{children}</div>
    </div>
  );
}
