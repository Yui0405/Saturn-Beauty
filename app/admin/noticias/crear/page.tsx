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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="url">URL de la noticia</Label>
          <Input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) =>
              setFormData({ ...formData, url: e.target.value })
            }
            required
          />
        </div>



        <div>
          <Label htmlFor="content">Contenido</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            required
            className="min-h-[200px]"
          />
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
