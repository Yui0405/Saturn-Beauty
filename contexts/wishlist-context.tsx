"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"

export type WishlistItem = {
  id: number
  name: string
  price: number
  image: string
}

type WishlistContextType = {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (id: number) => void
  isInWishlist: (id: number) => boolean
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([])

  // Asegurarnos de que los datos de la wishlist se guarden en localStorage para persistencia
  // Añadir después de la declaración del estado items

  // Cargar items de localStorage al iniciar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedItems = localStorage.getItem("wishlistItems")
      if (savedItems) {
        try {
          setItems(JSON.parse(savedItems))
        } catch (error) {
          console.error("Error parsing wishlist items from localStorage", error)
        }
      }
    }
  }, [])

  // Guardar items en localStorage cuando cambien
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wishlistItems", JSON.stringify(items))
    }
  }, [items])

  const addItem = (newItem: WishlistItem) => {
    setItems((prevItems) => {
      // Verificar si el item ya existe en la lista de deseos
      const exists = prevItems.some((item) => item.id === newItem.id)

      if (exists) {
        return prevItems
      } else {
        toast({
          title: "Añadido a favoritos",
          description: newItem.name,
        })

        return [...prevItems, newItem]
      }
    })
  }

  const removeItem = (id: number) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.id === id)
      if (itemToRemove) {
        toast({
          title: "Eliminado de favoritos",
          description: itemToRemove.name,
        })
      }
      return prevItems.filter((item) => item.id !== id)
    })
  }

  const isInWishlist = (id: number) => {
    return items.some((item) => item.id === id)
  }

  const clearWishlist = () => {
    setItems([])
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
