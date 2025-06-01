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
  const [formData, setFormData] = useState<Partial<News> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    content: "",
    url: "",
  });

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Intentar cargar desde localStorage primero
        const savedNews = localStorage.getItem('saturn-news');
        
        if (savedNews) {
          const data = JSON.parse(savedNews);
          setNews(data.news || []);
        } else {
          // Si no hay datos guardados, cargar del archivo JSON
          const response = await fetch("/data/news.json");
          if (response.ok) {
            const data = await response.json();
            setNews(data.news);
          }
        }
      } catch (error) {
        console.error("Error cargando noticias:", error);
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
    setFormData({
      ...newsItem
    });
    setEditingId(newsItem.id);
    // Limpiar errores al editar
    setErrors({
      title: "",
      content: "",
      url: "",
    });
  };
  const validateForm = (): boolean => {
    if (!formData) return false;
    
    const newErrors = {
      title: "",
      content: "",
      url: "",
    };
    let isValid = true;

    // Validar título
    if (!formData.title) {
      newErrors.title = "El título es obligatorio";
      isValid = false;
    } else if (formData.title.length > 100) {
      newErrors.title = `El título debe tener máximo 100 caracteres (actual: ${formData.title?.length})`;
      isValid = false;
    }

    // Validar contenido
    if (!formData.content) {
      newErrors.content = "El contenido es obligatorio";
      isValid = false;
    } else if (formData.content.length < 50) {
      newErrors.content = `El contenido debe tener al menos 50 caracteres (actual: ${formData.content?.length})`;
      isValid = false;
    } else if (formData.content.length > 400) {
      newErrors.content = `El contenido debe tener máximo 400 caracteres (actual: ${formData.content?.length})`;
      isValid = false;
    }

    // Validar URL
    if (!formData.url) {
      newErrors.url = "La URL es obligatoria";
      isValid = false;
    } else {
      try {
        new URL(formData.url);
      } catch (e) {
        newErrors.url = "Por favor, introduce una URL válida";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };
  
  const handleSave = async (id: string) => {
    if (!formData) return;
    
    // Validar formulario antes de procesar
    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrige los errores en el formulario",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Actualizar la UI primero
      const updatedNews = news.map(item => 
        item.id === id ? { ...formData } as News : item
      );
      setNews(updatedNews);
      setEditingId(null);
      setFormData(null);

      // Guardar en localStorage
      localStorage.setItem('saturn-news', JSON.stringify({ news: updatedNews }));

      toast({
        title: "¡Listo!",
        description: "La noticia se ha actualizado correctamente.",
      });
    } catch (error) {
      console.error("Error al guardar la noticia:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la noticia. Los cambios no persisten después de recargar.",
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
                    onChange={(e) => {
                      setFormData({ ...formData!, title: e.target.value });
                      // Limpiar error si el usuario está corrigiendo
                      if (errors.title && e.target.value) {
                        setErrors({...errors, title: ""});
                      }
                    }}
                    maxLength={100}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData?.title?.length || 0}/100 caracteres
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Contenido
                  </label>
                  <Textarea
                    value={formData?.content || ''}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData!, 
                        content: e.target.value
                      });
                      // Limpiar error si el usuario está corrigiendo
                      if (errors.content && e.target.value.length >= 50 && e.target.value.length <= 400) {
                        setErrors({...errors, content: ""});
                      }
                    }}
                    className={`resize-none h-24 ${errors.content ? "border-red-500" : ""}`}
                  />
                  {errors.content && (
                    <p className="text-red-500 text-xs mt-1">{errors.content}</p>
                  )}
                  <div className="flex justify-between">
                    <p className="text-xs text-gray-500 mt-1">
                      Entre 50 y 400 caracteres
                    </p>
                    <p className={`text-xs mt-1 ${(formData?.content?.length || 0) < 50 || (formData?.content?.length || 0) > 400 ? "text-red-500" : "text-gray-500"}`}>
                      {formData?.content?.length || 0}/400
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    URL
                  </label>
                  <Input
                    value={formData?.url || ''}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData!, 
                        url: e.target.value
                      });
                      // Limpiar error si el usuario está corrigiendo
                      if (errors.url && e.target.value) {
                        try {
                          new URL(e.target.value);
                          setErrors({...errors, url: ""});
                        } catch (e) {
                          // No limpiar error si la URL sigue siendo inválida
                        }
                      }
                    }}
                    className={errors.url ? "border-red-500" : ""}
                  />
                  {errors.url && (
                    <p className="text-red-500 text-xs mt-1">{errors.url}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Ejemplo: https://www.example.com/noticia
                  </p>
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
                    {item.content}
                  </p>
                  <div className="flex justify-between items-center">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-mint-green-dark hover:underline"
                    >
                      <Button
                        variant="link"
                        className="text-mint-green-dark p-0 h-auto"
                      >
                        Ver noticia
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
