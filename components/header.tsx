"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Bell,
  ShoppingCart,
  Menu,
  X,
  Search,
  LogIn,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/cart-context";
import Cart from "@/components/cart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationsPanel from "@/components/notifications-panel";
import { useNotifications } from "@/contexts/notification-context";
import { useAuth } from "@/lib/auth";

// Obtener la foto de perfil del usuario (simulado)
const getUserAvatar = () => {
  // En una aplicación real, esto vendría de un contexto de autenticación
  // o de una llamada a la API
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("userAvatar") ||
      "/placeholder.svg?height=40&width=40"
    );
  }
  return "/placeholder.svg?height=40&width=40";
};

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems, toggleCart } = useCart();
  const [userAvatar, setUserAvatar] = useState(
    "/placeholder.svg?height=40&width=40"
  );
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);

  const { isAuthenticated, isAdmin, login, logout, session } = useAuth();
  const userName = session?.username || "";

  const handleLogout = () => {
    logout();
    // Redirigir a la página de inicio
    window.location.href = "/";
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    // Obtener avatar del usuario
    setUserAvatar(getUserAvatar());

    // Escuchar cambios en el avatar
    const handleStorageChange = () => {
      setUserAvatar(getUserAvatar());
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Productos", href: "/productos" },
    { name: "Comunidad", href: "/comunidad" },
    { name: "Sobre Nosotros", href: "/sobre-nosotros" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar búsqueda
    console.log("Buscando:", searchQuery);
    setSearchOpen(false);
  };

  // Añadir una función para abrir/cerrar el panel de notificaciones
  // Añadir después de otras funciones como handleSearch
  const toggleNotificationsPanel = () => {
    setNotificationsPanelOpen(!notificationsPanelOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-white border-b border-divider-color">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="w-1/4 flex justify-start">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-mint-green-dark" />
              ) : (
                <Menu className="h-6 w-6 text-mint-green-dark" />
              )}
            </Button>
          </div>

          <div className="w-2/4 flex justify-center">
            <Link
              href="/"
              className="text-4xl font-bold text-lavender font-dancing-script hover:text-lavender-dark transition-colors"
            >
              Saturn Beauty
            </Link>
          </div>

          <div className="w-1/4 flex items-center justify-end space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-6 w-6 text-mint-green-dark" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hidden md:flex"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={userAvatar || "/placeholder.svg"}
                      alt="Avatar del usuario"
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/perfil" className="w-full">
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/perfil?tab=orders" className="w-full">
                    Mis Pedidos
                  </Link>
                </DropdownMenuItem>
                {/* Añadir enlace a la página de administración si el usuario es admin */}
                {isAdmin && (
                  <DropdownMenuItem>
                    <Link href="/admin" className="w-full">
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                {/* Mostrar opción de cerrar sesión si el usuario está autenticado */}
                {isAuthenticated ? (
                  <DropdownMenuItem onClick={handleLogout}>
                    Cerrar Sesión
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem>
                    <Link href="/login" className="w-full">
                      Iniciar Sesión
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Modificar el botón de notificaciones para que abra el panel */}
            {/* Reemplazar el botón de notificaciones en la sección de iconos del header */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden md:flex"
              onClick={toggleNotificationsPanel}
            >
              <Bell className="h-6 w-6 text-mint-green-dark" />
              {/* Replace notificationCount with unreadCount in both desktop and mobile notification buttons */}
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-accent-green text-mint-green-dark text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={toggleCart}
            >
              <ShoppingCart className="h-6 w-6 text-mint-green-dark" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-accent-green text-mint-green-dark text-xs">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="bg-white py-2 px-4 border-t border-divider-color">
          <form
            onSubmit={handleSearch}
            className="container mx-auto flex gap-2"
          >
            <Input
              type="search"
              placeholder="Buscar productos o usuarios..."
              className="flex-grow font-poppins"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <Button
              type="submit"
              className="bg-mint-green hover:bg-accent-green hover:text-mint-green font-poppins"
            >
              Buscar
            </Button>
          </form>
        </div>
      )}

      <nav
        className={`bg-white border-b border-divider-color ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="hidden md:flex items-center justify-center space-x-8 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`nav-link text-base font-medium py-2 font-poppins ${
                  pathname === link.href ? "active" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3">
              <div className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`nav-link text-base font-medium py-2 font-poppins ${
                      pathname === link.href ? "active" : ""
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="ghost" size="icon" className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={userAvatar || "/placeholder.svg"}
                        alt="Avatar del usuario"
                      />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                  {/* Modificar también el botón de notificaciones en el menú móvil */}
                  {/* Reemplazar el botón de notificaciones en la sección del menú móvil */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={toggleNotificationsPanel}
                  >
                    <Bell className="h-6 w-6 text-mint-green-dark" />
                    {/* Replace notificationCount with unreadCount in both desktop and mobile notification buttons */}
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-accent-green text-mint-green-dark text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Carrito */}
      <Cart />
      {/* Añadir el componente NotificationsPanel al final del componente, justo antes del cierre del return */}
      {/* Añadir antes de </header> */}
      <NotificationsPanel
        isOpen={notificationsPanelOpen}
        onClose={() => setNotificationsPanelOpen(false)}
      />
    </header>
  );
}
