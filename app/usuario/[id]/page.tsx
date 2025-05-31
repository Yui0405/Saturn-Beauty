"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Heart, MessageCircle, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { sampleUsers, type User } from "@/contexts/follow-context"

// Sample posts for users
const userPosts = {
  1: [
    {
      id: 101,
      content:
        "¡Acabo de descubrir este increíble sérum de vitamina C! Mi piel se ve más radiante que nunca. ¿Alguien más lo ha probado?",
      image: "/placeholder.svg?height=400&width=600",
      timestamp: "Hace 2 días",
      likes: 34,
      comments: 8,
    },
    {
      id: 102,
      content:
        "Mi rutina matutina de cuidado facial paso a paso. La clave está en la constancia y usar productos de calidad.",
      image: "/placeholder.svg?height=400&width=600",
      timestamp: "Hace 1 semana",
      likes: 67,
      comments: 15,
    },
  ],
  2: [
    {
      id: 201,
      content:
        "Comparativa de bases de maquillaje para piel mixta. Después de probar 10 marcas diferentes, estas son mis conclusiones...",
      image: "/placeholder.svg?height=400&width=600",
      timestamp: "Hace 3 días",
      likes: 89,
      comments: 23,
    },
  ],
  3: [
    {
      id: 301,
      content:
        "Tutorial: Cómo lograr un look natural para el día a día usando solo 5 productos. ¡Perfecto para principiantes!",
      image: "/placeholder.svg?height=400&width=600",
      timestamp: "Hace 5 días",
      likes: 156,
      comments: 42,
    },
  ],
  4: [
    {
      id: 401,
      content:
        "Reseña completa del nuevo Soft Pinch Liquid Blush. Pros, contras y mi opinión honesta después de usarlo por un mes.",
      image: "/placeholder.svg?height=400&width=600",
      timestamp: "Hace 1 día",
      likes: 78,
      comments: 19,
    },
  ],
  5: [
    {
      id: 501,
      content:
        "Los 5 ingredientes que debes evitar en tus productos de cuidado facial si tienes piel sensible. Información basada en estudios científicos.",
      timestamp: "Hace 4 días",
      likes: 234,
      comments: 67,
    },
  ],
  6: [
    {
      id: 601,
      content: "Mi experiencia probando la rutina coreana de 10 pasos durante 3 meses. ¿Vale la pena? Te cuento todo.",
      image: "/placeholder.svg?height=400&width=600",
      timestamp: "Hace 6 días",
      likes: 145,
      comments: 38,
    },
  ],
  0: [
    {
      id: 1,
      content:
        "¡Bienvenidos a mi perfil! Aquí compartiré mis experiencias con productos de belleza y cuidado personal.",
      timestamp: "Hace 1 semana",
      likes: 12,
      comments: 3,
    },
  ],
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = Number.parseInt(params.id as string)
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("posts")

  useEffect(() => {
    // Handle special case for user ID 0 (current user)
    if (userId === 0) {
      setUser({
        id: 0,
        name: "Tú",
        avatar: "/placeholder.svg?height=40&width=40",
        bio: "Tu perfil personal en Saturn Beauty",
        followersCount: 0,
        followingCount: 0,
      })
    } else {
      const foundUser = sampleUsers.find((u) => u.id === userId)
      if (foundUser) {
        setUser(foundUser)
      }
    }
  }, [userId])

  // Get posts for the user, with fallback to empty array
  const posts = user ? userPosts[user.id as keyof typeof userPosts] || [] : []

  if (!user) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 font-playfair">Usuario no encontrado</h1>
          <Button
            onClick={() => router.back()}
            className="bg-mint-green hover:bg-accent-green hover:text-mint-green font-poppins"
          >
            Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Back button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 font-poppins">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        {/* Profile Header - Matching community post style */}
        <Card className="mb-6 overflow-hidden">
          <CardHeader className="p-6 pb-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-lg font-medium font-poppins">{user.name}</h1>
                {user.bio && <p className="text-sm text-gray-500 font-poppins">{user.bio}</p>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex gap-6">
              <div className="text-center">
                <p className="font-bold text-lg font-poppins">{posts.length}</p>
                <p className="text-sm text-gray-500 font-poppins">Publicaciones</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg font-poppins">{user.followersCount}</p>
                <p className="text-sm text-gray-500 font-poppins">Seguidores</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg font-poppins">{user.followingCount}</p>
                <p className="text-sm text-gray-500 font-poppins">Siguiendo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-1 mb-6">
            <TabsTrigger value="posts" className="font-poppins">
              Publicaciones ({posts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 font-poppins">Este usuario aún no ha publicado nada.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardHeader className="p-6 pb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-lg font-medium font-poppins">{user.name}</p>
                          <p className="text-sm text-gray-500 font-poppins">{post.timestamp}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="mb-4 font-poppins">{post.content}</p>
                      {post.image && (
                        <div className="relative h-64 md:h-80 rounded-md overflow-hidden mb-4">
                          <Image
                            src={post.image || "/placeholder.svg"}
                            alt="Imagen de la publicación"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 font-poppins">
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <Share2 className="h-4 w-4" />
                          Compartir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
