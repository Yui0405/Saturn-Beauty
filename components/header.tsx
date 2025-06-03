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
import { useToast } from "@/hooks/use-toast";

// Obtener la foto de perfil del usuario desde la sesión
const getUserAvatar = (session: any) => {
  // Si hay una sesión activa y tiene avatar, usarlo
  if (session?.avatar) {
    return session.avatar;
  }
  
  // Si hay un avatar en localStorage, usarlo
  if (typeof window !== "undefined") {
    const storedAvatar = localStorage.getItem("userAvatar");
    if (storedAvatar) {
      return storedAvatar;
    }
  }
  
  // Usar una imagen por defecto si no hay avatar
  return "/images/users/default-avatar.png";
};

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems, toggleCart } = useCart();
  const { toast } = useToast();
  const [userAvatar, setUserAvatar] = useState(
    "/images/users/default-avatar.png"
  );
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);

  const { isAuthenticated, isAdmin, login, logout, session } = useAuth();
  const userName = session?.username || "";

  const handleLogout = () => {
    logout();
    // Redirigir a la página de inicio
    window.location.href = "/";
  };

  // Efecto para manejar el scroll y eventos de almacenamiento
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    const handleStorageChange = () => {
      setUserAvatar(getUserAvatar(session));
    };
    
    // Configurar event listeners
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("storage", handleStorageChange);
    
    // Limpiar event listeners al desmontar
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [session]); // Añadimos session como dependencia
  
  // Efecto para actualizar el avatar cuando cambia la sesión
  useEffect(() => {
    setUserAvatar(getUserAvatar(session));
  }, [session]);

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
              className="text-4xl font-bold text-lavender font-dancing-script"
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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={userAvatar} 
                        alt={session?.username || 'Usuario'}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-mint-green/20 text-mint-green">
                        {session?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session?.name || 'Usuario'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session?.email || ''}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="p-0"
                  onClick={(e) => {
                    if (!isAuthenticated) {
                      e.preventDefault();
                      toast({
                        title: "Inicia sesión",
                        description: "Debes iniciar sesión para acceder a tu perfil.",
                        action: (
                          <Button 
                            variant="outline" 
                            className="border-mint-green text-mint-green hover:bg-mint-green/10"
                            onClick={() => window.location.href = '/login'}
                          >
                            <LogIn className="h-4 w-4 mr-2" />
                            Iniciar sesión
                          </Button>
                        ),
                      });
                    }
                  }}
                >
                  <Link href={isAuthenticated ? "/perfil" : "#"} className="w-full px-2 py-1.5">
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    if (!isAuthenticated) {
                      e.preventDefault();
                      toast({
                        title: "Inicia sesión",
                        description: "Debes iniciar sesión para ver tus pedidos.",
                        action: (
                          <Button 
                            variant="outline" 
                            className="border-mint-green text-mint-green hover:bg-mint-green/10"
                            onClick={() => window.location.href = '/login'}
                          >
                            <LogIn className="h-4 w-4 mr-2" />
                            Iniciar sesión
                          </Button>
                        ),
                      });
                    }
                  }}
                >
                  <Link href={isAuthenticated ? "/perfil?tab=orders" : "#"} className="w-full">
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
