"use client";

import type React from "react";
import { X } from "lucide-react";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  User,
  ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNotifications } from "@/contexts/notification-context";

// Sample community posts
const initialPosts = [
  {
    id: 1,
    user: {
      id: 1,
      name: "María García",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Acabo de probar el nuevo Soft Pinch Liquid Blush y estoy enamorada 😍 El color es precioso y dura todo el día. ¿Alguien más lo ha probado? Me gustaría saber vuestra opinión sobre este producto. Llevo buscando un rubor líquido que no se vaya rápido y creo que por fin lo he encontrado. La textura es muy agradable y fácil de difuminar. También me gusta mucho el aplicador, que permite dosificar bien el producto sin desperdiciar. Lo he comprado en el tono 'Dewy Drop' y me parece perfecto para mi tono de piel medio.",
    image: "/placeholder.svg?height=400&width=600",
    likes: 24,
    comments: [
      {
        id: 1,
        user: {
          id: 2,
          name: "Laura Martínez",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        content:
          "¡Sí! Lo compré la semana pasada y es increíble. ¿Qué tono estás usando?",
      },
      {
        id: 2,
        user: {
          id: 3,
          name: "Carmen Rodríguez",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        content: "Tengo que probarlo, ¿se puede usar en pieles sensibles?",
      },
      {
        id: 3,
        user: {
          id: 4,
          name: "Ana López",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        content:
          "Lo compré hace un mes y estoy encantada. La duración es espectacular y el acabado queda muy natural.",
      },
      {
        id: 4,
        user: {
          id: 5,
          name: "Elena Sánchez",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        content:
          "¿Has probado aplicarlo con brocha o con los dedos? Yo lo aplico con los dedos y queda muy natural.",
      },
      {
        id: 5,
        user: {
          id: 6,
          name: "Sofía Fernández",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        content:
          "Estoy pensando en comprarlo, ¿me recomiendas algún tono para piel clara?",
      },
    ],
    timestamp: "2 horas",
    liked: false,
  },
  {
    id: 2,
    user: {
      id: 4,
      name: "Ana López",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Mi rutina de cuidado facial con productos Saturn Beauty. La crema hidratante ha cambiado mi piel por completo, mucho más luminosa y suave. Llevo usándola durante un mes y los resultados son increíbles. Mi piel está más hidratada, luminosa y los poros se han reducido considerablemente. La textura es ligera pero muy nutritiva, ideal para usar día y noche. La combino con el sérum de vitamina C por las mañanas y con el de retinol por las noches.",
    image: "/placeholder.svg?height=400&width=600",
    likes: 42,
    comments: [
      {
        id: 3,
        user: {
          id: 5,
          name: "Elena Sánchez",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        content: "¿Cuánto tiempo llevas usándola? Estoy pensando en comprarla.",
      },
      {
        id: 6,
        user: {
          id: 1,
          name: "María García",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        content: "¿Es buena para pieles mixtas? Tengo la zona T muy grasa.",
      },
    ],
    timestamp: "5 horas",
    liked: true,
  },
  {
    id: 3,
    user: {
      id: 6,
      name: "Sofía Fernández",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Hoy me llegó mi pedido de Saturn Beauty. No puedo esperar a probar todos estos productos. ¿Alguna recomendación por dónde empezar? He comprado la crema hidratante, el sérum de vitamina C, el tónico exfoliante y la mascarilla de arcilla. Es mi primera vez probando esta marca y estoy muy emocionada por los comentarios tan positivos que he visto en la comunidad.",
    image: "/placeholder.svg?height=400&width=600",
    likes: 18,
    comments: [],
    timestamp: "1 día",
    liked: false,
  },
];

const MAX_VISIBLE_TEXT_LENGTH = 150;
const MAX_VISIBLE_COMMENTS = 3;

export default function CommunityFeed() {
  const [posts, setPosts] = useState(initialPosts);
  const [newPostContent, setNewPostContent] = useState("");
  const [newCommentContent, setNewCommentContent] = useState<{
    [key: number]: string;
  }>({});
  const [activeTab, setActiveTab] = useState("todos");
  const [expandedPosts, setExpandedPosts] = useState<number[]>([]);
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [postImage, setPostImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addNotification } = useNotifications();

  const handleLike = (postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
              liked: !post.liked,
            }
          : post
      )
    );
  };

  const handleAddComment = (postId: number) => {
    if (!newCommentContent[postId]?.trim()) return;

    const post = posts.find((p) => p.id === postId);

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: Date.now(),
                  user: {
                    id: 0, // Current user
                    name: "Tú",
                    avatar: "/placeholder.svg?height=40&width=40",
                  },
                  content: newCommentContent[postId],
                },
              ],
            }
          : post
      )
    );

    // Add notification for the post owner (if not commenting on own post)
    if (post && post.user.id !== 0) {
      addNotification({
        type: "comment",
        title: "Nuevo comentario",
        message: `Alguien comentó en tu publicación`,
        userId: post.user.id,
        postId: post.id,
        avatar: "/placeholder.svg?height=40&width=40",
        actionUrl: "/comunidad",
      });
    }

    setNewCommentContent((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleAddPost = () => {
    if (!newPostContent.trim() && !postImage) return;

    const newPost = {
      id: Date.now(),
      user: {
        id: 0, // Current user
        name: "Tú",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content: newPostContent,
      image: postImage || "",
      likes: 0,
      comments: [],
      timestamp: "Ahora",
      liked: false,
    };

    setPosts((prevPosts) => [newPost, ...prevPosts]);

    // Simular notificación de nuevo post
    simulateNewPostNotification("Tú", newPost.id);

    setNewPostContent("");
    setPostImage(null);
  };

  // Después de la función handleAddPost, añadir esta función para simular notificaciones de nuevos posts:
  const simulateNewPostNotification = (postAuthor: string, postId: number) => {
    // Simular que otros usuarios reciben notificaciones de nuevos posts
    setTimeout(() => {
      addNotification({
        type: "post",
        title: "Nueva publicación",
        message: `${postAuthor} ha publicado algo nuevo en la comunidad`,
        userId: Math.floor(Math.random() * 6) + 1,
        postId: postId,
        avatar: "/placeholder.svg?height=40&width=40",
        actionUrl: "/comunidad",
      });
    }, 2000); // Simular delay de 2 segundos
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImage("/placeholder.svg?height=400&width=600");
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const togglePostExpansion = (postId: number) => {
    setExpandedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const toggleCommentsExpansion = (postId: number) => {
    setExpandedComments((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const isPostExpanded = (postId: number) => expandedPosts.includes(postId);
  const areCommentsExpanded = (postId: number) =>
    expandedComments.includes(postId);

  const shouldTruncateText = (text: string) =>
    text.length > MAX_VISIBLE_TEXT_LENGTH;

  const getTruncatedText = (text: string, postId: number) => {
    if (!shouldTruncateText(text) || isPostExpanded(postId)) {
      return text;
    }
    return text.substring(0, MAX_VISIBLE_TEXT_LENGTH) + "...";
  };

  const getVisibleComments = (comments: any[], postId: number) => {
    if (areCommentsExpanded(postId)) {
      return comments;
    }
    return comments.slice(0, MAX_VISIBLE_COMMENTS);
  };

  const filteredPosts =
    activeTab === "todos"
      ? posts
      : activeTab === "mios"
      ? posts.filter((post) => post.user.id === 0) // My posts only
      : posts;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Post Creation */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-2xl font-playfair font-bold text-mint-green-dark mb-4">
            Crear Publicación
          </h2>
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="¿Qué te gustaría compartir?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="font-poppins"
              />
              <div className="flex justify-between mt-4">
                <Button variant="ghost" className="font-poppins">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Añadir Imagen
                </Button>
                <Button
                  onClick={handleAddPost}
                  className="font-poppins bg-mint-green hover:bg-accent-green hover:text-mint-green"
                >
                  Publicar
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay publicaciones para mostrar.</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={post.user.avatar} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/usuario/${post.user.id}`}
                      className="font-playfair font-medium hover:text-mint-green"
                    >
                      {post.user.name}
                    </Link>
                    <p className="text-sm text-gray-500 font-poppins">
                      Hace {post.timestamp}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 mb-4 font-poppins whitespace-pre-wrap">
                  {post.content}
                </p>
                {post.image && (
                  <div className="relative h-[300px] rounded-lg overflow-hidden">
                    <Image
                      src={post.image}
                      alt="Post image"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col">
                <div className="flex items-center gap-6 w-full font-poppins">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-1 ${
                      post.liked ? "text-red-500" : ""
                    }`}
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart
                      className={`h-4 w-4 ${post.liked ? "fill-red-500" : ""}`}
                    />
                    {post.likes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() =>
                      post.comments.length > 0 &&
                      toggleCommentsExpansion(post.id)
                    }
                  >
                    <MessageCircle className="h-4 w-4" />
                    {post.comments.length}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Share2 className="h-4 w-4" />
                    Compartir
                  </Button>
                </div>
                {post.comments.length > 0 && (
                  <div className="mt-4 w-full space-y-4">
                    {getVisibleComments(post.comments, post.id).map(
                      (comment) => (
                        <div key={comment.id} className="flex gap-4">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.user.avatar} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Link
                              href={`/usuario/${comment.user.id}`}
                              className="font-playfair font-medium hover:text-mint-green"
                            >
                              {comment.user.name}
                            </Link>
                            <p className="text-gray-800 font-poppins">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                    {post.comments.length > MAX_VISIBLE_COMMENTS && (
                      <Button
                        variant="link"
                        className="text-mint-green p-0 h-auto text-sm"
                        onClick={() => toggleCommentsExpansion(post.id)}
                      >
                        {areCommentsExpanded(post.id)
                          ? "Ver menos"
                          : `Ver todos (${post.comments.length})`}
                      </Button>
                    )}
                  </div>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
