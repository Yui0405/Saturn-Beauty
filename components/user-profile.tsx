"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { User, CreditCard, ShoppingBag, Heart, Settings, LogOut, Upload, X, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react"
import { useWishlist } from "@/contexts/wishlist-context"
import { useCart } from "@/contexts/cart-context"
import ProductCard from "./product-card"; // Added the missing import

// Enhanced sample user data with realistic order history
const userData = {
  name: "María García",
  email: "maria.garcia@example.com",
  avatar: "/images/placeholder.svg?height=100&width=100",
  bio: "Amante de los cosméticos naturales y el cuidado de la piel. Siempre en busca de nuevos productos para mi rutina diaria.",
  address: {
    street: "Calle Belleza 123",
    city: "Madrid",
    postalCode: "28001",
    country: "España",
  },
  paymentMethods: [
    {
      id: 1,
      type: "Visa",
      lastFour: "4242",
      expiry: "12/25",
    },
  ],
  orders: [
    {
      id: "ORD-15847",
      date: "28/11/2024",
      total: 127.45,
      status: "Entregado",
      trackingNumber: "ES2024112800847",
      items: [
        {
          id: 1,
          name: "Soft Pinch Liquid Blush - Dewy Drop",
          price: 20.99,
          quantity: 1,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 2,
          name: "Hydrating Face Cream - 50ml",
          price: 34.99,
          quantity: 2,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 3,
          name: "Vitamin C Brightening Serum - 30ml",
          price: 42.99,
          quantity: 1,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 4,
          name: "Gentle Cleansing Foam - 150ml",
          price: 18.99,
          quantity: 1,
          image: "/placeholder.svg?height=60&width=60",
        },
      ],
    },
    {
      id: "ORD-15723",
      date: "15/11/2024",
      total: 89.97,
      status: "Entregado",
      trackingNumber: "ES2024111500723",
      items: [
        {
          id: 5,
          name: "Exfoliating Toner - 200ml",
          price: 26.99,
          quantity: 1,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 6,
          name: "Moisturizing Lip Balm - Set de 3",
          price: 15.99,
          quantity: 2,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 7,
          name: "Brightening Eye Cream - 15ml",
          price: 31.99,
          quantity: 1,
          image: "/placeholder.svg?height=60&width=60",
        },
      ],
    },
    {
      id: "ORD-15602",
      date: "02/11/2024",
      total: 156.48,
      status: "En proceso",
      trackingNumber: "ES2024110200602",
      estimatedDelivery: "05/12/2024",
      items: [
        {
          id: 8,
          name: "Nourishing Hair Oil - 100ml",
          price: 28.99,
          quantity: 1,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 9,
          name: "Hydrating Face Mist - 120ml",
          price: 19.99,
          quantity: 2,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 10,
          name: "Overnight Sleeping Mask - 75ml",
          price: 39.99,
          quantity: 1,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 11,
          name: "Soft Pinch Tinted Lip Oil - Berry Bliss",
          price: 19.99,
          quantity: 2,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 12,
          name: "Setting Powder - Translucent",
          price: 27.99,
          quantity: 1,
          image: "/placeholder.svg?height=60&width=60",
        },
      ],
    },
    {
      id: "ORD-15489",
      date: "18/10/2024",
      total: 73.96,
      status: "Entregado",
      trackingNumber: "ES2024101800489",
      items: [
        {
          id: 13,
          name: "Volumizing Mascara - Black",
          price: 22.99,
          quantity: 1,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 14,
          name: "Matte Liquid Lipstick - Rose Nude",
          price: 18.99,
          quantity: 1,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 15,
          name: "Eyebrow Pencil - Medium Brown",
          price: 15.99,
          quantity: 2,
          image: "/placeholder.svg?height=60&width=60",
        },
      ],
    },
    {
      id: "ORD-15321",
      date: "05/10/2024",
      total: 94.95,
      status: "Entregado",
      trackingNumber: "ES2024100500321",
      items: [
        {
          id: 16,
          name: "Hydrating Foundation - Medium",
          price: 32.99,
          quantity: 1,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 17,
          name: "Concealer Palette - Multi-tone",
          price: 24.99,
          quantity: 1,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 18,
          name: "Blush Brush - Professional",
          price: 16.99,
          quantity: 1,
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          id: 19,
          name: "Makeup Setting Spray - 100ml",
          price: 19.99,
          quantity: 1,
          image: "/placeholder.svg?height=60&width=60",
        },
      ],
    },
  ],
}

export default function UserProfile({ initialTab = "account" }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [user, setUser] = useState(userData)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState(userData)
  const [isLoading, setIsLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('visa')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlist()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6) // Mostrar 6 productos por página
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Calcular los productos a mostrar en la página actual
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = wishlistItems.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(wishlistItems.length / itemsPerPage)

  // Cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Resetear a la primera página cuando cambie la lista de deseos
  useEffect(() => {
    setCurrentPage(1)
  }, [wishlistItems.length])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      
      setEditedUser((prev) => {
        // Asegurarnos de que prev[parent] sea tratado como un objeto
        const parentValue = prev[parent as keyof typeof prev];
        const parentObject = parentValue && typeof parentValue === 'object' && !Array.isArray(parentValue)
          ? { ...parentValue }
          : {};
          
        return {
          ...prev,
          [parent]: {
            ...parentObject,
            [child]: value,
          },
        };
      });
    } else {
      setEditedUser((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
        setEditedUser((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = () => {
    setIsLoading(true)

    setTimeout(() => {
      if (typeof window !== "undefined" && avatarPreview) {
        localStorage.setItem("userAvatar", avatarPreview)
        window.dispatchEvent(new Event("storage"))
      }

      setUser(editedUser)
      setIsEditing(false)
      setIsLoading(false)
      setAvatarPreview(null)
      toast({
        title: "Perfil actualizado",
        description: "Tus cambios han sido guardados correctamente.",
      })
    }, 1500)
  }

  const handleLogout = () => {
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Entregado":
        return "text-green-600"
      case "En proceso":
        return "text-blue-600"
      case "Enviado":
        return "text-orange-600"
      case "Cancelado":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 bg-mint-green-light p-1 rounded-md">
          <TabsTrigger 
            value="account" 
            className="flex items-center gap-2 font-poppins data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-mint-green-dark"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Cuenta</span>
          </TabsTrigger>
          <TabsTrigger 
            value="orders" 
            className="flex items-center gap-2 font-poppins data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-mint-green-dark"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Pedidos</span>
          </TabsTrigger>
          <TabsTrigger 
            value="wishlist" 
            className="flex items-center gap-2 font-poppins data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-mint-green-dark"
          >
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Favoritos</span>
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex items-center gap-2 font-poppins data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-mint-green-dark"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Ajustes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wishlist">
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-mint-green-dark">Mis Favoritos</CardTitle>
              <CardDescription className="font-poppins">
                Tus productos guardados para más tarde.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {wishlistItems.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Tu lista de deseos está vacía</h3>
                  <p className="text-gray-500 mb-6">Guarda productos que te gusten para encontrarlos fácilmente más tarde.</p>
                  <Button 
                    onClick={() => setActiveTab("account")} 
                    className="bg-mint-green hover:bg-accent-green hover:text-mint-green font-poppins"
                  >
                    Seguir comprando
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentItems.map((item) => (
                      <div key={item.id} className="relative group">
                        <ProductCard 
                          product={{
                            ...item,
                            rating: item.rating || 4.5,
                            category: item.category || '',
                          }}
                          className="h-full"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeFromWishlist(item.id);
                          }}
                          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-red-500 transition-colors shadow-md"
                          aria-label="Eliminar de favoritos"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Controles de paginación */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-4 sm:mb-0">
                        <p className="text-sm text-gray-600">
                          Página {currentPage} de {totalPages}
                        </p>
                        <p className="text-sm text-gray-500">
                          ({indexOfFirstItem + 1}-{Math.min(indexOfLastItem, wishlistItems.length)} de {wishlistItems.length} productos)
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => paginate(1)}
                            disabled={currentPage === 1}
                            className="hidden sm:flex"
                          >
                            Primera
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="h-9 px-3"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="h-9 px-3"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => paginate(totalPages)}
                            disabled={currentPage === totalPages}
                            className="hidden sm:flex"
                          >
                            Última
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold leading-none tracking-tight font-playfair text-mint-green-dark">Información de la Cuenta</CardTitle>
              <CardDescription className="font-poppins">Gestiona tu información personal y dirección.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 flex flex-col items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <div className="relative">
                    <Avatar className="h-32 w-32 mb-4 cursor-pointer" onClick={handleAvatarClick}>
                      <AvatarImage src={isEditing ? avatarPreview || editedUser.avatar : user.avatar} alt={user.name} />
                      <AvatarFallback>
                        <User className="h-16 w-16" />
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div
                        className="absolute bottom-4 right-0 bg-mint-green rounded-full p-1 cursor-pointer"
                        onClick={handleAvatarClick}
                      >
                        <Upload className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(true)} 
                      className="w-full font-poppins border-mint-green text-mint-green-dark hover:bg-mint-green/10 hover:text-mint-green-dark transition-colors"
                    >
                      Editar Perfil
                    </Button>
                  ) : (
                    <div className="space-y-2 w-full">
                      <Button
                        onClick={handleSaveProfile}
                        className="w-full bg-mint-green text-mint-green-dark font-poppins"
                        disabled={isLoading}
                      >
                        {isLoading ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setEditedUser(user)
                          setAvatarPreview(null)
                        }}
                        className="w-full font-poppins border-gray-300 text-gray-700"
                        disabled={isLoading}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>

                <div className="md:w-2/3">
                  {!isEditing ? (
                    <div className="space-y-4 font-poppins">
                      <div>
                        <h3 className="font-medium text-mint-green-dark">Nombre</h3>
                        <p>{user.name}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-mint-green-dark">Correo Electrónico</h3>
                        <p>{user.email}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-mint-green-dark">Biografía</h3>
                        <p>{user.bio}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-500">Dirección</h3>
                        <p>{user.address.street}</p>
                        <p>
                          {user.address.city}, {user.address.postalCode}
                        </p>
                        <p>{user.address.country}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-poppins">
                          Nombre
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={editedUser.name}
                          onChange={handleInputChange}
                          className="font-poppins"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-poppins">
                          Correo Electrónico
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={editedUser.email}
                          onChange={handleInputChange}
                          className="font-poppins"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio" className="font-poppins">
                          Biografía
                        </Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={editedUser.bio}
                          onChange={handleInputChange}
                          rows={3}
                          className="font-poppins"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address.street" className="font-poppins">
                          Calle
                        </Label>
                        <Input
                          id="address.street"
                          name="address.street"
                          value={editedUser.address.street}
                          onChange={handleInputChange}
                          className="font-poppins"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="address.city" className="font-poppins">
                            Ciudad
                          </Label>
                          <Input
                            id="address.city"
                            name="address.city"
                            value={editedUser.address.city}
                            onChange={handleInputChange}
                            className="font-poppins"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address.postalCode" className="font-poppins">
                            Código Postal
                          </Label>
                          <Input
                            id="address.postalCode"
                            name="address.postalCode"
                            value={editedUser.address.postalCode}
                            onChange={handleInputChange}
                            className="font-poppins"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address.country" className="font-poppins">
                          País
                        </Label>
                        <Input
                          id="address.country"
                          name="address.country"
                          value={editedUser.address.country}
                          onChange={handleInputChange}
                          className="font-poppins"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold leading-none tracking-tight font-playfair text-mint-green-dark">Métodos de Pago</CardTitle>
              <CardDescription className="font-poppins">Gestiona tus tarjetas y métodos de pago.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {user.paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-8 w-8 text-lavender-dark" />
                      <div className="font-poppins">
                        <p className="font-medium">
                          {method.type} •••• {method.lastFour}
                        </p>
                        <p className="text-sm text-gray-500">Expira: {method.expiry}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="font-poppins">
                      Eliminar
                    </Button>
                  </div>
                ))}

                <Button className="w-full bg-mint-green hover:bg-accent-green hover:text-mint-green font-poppins">
                  Añadir Nuevo Método de Pago
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold leading-none tracking-tight font-playfair text-mint-green-dark">Historial de Pedidos</CardTitle>
              <CardDescription className="font-poppins">Revisa tus pedidos anteriores y su estado.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {user.orders.map((order) => (
                  <div key={order.id} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-poppins">
                          <p className="font-medium">Pedido #{order.id}</p>
                          <p className="text-sm text-gray-500">Fecha: {order.date}</p>
                          {order.trackingNumber && (
                            <p className="text-sm text-gray-500">Seguimiento: {order.trackingNumber}</p>
                          )}
                          {order.estimatedDelivery && (
                            <p className="text-sm text-gray-500">Entrega estimada: {order.estimatedDelivery}</p>
                          )}
                        </div>
                        <div className="text-right font-poppins">
                          <p className="font-medium">${order.total.toFixed(2)}</p>
                          <p className={`text-sm ${getStatusColor(order.status)}`}>{order.status}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium mb-3 font-playfair text-mint-green-dark">Productos ({order.items.length})</h4>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded border">
                              <Image
                                src={item.image || "/images/placeholder.svg"}
                                alt={item.name}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 font-poppins">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                Cantidad: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-medium font-poppins">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="font-poppins">
                          Ver Detalles
                        </Button>
                        {order.status === "Entregado" && (
                          <Button variant="outline" size="sm" className="font-poppins">
                            Recomprar
                          </Button>
                        )}
                      </div>
                      {order.trackingNumber && (
                        <Button variant="link" size="sm" className="font-poppins text-mint-green">
                          Rastrear Pedido
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair">Mi Wishlist</CardTitle>
              <CardDescription className="font-poppins">Productos que has marcado como favoritos.</CardDescription>
            </CardHeader>
            <CardContent>
              {wishlistItems.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-900 font-playfair">Tu wishlist está vacía</p>
                  <p className="text-sm text-gray-500 mb-4 font-poppins">
                    Marca productos como favoritos para verlos aquí
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/productos")}
                    className="bg-mint-green hover:bg-accent-green hover:text-mint-green font-poppins"
                  >
                    Explorar productos
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlistItems.map((product) => (
                    <div key={product.id} className="border rounded-lg overflow-hidden">
                      <div className="relative h-40">
                        <Image
                          src={product.image || "/images/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium font-poppins">{product.name}</h3>
                        <p className="text-gray-500 font-poppins">${product.price.toFixed(2)}</p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-mint-green text-white hover:bg-accent-green hover:text-mint-green border-none font-poppins"
                            onClick={() => addItem(product)}
                          >
                            Añadir al Carrito
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-red-300 text-red-500 hover:bg-red-50 font-poppins"
                            onClick={() => removeFromWishlist(product.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-mint-green-dark">Ajustes de la Cuenta</CardTitle>
              <CardDescription className="font-poppins">Gestiona tus preferencias y seguridad.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="font-medium mb-4 font-playfair text-mint-green-dark">Métodos de Pago</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <button
                      type="button"
                      className={`p-4 border-2 rounded-lg transition-colors ${
                        paymentMethod === 'visa' 
                          ? 'border-mint-green-dark bg-mint-green-light/30' 
                          : 'border-gray-200 hover:border-mint-green hover:bg-mint-green-light/10'
                      }`}
                      onClick={() => setPaymentMethod('visa')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white font-bold text-xs">VISA</span>
                        </div>
                        <span className="font-medium">Terminada en 4242</span>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      className={`p-4 border-2 rounded-lg transition-colors ${
                        paymentMethod === 'mastercard' 
                          ? 'border-mint-green-dark bg-mint-green-light/30' 
                          : 'border-gray-200 hover:border-mint-green hover:bg-mint-green-light/10'
                      }`}
                      onClick={() => setPaymentMethod('mastercard')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-6 bg-orange-500 rounded flex items-center justify-center">
                          <span className="text-white font-bold text-xs">MC</span>
                        </div>
                        <span className="font-medium">Terminada en 1234</span>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      className={`p-4 border-2 rounded-lg transition-colors ${
                        paymentMethod === 'paypal' 
                          ? 'border-mint-green-dark bg-mint-green-light/30' 
                          : 'border-gray-200 hover:border-mint-green hover:bg-mint-green-light/10'
                      }`}
                      onClick={() => setPaymentMethod('paypal')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-6 bg-blue-700 rounded flex items-center justify-center">
                          <span className="text-white font-bold text-xs">PP</span>
                        </div>
                        <span className="font-medium">usuario@paypal.com</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4 font-playfair">Cambiar Contraseña</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="font-poppins">
                        Contraseña Actual
                      </Label>
                      <div className="relative">
                        <Input 
                          id="current-password" 
                          type={showCurrentPassword ? "text" : "password"} 
                          className="font-poppins pr-10" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="font-poppins">
                        Nueva Contraseña
                      </Label>
                      <div className="relative">
                        <Input 
                          id="new-password" 
                          type={showNewPassword ? "text" : "password"} 
                          className="font-poppins pr-10" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="font-poppins">
                        Confirmar Nueva Contraseña
                      </Label>
                      <div className="relative">
                        <Input 
                          id="confirm-password" 
                          type={showConfirmPassword ? "text" : "password"} 
                          className="font-poppins pr-10" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button className="bg-mint-green hover:bg-accent-green hover:text-mint-green font-poppins">
                      Cambiar Contraseña
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4 font-playfair text-mint-green-dark">Notificaciones</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications" className="font-poppins cursor-pointer">
                          Notificaciones por Email
                        </Label>
                        <p className="text-sm text-muted-foreground">Recibe notificaciones importantes sobre tu cuenta</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" id="email-notifications" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mint-green-dark"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketing-emails" className="font-poppins cursor-pointer">
                          Emails de Marketing
                        </Label>
                        <p className="text-sm text-muted-foreground">Recibe ofertas y promociones especiales</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" id="marketing-emails" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mint-green-dark"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="order-updates" className="font-poppins cursor-pointer">
                          Actualizaciones de Pedidos
                        </Label>
                        <p className="text-sm text-muted-foreground">Recibe actualizaciones sobre tus pedidos</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" id="order-updates" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mint-green-dark"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4 font-playfair text-mint-green-dark">Cerrar Sesión</h3>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-500 hover:bg-red-50 font-poppins"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
