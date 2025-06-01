"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminForm } from "@/components/ui/admin-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";

const categories = [
  "Tendencias",
  "Lanzamientos",
  "Eventos",
  "Promociones",
  "Tutoriales",
];

export default function CreateNewsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    url: "https://sonicteamargentina.blogspot.com/p/sonic-hedgehog-comics-en-espanol.html",
    image: "",
  });
  const [errors, setErrors] = useState({
    title: "",
    content: "",
    url: "",
  });

  const validateForm = (): boolean => {
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
      newErrors.title = `El título debe tener máximo 100 caracteres (actual: ${formData.title.length})`;
      isValid = false;
    }

    // Validar contenido
    if (!formData.content) {
      newErrors.content = "El contenido es obligatorio";
      isValid = false;
    } else if (formData.content.length < 50) {
      newErrors.content = `El contenido debe tener al menos 50 caracteres (actual: ${formData.content.length})`;
      isValid = false;
    } else if (formData.content.length > 400) {
      newErrors.content = `El contenido debe tener máximo 400 caracteres (actual: ${formData.content.length})`;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      // Obtener noticias existentes de localStorage o del JSON inicial
      const localNews = localStorage.getItem('saturn-news');
      const existingNews = localNews ? JSON.parse(localNews) : [];
      
      // Crear nueva noticia
      const newNews = {
        id: Date.now().toString(),
        title: formData.title,
        content: formData.content,
        url: formData.url,
        image: formData.image || "/images/placeholder.jpg"
      };

      // Actualizar la lista de noticias
      const updatedNews = [newNews, ...existingNews];
      
      // Guardar en localStorage
      localStorage.setItem('saturn-news', JSON.stringify(updatedNews));
      
      toast({
        title: "¡Noticia creada!",
        description: "La noticia ha sido creada correctamente (cambios locales).",
      });

      // Redirigir después de un breve retraso para que se vea el toast
      setTimeout(() => {
        router.push("/admin/noticias");
      }, 1000);
    } catch (error) {
      console.error("Error al crear la noticia:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la noticia. Los cambios no persisten después de recargar.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminForm
      title="Crear Nueva Noticia"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      backUrl="/admin/noticias"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              // Limpiar error si el usuario está corrigiendo
              if (errors.title && e.target.value) {
                setErrors({...errors, title: ""});
              }
            }}
            maxLength={100}
            className={errors.title ? "border-red-500" : ""}
            required
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formData.title.length}/100 caracteres
          </p>
        </div>

        <div>
          <Label htmlFor="url">URL de la noticia</Label>
          <Input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) => {
              setFormData({ ...formData, url: e.target.value });
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
            required
          />
          {errors.url && (
            <p className="text-red-500 text-xs mt-1">{errors.url}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Ejemplo: https://www.example.com/noticia
          </p>
        </div>



        <div>
          <Label htmlFor="content">Contenido</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => {
              setFormData({ ...formData, content: e.target.value });
              // Limpiar error si el usuario está corrigiendo
              if (errors.content && e.target.value.length >= 50 && e.target.value.length <= 400) {
                setErrors({...errors, content: ""});
              }
            }}
            required
            className={`min-h-[200px] ${errors.content ? "border-red-500" : ""}`}
          />
          <div className="flex justify-between">
            <div>
              {errors.content && (
                <p className="text-red-500 text-xs mt-1">{errors.content}</p>
              )}
            </div>
            <div className={`text-xs ${formData.content.length < 50 || formData.content.length > 400 ? "text-red-500" : "text-gray-500"}`}>
              {formData.content.length}/400 caracteres
            </div>
          </div>
        </div>

        <ImageUpload
          label="Imagen Principal"
          currentImage={formData.image || "/placeholder.jpg"}
          onImageUpload={(url) => setFormData({ ...formData, image: url })}
          type="news"
        />
      </div>
    </AdminForm>
  );
}
