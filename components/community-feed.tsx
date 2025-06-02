"use client";

import type React from "react";
import { X, Trash2, ImageIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  User,
  ChevronDown,
  ChevronUp,
  Loader2,
  LogIn,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
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
import { useAuth } from "@/lib/auth";

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  email: string;
  role: string;
}

interface Comment {
  id: number;
  userId: number;
  content: string;
  user?: User;
}

interface Post {
  id: number;
  userId: number;
  content: string;
  image: string;
  likes: number;
  comments: Comment[];
  liked: boolean;
  createdAt: string;
  user?: User;
}

// Default user for fallback
const defaultUser: User = {
  id: '0',
  name: 'Usuario',
  username: 'usuario',
  avatar: '/images/users/default-avatar.png',
  email: '',
  role: 'user'
};

// Function to format date to relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;

  if (diffInSeconds < minute) return 'hace unos segundos';
  if (diffInSeconds < hour) {
    const minutes = Math.floor(diffInSeconds / minute);
    return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  }
  if (diffInSeconds < day) {
    const hours = Math.floor(diffInSeconds / hour);
    return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  }
  if (diffInSeconds < month) {
    const days = Math.floor(diffInSeconds / day);
    return `hace ${days} día${days > 1 ? 's' : ''}`;
  }
  if (diffInSeconds < year) {
    const months = Math.floor(diffInSeconds / month);
    return `hace ${months} mes${months > 1 ? 'es' : ''}`;
  }
  
  const years = Math.floor(diffInSeconds / year);
  return `hace ${years} año${years > 1 ? 's' : ''}`;
};

const MAX_VISIBLE_TEXT_LENGTH = 150;
const MAX_VISIBLE_COMMENTS = 3;

export default function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch posts and users in parallel
        const [postsRes, usersRes] = await Promise.all([
          fetch('/data/posts.json'),
          fetch('/data/users.json')
        ]);
        
        if (!postsRes.ok || !usersRes.ok) {
          throw new Error('Error al cargar los datos');
        }
        
        const { posts: postsData } = await postsRes.json();
        const { users } = await usersRes.json();
        
        // Get user posts from localStorage
        const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
        
        // Create a map of users by ID for quick lookup
        const usersMap = new Map(users.map((user: User) => [user.id, user]));
        
        // Add current user to users map if not present
        const currentUser = session || JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser?.id) {
          usersMap.set(currentUser.id, currentUser);
        }

        // Process posts from JSON
        const postsFromJson = postsData.map((post: Post) => ({
          ...post,
          user: usersMap.get(post.userId.toString()) || defaultUser,
          comments: post.comments.map(comment => ({
            ...comment,
            user: usersMap.get(comment.userId.toString()) || defaultUser
          })),
          liked: false,
          timestamp: formatRelativeTime(post.createdAt)
        }));
        
        // Process user posts from localStorage
        const processedUserPosts = userPosts.map((post: any) => ({
          ...post,
          user: post.user || defaultUser,
          comments: post.comments || [],
          liked: post.liked || false,
          timestamp: formatRelativeTime(post.createdAt)
        }));
        
        // Combine and sort by date (newest first)
        const allPosts = [...processedUserPosts, ...postsFromJson].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setPosts(allPosts);
      } catch (err) {
        console.error('Error loading community data:', err);
        setError('No se pudieron cargar las publicaciones. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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

    // Get user data from session or localStorage
    const sessionUser = session || JSON.parse(localStorage.getItem('user') || '{}');
    
    const newPost = {
      id: Date.now(),
      userId: sessionUser?.id || 0,
      content: newPostContent,
      image: postImage || "",
      likes: 0,
      liked: false,
      comments: [],
      createdAt: new Date().toISOString(),
      user: {
        id: sessionUser?.id || 0,
        name: sessionUser?.name || 'Usuario',
        username: sessionUser?.username || 'usuario',
        avatar: sessionUser?.avatar || "/images/users/default-avatar.png",
        email: sessionUser?.email || '',
        role: sessionUser?.role || 'user'
      },
      timestamp: formatRelativeTime(new Date().toISOString())
    };

    // Save to localStorage
    const savedPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
    localStorage.setItem('userPosts', JSON.stringify([newPost, ...savedPosts]));
    
    // Update the posts state
    setPosts(prevPosts => [{
      ...newPost,
      user: newPost.user,
      comments: [],
      liked: false
    }, ...prevPosts]);

    // Simulate new post notification
    simulateNewPostNotification(sessionUser?.name || 'Un usuario', newPost.id);

    setNewPostContent("");
    setPostImage(null);
  };

  // After the handleAddPost function, add this function to simulate new post notifications
  const simulateNewPostNotification = (postAuthor: string, postId: number) => {
    // Get current user from session or localStorage
    const currentUser = session || JSON.parse(localStorage.getItem('user') || '{}');
    
    // Simulate other users receiving notifications about new posts
    setTimeout(() => {
      // Only send notifications to other users
      if (currentUser?.id) {
        addNotification({
          type: "post",
          title: "Nueva publicación",
          message: `${postAuthor} ha publicado algo nuevo en la comunidad`,
          userId: currentUser.id,
          postId: postId,
          avatar: currentUser.avatar || "/images/users/default-avatar.png",
          actionUrl: "/comunidad",
        });
      }
    }, 2000); // 2 second delay
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor, sube solo archivos de imagen",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "La imagen no debe superar los 5MB",
        variant: "destructive",
      });
      return;
    }
    
    // Create a preview URL for the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPostImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const removeImage = () => {
    setPostImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeletePost = (postId: number) => {
    // Remove from state
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    
    // Remove from localStorage
    const savedPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
    const updatedPosts = savedPosts.filter((post: Post) => post.id !== postId);
    localStorage.setItem('userPosts', JSON.stringify(updatedPosts));
    
    // Close confirmation dialog
    setShowDeleteConfirm(null);
    
    // Show success message
    toast({
      title: "Publicación eliminada",
      description: "La publicación se ha eliminado correctamente.",
      variant: "default",
    });
  };
  
  const isCurrentUserPost = (postUserId: number) => {
    const currentUser = session || JSON.parse(localStorage.getItem('user') || '{}');
    return currentUser?.id === postUserId.toString();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-mint-green" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

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
              <AvatarImage 
                src={session?.avatar || JSON.parse(localStorage.getItem('user') || '{}')?.avatar || "/images/users/default-avatar.png"} 
                alt="User avatar"
              />
              <AvatarFallback className="bg-mint-green/20 text-mint-green-dark">
                {session?.name?.[0] || JSON.parse(localStorage.getItem('user') || '{}')?.name?.[0] || <User className="h-4 w-4" />}
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
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="font-poppins"
                    onClick={handleImageButtonClick}
                  >
                    <ImageIcon className="h-5 w-5 mr-2" />
                    {postImage ? 'Cambiar imagen' : 'Añadir Imagen'}
                  </Button>
                  {postImage && (
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  )}
                </div>
                {postImage && (
                  <div className="relative rounded-md overflow-hidden border border-gray-200">
                    <img 
                      src={postImage} 
                      alt="Vista previa" 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                {session ? (
                  <Button
                    onClick={handleAddPost}
                    className="font-poppins bg-mint-green hover:bg-accent-green hover:text-mint-green"
                  >
                    Publicar
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-mint-green border-mint-green hover:bg-mint-green/10 text-sm font-medium h-10"
                    onClick={() => {
                      toast({
                        title: "Inicia sesión para publicar",
                        description: "Debes iniciar sesión para compartir publicaciones en la comunidad.",
                        variant: "default",
                        action: (
                          <Button 
                            variant="outline" 
                            className="border-mint-green text-mint-green hover:bg-mint-green/10 ml-2"
                            onClick={() => window.location.href = '/login'}
                          >
                            <LogIn className="h-4 w-4 mr-2" />
                            Iniciar sesión
                          </Button>
                        ),
                      });
                    }}
                  >
                    Publicar
                  </Button>
                )}
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
                    <AvatarImage 
                      src={post.user.avatar} 
                      alt={post.user.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-mint-green/20 text-mint-green">
                      {post.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/usuario/${post.user.id}`}
                        className="font-playfair font-medium hover:text-mint-green"
                      >
                        {post.user.name}
                      </Link>
                      {isCurrentUserPost(post.user.id) && (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-500 p-1 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(showDeleteConfirm === post.id ? null : post.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {showDeleteConfirm === post.id && (
                            <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg p-4 z-10 border border-gray-200">
                              <p className="text-sm text-gray-700 mb-3">¿Estás seguro de que quieres eliminar esta publicación?</p>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteConfirm(null);
                                  }}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePost(post.id);
                                  }}
                                >
                                  Eliminar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 font-poppins">
                      {post.timestamp}
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
                            <AvatarImage 
                              src={comment.user.avatar} 
                              alt={comment.user.name}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-mint-green/20 text-mint-green text-xs">
                              {comment.user.name.charAt(0).toUpperCase()}
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
