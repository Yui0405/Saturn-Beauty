"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems, toggleCart } = useCart();
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);

  const { isAuthenticated, isAdmin, session, logout } = useAuth();
  const userName = session?.username || "Mi cuenta";
  const userAvatar = "/placeholder.svg?height=40&width=40";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Productos", href: "/productos" },
    { name: "Comunidad", href: "/comunidad" },
    { name: "Sobre Nosotros", href: "/sobre-nosotros" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Buscando:", searchQuery);
    setSearchOpen(false);
  };

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
              className="text-4xl font-bold text-lavender brand-title"
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
                    <AvatarImage src={userAvatar} alt="Avatar del usuario" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white p-2">
                <DropdownMenuLabel>{userName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/perfil"
                        className="flex items-center w-full cursor-pointer"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Mi Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/usuario/pedidos"
                        className="flex items-center w-full cursor-pointer"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span>Mis Pedidos</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin"
                          className="flex items-center w-full cursor-pointer"
                        >
                          <Menu className="mr-2 h-4 w-4" />
                          <span>Panel Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/login"
                      className="flex items-center w-full cursor-pointer"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      <span>Iniciar Sesión</span>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="relative hidden md:flex"
                onClick={toggleNotificationsPanel}
              >
                <Bell className="h-6 w-6 text-mint-green-dark" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-accent-green text-mint-green-dark text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            )}

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
                {isAuthenticated && (
                  <div className="flex justify-between pt-4 border-t">
                    <Link href="/perfil">
                      <Button variant="ghost" size="icon" className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={userAvatar}
                            alt="Avatar del usuario"
                          />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative"
                      onClick={toggleNotificationsPanel}
                    >
                      <Bell className="h-6 w-6 text-mint-green-dark" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 bg-accent-green text-mint-green-dark text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Carrito y Notificaciones */}
      <Cart />
      <NotificationsPanel
        isOpen={notificationsPanelOpen}
        onClose={() => setNotificationsPanelOpen(false)}
      />
    </header>
  );
}
