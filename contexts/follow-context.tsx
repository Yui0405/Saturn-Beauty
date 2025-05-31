"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useNotifications } from "./notification-context"
import { toast } from "@/hooks/use-toast"

export type User = {
  id: number
  name: string
  avatar: string
  bio?: string
  followersCount: number
  followingCount: number
}

type FollowContextType = {
  followedUsers: User[]
  followers: User[]
  isFollowing: (userId: number) => boolean
  followUser: (user: User) => void
  unfollowUser: (userId: number) => void
  getFollowedUsers: () => User[]
  getFollowers: () => User[]
  getUserById: (userId: number) => User | undefined
}

// Sample users data
const sampleUsers: User[] = [
  {
    id: 1,
    name: "María García",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Amante de los cosméticos naturales",
    followersCount: 245,
    followingCount: 89,
  },
  {
    id: 2,
    name: "Laura Martínez",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Experta en cuidado de la piel",
    followersCount: 156,
    followingCount: 67,
  },
  {
    id: 3,
    name: "Carmen Rodríguez",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Maquilladora profesional",
    followersCount: 389,
    followingCount: 123,
  },
  {
    id: 4,
    name: "Ana López",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Influencer de belleza",
    followersCount: 567,
    followingCount: 234,
  },
  {
    id: 5,
    name: "Elena Sánchez",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Dermatóloga y consultora de belleza",
    followersCount: 892,
    followingCount: 45,
  },
  {
    id: 6,
    name: "Sofía Fernández",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Blogger de cosmética natural",
    followersCount: 334,
    followingCount: 178,
  },
]

const FollowContext = createContext<FollowContextType | undefined>(undefined)

export const FollowProvider = ({ children }: { children: React.ReactNode }) => {
  const [followedUsers, setFollowedUsers] = useState<User[]>([])
  const [followers, setFollowers] = useState<User[]>([])
  const { addNotification } = useNotifications()

  // Load followed users from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFollowedUsers = localStorage.getItem("followedUsers")
      const savedFollowers = localStorage.getItem("followers")

      if (savedFollowedUsers) {
        try {
          setFollowedUsers(JSON.parse(savedFollowedUsers))
        } catch (error) {
          console.error("Error parsing followed users from localStorage", error)
        }
      } else {
        // Initialize with some sample followed users
        const initialFollowed = [sampleUsers[1], sampleUsers[4]] // Following Laura and Elena
        setFollowedUsers(initialFollowed)
      }

      if (savedFollowers) {
        try {
          setFollowers(JSON.parse(savedFollowers))
        } catch (error) {
          console.error("Error parsing followers from localStorage", error)
        }
      } else {
        // Initialize with some sample followers
        const initialFollowers = [sampleUsers[2], sampleUsers[3], sampleUsers[5]] // Carmen, Ana, and Sofía follow us
        setFollowers(initialFollowers)
      }
    }
  }, [])

  // Save to localStorage whenever followedUsers or followers change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("followedUsers", JSON.stringify(followedUsers))
    }
  }, [followedUsers])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("followers", JSON.stringify(followers))
    }
  }, [followers])

  const isFollowing = (userId: number) => {
    return followedUsers.some((user) => user.id === userId)
  }

  const followUser = (user: User) => {
    if (!isFollowing(user.id)) {
      setFollowedUsers((prev) => [...prev, user])

      // Add notification for the followed user (simulated)
      addNotification({
        type: "follow",
        title: "Nuevo seguidor",
        message: `Has comenzado a seguir a ${user.name}`,
        userId: user.id,
        avatar: user.avatar,
        actionUrl: `/perfil?user=${user.id}`,
      })

      toast({
        title: "Usuario seguido",
        description: `Ahora sigues a ${user.name}`,
      })
    }
  }

  const unfollowUser = (userId: number) => {
    const user = followedUsers.find((u) => u.id === userId)
    setFollowedUsers((prev) => prev.filter((user) => user.id !== userId))

    if (user) {
      toast({
        title: "Usuario no seguido",
        description: `Ya no sigues a ${user.name}`,
      })
    }
  }

  const getFollowedUsers = () => followedUsers

  const getFollowers = () => followers

  const getUserById = (userId: number) => {
    return sampleUsers.find((user) => user.id === userId)
  }

  return (
    <FollowContext.Provider
      value={{
        followedUsers,
        followers,
        isFollowing,
        followUser,
        unfollowUser,
        getFollowedUsers,
        getFollowers,
        getUserById,
      }}
    >
      {children}
    </FollowContext.Provider>
  )
}

export const useFollow = () => {
  const context = useContext(FollowContext)
  if (context === undefined) {
    throw new Error("useFollow must be used within a FollowProvider")
  }
  return context
}

// Export the sample users for use in other components
export { sampleUsers }
