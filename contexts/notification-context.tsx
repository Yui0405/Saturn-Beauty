"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"

export type NotificationType = "comment" | "mention" | "follow" | "post" | "like" | "order" | "system"

export type Notification = {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  userId?: number
  postId?: number
  commentId?: number
  actionUrl?: string
  avatar?: string
}

type NotificationContextType = {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAllNotifications: () => void
  getNotificationsByType: (type: NotificationType) => Notification[]
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNotifications = localStorage.getItem("notifications")
      if (savedNotifications) {
        try {
          const parsed = JSON.parse(savedNotifications)
          // Convert timestamp strings back to Date objects
          const notificationsWithDates = parsed.map((notif: any) => ({
            ...notif,
            timestamp: new Date(notif.timestamp),
          }))
          setNotifications(notificationsWithDates)
        } catch (error) {
          console.error("Error parsing notifications from localStorage", error)
        }
      } else {
        // Initialize with some sample notifications
        const sampleNotifications: Notification[] = [
          {
            id: "1",
            type: "comment",
            title: "Nuevo comentario",
            message: "Laura Martínez comentó en tu publicación sobre el Soft Pinch Liquid Blush",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            read: false,
            userId: 2,
            postId: 1,
            avatar: "/placeholder.svg?height=40&width=40",
            actionUrl: "/comunidad",
          },
          {
            id: "2",
            type: "post",
            title: "Nueva publicación",
            message: "Carmen Rodríguez ha publicado sobre rutinas de cuidado nocturno",
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            read: false,
            userId: 3,
            postId: 2,
            avatar: "/placeholder.svg?height=40&width=40",
            actionUrl: "/comunidad",
          },
          {
            id: "3",
            type: "mention",
            title: "Te mencionaron",
            message: "Ana López te mencionó en un comentario sobre productos para piel sensible",
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            read: true,
            userId: 4,
            commentId: 3,
            avatar: "/placeholder.svg?height=40&width=40",
            actionUrl: "/comunidad",
          },
          {
            id: "4",
            type: "like",
            title: "Me gusta en tu publicación",
            message: "A Elena Sánchez le gustó tu publicación sobre el sérum de vitamina C",
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
            read: true,
            userId: 5,
            postId: 2,
            avatar: "/placeholder.svg?height=40&width=40",
            actionUrl: "/comunidad",
          },
          {
            id: "5",
            type: "post",
            title: "Nueva publicación",
            message: "Sofía Fernández compartió su experiencia con productos naturales",
            timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
            read: false,
            userId: 6,
            postId: 3,
            avatar: "/placeholder.svg?height=40&width=40",
            actionUrl: "/comunidad",
          },
          {
            id: "6",
            type: "comment",
            title: "Nuevo comentario",
            message: "María García respondió a tu comentario en la publicación sobre mascarillas",
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
            read: true,
            userId: 1,
            postId: 4,
            avatar: "/placeholder.svg?height=40&width=40",
            actionUrl: "/comunidad",
          },
          {
            id: "7",
            type: "order",
            title: "Pedido enviado",
            message: "Tu pedido #ORD-12345 ha sido enviado y llegará en 3-5 días hábiles",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            read: false,
            actionUrl: "/perfil?tab=orders",
          },
          {
            id: "8",
            type: "post",
            title: "Nueva publicación",
            message: "Laura Martínez publicó un tutorial de maquillaje para principiantes",
            timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5 days ago
            read: true,
            userId: 2,
            postId: 5,
            avatar: "/placeholder.svg?height=40&width=40",
            actionUrl: "/comunidad",
          },
        ]
        setNotifications(sampleNotifications)
      }
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notifications", JSON.stringify(notifications))
    }
  }, [notifications])

  const unreadCount = notifications.filter((notif) => !notif.read).length

  const addNotification = (notificationData: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev])

    // Show toast notification
    toast({
      title: newNotification.title,
      description: newNotification.message,
    })
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
    toast({
      title: "Notificaciones eliminadas",
      description: "Todas las notificaciones han sido eliminadas",
    })
  }

  const getNotificationsByType = (type: NotificationType) => {
    return notifications.filter((notif) => notif.type === type)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        getNotificationsByType,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
