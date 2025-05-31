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
    category: "",
    image: "",
    publishDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Aquí iría la lógica para enviar los datos a la API
      console.log("Datos de la noticia:", formData);

      toast({
        title: "Noticia creada",
        description: "La noticia ha sido creada exitosamente.",
      });

      router.push("/admin/noticias");
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al crear la noticia.",
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
          <Label htmlFor="category">Categoría</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="publishDate">Fecha de Publicación</Label>
          <Input
            id="publishDate"
            type="datetime-local"
            value={formData.publishDate}
            onChange={(e) =>
              setFormData({ ...formData, publishDate: e.target.value })
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
