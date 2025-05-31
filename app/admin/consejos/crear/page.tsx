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
  "Cuidado de la piel",
  "Maquillaje",
  "Bienestar",
  "Rutina diaria",
];

export default function CreateTipPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    image: "",
    authorName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Aquí iría la lógica para enviar los datos a la API
      const tipData = {
        ...formData,
        image: formData.image || "/placeholder.jpg",
      };

      const response = await fetch("/api/tips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tipData),
      });

      if (!response.ok) {
        throw new Error("Error al crear el consejo");
      }

      toast({
        title: "Consejo creado",
        description: "El consejo ha sido creado exitosamente.",
      });

      router.push("/admin/consejos");
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al crear el consejo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminForm
      title="Crear Nuevo Consejo"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      backUrl="/admin/consejos"
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
          <Label htmlFor="authorName">Autor</Label>
          <Input
            id="authorName"
            value={formData.authorName}
            onChange={(e) =>
              setFormData({ ...formData, authorName: e.target.value })
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
          label="Imagen (opcional)"
          currentImage={formData.image || "/placeholder.jpg"}
          onImageUpload={(url) => setFormData({ ...formData, image: url })}
          type="tips"
        />
      </div>
    </AdminForm>
  );
}
