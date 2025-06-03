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
import { User, CreditCard, ShoppingBag, Heart, Settings, LogOut, Upload, X, ChevronLeft, ChevronRight, Eye, EyeOff, PackageOpen } from "lucide-react"
import { useWishlist } from "@/contexts/wishlist-context"
import { useCart } from "@/contexts/cart-context"
import ProductCard from "./product-card"; 

export interface UserData {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  telefono: string;
  direccion: string;
  avatar: string;
  role: string;
  joinDate?: string;
  lastLogin?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethods?: any[];
  orders?: any[];
}

const defaultUserData: UserData = {
  id: '1',
  name: 'Luisa Rodríguez',
  username: 'luisa.rodriguez',
  email: 'luisa.rodriguez@email.com',
  bio: 'Enamorada de los productos de belleza',
  telefono: '+1234567897',
  direccion: 'Av. Las Flores #45-67, Ciudad',
  avatar: '/images/users/User3.jpg',
  role: 'user',
  address: {
    street: 'Av. Las Flores #45-67',
    city: 'Ciudad',
    postalCode: '',
    country: 'España',
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
  const [user, setUser] = useState<UserData>(defaultUserData)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<UserData>(defaultUserData)
  const [isLoading, setIsLoading] = useState(true)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('visa')
  
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        

        let currentUser = typeof window !== 'undefined' ? 
          JSON.parse(localStorage.getItem('currentUser') || '{}') : null;
        

        if (!currentUser?.id) {
          console.log('No user logged in, using default user');
          currentUser = defaultUserData;

          if (typeof window !== 'undefined') {
            localStorage.setItem('currentUser', JSON.stringify(defaultUserData));
          }
        }


        const storedUsers = localStorage.getItem('saturn-users');
        let userData = null;

        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const foundUser = users.find((u: any) => u.id === currentUser.id);
          if (foundUser) {
            userData = formatUserData(foundUser);
          }
        }

        if (!userData) {
          try {
            const response = await fetch('/data/users.json');
            if (response.ok) {
              const data = await response.json();
              const userFromJson = data.users.find((u: any) => u.id.toString() === currentUser.id.toString());
              
              if (userFromJson) {
                userData = {
                  ...defaultUserData,
                  ...userFromJson,
                  name: userFromJson.name || currentUser.name || '',
                  email: userFromJson.email || currentUser.email || '',
                  username: userFromJson.username || currentUser.username || '',
                  avatar: userFromJson.avatar || currentUser.avatar || defaultUserData.avatar
                };
              }
            }
          } catch (error) {
            console.error('Error loading user data from JSON:', error);
          }
        }

        if (!userData) {
          userData = {
            ...defaultUserData,
            id: currentUser.id,
            name: currentUser.name || '',
            email: currentUser.email || '',
            username: currentUser.username || '',
            avatar: currentUser.avatar || defaultUserData.avatar
          };
        }

        setUser(userData);
        setEditedUser(userData);
        
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del usuario.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    const formatUserData = (userData: any) => {
      const savedUserData = typeof window !== 'undefined' ? 
        JSON.parse(localStorage.getItem(`user_${userData.id}`) || '{}') : {};
      
      return {
        ...defaultUserData,
        ...userData,
        ...savedUserData,
        id: userData.id,

        address: {
          street: '',
          city: '',
          postalCode: '',
          country: 'España',
          ...(savedUserData.address || {}),
          ...(userData.address || {})
        },

        direccion: savedUserData.direccion || userData.direccion || ''
      };
    };
    
    loadUserData();
  }, []);
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlist()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6) 
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = wishlistItems.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(wishlistItems.length / itemsPerPage)


  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  

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

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      

      const currentUser = typeof window !== 'undefined' ? 
        JSON.parse(localStorage.getItem('currentUser') || '{}') : null;
      
      if (!currentUser?.id) {
        throw new Error('No user is logged in');
      }

      const userToSave = { ...editedUser };

      if (avatarPreview) {
        const avatarKey = `user_${currentUser.id}_avatar`;
        localStorage.setItem(avatarKey, avatarPreview);
        userToSave.avatar = avatarPreview;
      }
      
      const storedUsers = localStorage.getItem('saturn-users');
      let users = [];
      
      if (storedUsers) {
        users = JSON.parse(storedUsers);
        const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
        
        if (userIndex !== -1) {
          users[userIndex] = {
            ...users[userIndex],
            ...userToSave,
            password: users[userIndex].password
          };
        } else {
          users.push(userToSave);
        }
      } else {
        users = [userToSave];
      }
      
      localStorage.setItem('saturn-users', JSON.stringify(users));
      localStorage.setItem(`user_${currentUser.id}`, JSON.stringify({
        ...userToSave,
        password: undefined
      }));
      
      if (currentUser.id === userToSave.id) {
        localStorage.setItem('currentUser', JSON.stringify({
          ...currentUser,
          name: userToSave.name,
          email: userToSave.email,
          avatar: userToSave.avatar
        }));
      }
      setUser(userToSave);
      toast({
        title: "Perfil actualizado",
        description: "Tus cambios se han guardado correctamente.",
        variant: "default"
      });
      setIsEditing(false);
      setAvatarPreview(null);
      window.dispatchEvent(new Event('storage'));
      
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la información del perfil. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                            rating: item.rating,
                            category: item.category,
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
                        <p data-component-name="UserProfile">{isLoading ? 'Cargando...' : user.name || 'No disponible'}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-mint-green-dark">Correo Electrónico</h3>
                        <p data-component-name="UserProfile">{isLoading ? 'Cargando...' : user.email || 'No disponible'}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-mint-green-dark">Teléfono</h3>
                        <p data-component-name="UserProfile">{isLoading ? 'Cargando...' : user.telefono || 'No especificado'}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-mint-green-dark">Usuario</h3>
                        <p>@{user.username || 'usuario'}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-mint-green-dark">Biografía</h3>
                        <p className="whitespace-pre-line">{isLoading ? 'Cargando...' : user.bio || 'No hay biografía'}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-mint-green-dark">Dirección</h3>
                        {isLoading ? (
                          <p>Cargando...</p>
                        ) : user.address?.street || user.direccion ? (
                          <div>
                            <p>{user.address?.street || user.direccion}</p>
                            {user.address?.city && user.address?.postalCode && (
                              <p>{user.address.city}, {user.address.postalCode}</p>
                            )}
                            {user.address?.country && <p>{user.address.country}</p>}
                          </div>
                        ) : (
                          <p>No se ha especificado una dirección</p>
                        )}
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
                        <Label htmlFor="telefono" className="font-poppins">
                          Teléfono
                        </Label>
                        <Input
                          id="telefono"
                          name="telefono"
                          type="tel"
                          value={editedUser.telefono || ''}
                          onChange={handleInputChange}
                          className="font-poppins"
                          placeholder="+34 123 456 789"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio" className="font-poppins">
                          Biografía
                        </Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={editedUser.bio || ''}
                          onChange={handleInputChange}
                          rows={3}
                          className="font-poppins"
                          placeholder="Cuéntanos un poco sobre ti..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address.street" className="font-poppins">
                          Dirección
                        </Label>
                        <Input
                          id="address.street"
                          name="address.street"
                          value={editedUser.address?.street || editedUser.direccion || ''}
                          onChange={handleInputChange}
                          className="font-poppins"
                          placeholder="Calle y número"
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
                            value={editedUser.address?.city || ''}
                            onChange={handleInputChange}
                            className="font-poppins"
                            placeholder="Ciudad"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address.postalCode" className="font-poppins">
                            Código Postal
                          </Label>
                          <Input
                            id="address.postalCode"
                            name="address.postalCode"
                            value={editedUser.address?.postalCode || ''}
                            onChange={handleInputChange}
                            className="font-poppins"
                            placeholder="Código postal"
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
                          value={editedUser.address?.country || 'España'}
                          onChange={handleInputChange}
                          className="font-poppins"
                          placeholder="País"
                        />
                      </div>
                      <div className="text-sm text-gray-500 pt-2">
                        <p>Los cambios se guardarán automáticamente al hacer clic en "Guardar Cambios".</p>
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
              <div className="text-center py-12">
                <PackageOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-poppins">No hay pedidos para mostrar</p>
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
