"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"

export type CartItem = {
  id: number
  name: string
  price: number
  image: string
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  isCartOpen: boolean
  toggleCart: () => void
  closeCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)

  // Calcular totales cuando cambian los items
  useEffect(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0)
    const price = items.reduce((total, item) => total + item.price * item.quantity, 0)

    setTotalItems(itemCount)
    setTotalPrice(price)
  }, [items])

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id)
      let newItems;

      if (existingItemIndex > -1) {
        // Si el producto ya está en el carrito, incrementar la cantidad
        newItems = [...prevItems]
        newItems[existingItemIndex].quantity += 1
      } else {
        // Si no existe, añadirlo con cantidad 1
        newItems = [...prevItems, { ...newItem, quantity: 1 }]
      }
      
      return newItems
    })
    
    // Mover el toast fuera del setState
    const existingItem = items.find(item => item.id === newItem.id);
    if (existingItem) {
      toast({
        title: "Producto actualizado",
        description: `${newItem.name} (${existingItem.quantity + 1}x)`,
      })
    } else {
      toast({
        title: "Producto añadido",
        description: newItem.name,
      })
    }
  }

  const removeItem = (id: number) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.id === id)
      if (itemToRemove) {
        toast({
          title: "Producto eliminado",
          description: itemToRemove.name,
        })
      }
      return prevItems.filter((item) => item.id !== id)
    })
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setItems([])
    toast({
      title: "Carrito vaciado",
      description: "Se han eliminado todos los productos del carrito",
    })
  }

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev)
  }

  const closeCart = () => {
    setIsCartOpen(false)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        toggleCart,
        closeCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
