"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { News } from "@/lib/api-service";
import Image from "next/image";
import { ImageUpload } from "@/components/ui/image-upload";

export default function NoticiasPage() {
  const [news, setNews] = useState<News[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<News | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/news");
        if (response.ok) {
          const data = await response.json();
          setNews(data);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las noticias",
          variant: "destructive",
        });
      }
    };

    fetchNews();
  }, []);

  const handleEdit = (newsItem: News) => {
    setFormData(newsItem);
    setEditingId(newsItem.id);
  };
  const handleSave = async (id: string) => {
    if (!formData) return;
    setIsLoading(true);

    // Optimistically update the UI
    const previousNews = [...news];
    setNews(news.map((item) => (item.id === id ? formData : item)));
    setEditingId(null);
    setFormData(null);

    try {
      const response = await fetch("/api/news", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error updating news");
      }

      toast({
        title: "Noticia actualizada",
        description: "Los cambios han sido guardados exitosamente.",
      });
    } catch (error) {
      // Revert to previous state on error
      setNews(previousNews);
      setEditingId(id);
      setFormData(formData);

      console.error("Error saving news:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la noticia",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-mint-green-dark mb-2">
          Gestionar Noticias
        </h1>
        <p className="text-gray-600">
          Edita las noticias que se muestran en la página principal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {news.map((item) => (
          <Card key={item.id} className="overflow-hidden bg-mint-green-light">
            {editingId === item.id ? (
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Título
                  </label>
                  <Input
                    value={formData?.title}
                    onChange={(e) =>
                      setFormData({ ...formData!, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Descripción
                  </label>
                  <Textarea
                    value={formData?.description}
                    onChange={(e) =>
                      setFormData({ ...formData!, description: e.target.value })
                    }
                    className="resize-none h-24"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    URL Original
                  </label>
                  <Input
                    value={formData?.originalUrl}
                    onChange={(e) =>
                      setFormData({ ...formData!, originalUrl: e.target.value })
                    }
                  />
                </div>

                <ImageUpload
                  label="Imagen"
                  currentImage={formData?.image || "/placeholder.jpg"}
                  onImageUpload={(url) =>
                    setFormData({ ...formData!, image: url })
                  }
                  type="news"
                />

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleSave(item.id)}
                    className="text-white bg-[#488d4f] hover:bg-accent-green hover:text-[#488d4f]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative h-48">
                  <Image
                    src={item.image || "/placeholder.jpg"}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-mint-green-dark">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {item.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <a
                      href={item.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="link"
                        className="text-mint-green-dark p-0 h-auto"
                      >
                        Ver original
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(item)}
                      className="text-[#488d4f] border-[#488d4f] hover:bg-[#488d4f] hover:text-white"
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
