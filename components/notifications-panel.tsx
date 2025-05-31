"use client";

import { useState } from "react";
import {
  X,
  Bell,
  ShoppingBag,
  Heart,
  Info,
  MessageCircle,
  UserPlus,
  FileText,
  Trash2,
  Check,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  useNotifications,
  type NotificationType,
} from "@/contexts/notification-context";
import { cn } from "@/lib/utils";

type NotificationsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function NotificationsPanel({
  isOpen,
  onClose,
}: NotificationsPanelProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getNotificationsByType,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState("all");

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case "mention":
        return <MessageCircle className="h-5 w-5 text-purple-500" />;
      case "follow":
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case "post":
        return <FileText className="h-5 w-5 text-indigo-500" />;
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />;
      case "order":
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case "system":
      default:
        return <Info className="h-5 w-5 text-mint-green" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - timestamp.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;

    return timestamp.toLocaleDateString();
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      onClose();
      window.location.href = notification.actionUrl;
    }
  };

  const getFilteredNotifications = () => {
    // Always return a new array to ensure re-renders when notifications change
    const allNotifications = [...notifications];
    
    switch (activeTab) {
      case "unread":
        return allNotifications.filter((n) => !n.read);
      case "comments":
        return getNotificationsByType("comment")
          .concat(getNotificationsByType("mention"))
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      case "posts":
        return getNotificationsByType("post")
          .concat(getNotificationsByType("like"))
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      default:
        return allNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
  };

  const filteredNotifications = getFilteredNotifications();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-lg z-50">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <h2 className="text-lg font-semibold">Notificaciones</h2>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Marcar todo como leído
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
            defaultValue={unreadCount > 0 ? "unread" : "all"}
          >
            <TabsList className="w-full justify-start px-4 py-2 bg-white border-b">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-lavender-light"
              >
                Todas
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="data-[state=active]:bg-lavender-light"
              >
                No leídas {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="data-[state=active]:bg-lavender-light"
              >
                Comentarios
              </TabsTrigger>
              <TabsTrigger
                value="posts"
                className="data-[state=active]:bg-lavender-light"
              >
                Publicaciones
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 relative">
              <ScrollArea className="h-[calc(100vh-180px)] w-full">
                <div className="p-4">
                  {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-gray-500">
                      <Bell className="h-12 w-12 mb-2 text-gray-400" />
                      <p className="text-lg font-medium">
                        No hay notificaciones
                      </p>
                      <p className="text-sm">
                        Las notificaciones aparecerán aquí
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors group",
                            notification.read
                              ? "bg-white"
                              : "bg-lavender-light/80 border-l-4 border-blue-500 pl-2.5 font-medium",
                            "hover:bg-gray-50"
                          )}
                        >
                          {notification.avatar ? (
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={notification.avatar}
                                alt="Avatar"
                              />
                              <AvatarFallback>
                                {getNotificationIcon(notification.type)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-lavender-light">
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}
                          <div className="flex-1 space-y-1">
                            <p
                              className={cn(
                                "text-sm",
                                !notification.read && "font-medium"
                              )}
                            >
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatTimeAgo(notification.timestamp)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
              {filteredNotifications.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t bg-white">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={markAllAsRead}
                      disabled={unreadCount === 0}
                    >
                      <CheckCheck className="h-4 w-4 mr-2" />
                      Marcar todo como leído
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={clearAllNotifications}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar todo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
}
