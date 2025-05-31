"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { User } from "lucide-react"
import Link from "next/link"
import type { User as UserType } from "@/contexts/follow-context"

type UserCardProps = {
  user: UserType
  compact?: boolean
}

export default function UserCard({ user, compact = false }: UserCardProps) {
  if (compact) {
    return (
      <Link href={`/usuario/${user.id}`}>
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-medium font-poppins hover:text-mint-green-dark transition-colors">
                {user.name}
              </p>
              <p className="text-sm text-gray-500 font-poppins">{user.followersCount} seguidores</p>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/usuario/${user.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-12 w-12 mb-4">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>

            <h3 className="text-lg font-medium mb-2 font-poppins hover:text-mint-green-dark transition-colors">
              {user.name}
            </h3>

            {user.bio && <p className="text-sm text-gray-600 mb-4 font-poppins line-clamp-2">{user.bio}</p>}

            <div className="flex gap-4 mb-4">
              <div className="text-center">
                <p className="font-bold font-poppins">{user.followersCount}</p>
                <p className="text-xs text-gray-500 font-poppins">Seguidores</p>
              </div>
              <div className="text-center">
                <p className="font-bold font-poppins">{user.followingCount}</p>
                <p className="text-xs text-gray-500 font-poppins">Siguiendo</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
