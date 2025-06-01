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
    author: "",
  });
  const [errors, setErrors] = useState({
    title: "",
    content: "",
    author: "",
  });

  const validateForm = (): boolean => {
    const newErrors = {
      title: "",
      content: "",
      author: "",
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
    } else if (formData.content.length < 20) {
      newErrors.content = `El contenido debe tener al menos 20 caracteres (actual: ${formData.content.length})`;
      isValid = false;
    } else if (formData.content.length > 200) {
      newErrors.content = `El contenido debe tener máximo 200 caracteres (actual: ${formData.content.length})`;
      isValid = false;
    }

    // Validar autor
    if (!formData.author) {
      newErrors.author = "El autor es obligatorio";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario antes de procesar
    if (!validateForm()) {
      // Si hay errores, mostrar toast y detener el envío
      toast({
        title: "Error de validación",
        description: "Por favor, corrige los errores en el formulario",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Crear nuevo consejo con ID único
      const tipData = {
        id: String(Date.now()), // Generar ID único basado en timestamp
        ...formData,
        image: formData.image || "/placeholder.jpg",
      };

      // Obtener consejos existentes del localStorage
      const savedTipsRaw = localStorage.getItem('saturn-tips');
      let savedTips = [];
      
      if (savedTipsRaw) {
        const data = JSON.parse(savedTipsRaw);
        savedTips = data.tips || [];
      } else {
        // Si no hay datos en localStorage, intentar cargar del JSON
        try {
          const response = await fetch("/data/tips.json");
          if (response.ok) {
            const data = await response.json();
            // Convertir IDs numéricos a string
            savedTips = data.tips.map((tip: any) => ({
              ...tip,
              id: String(tip.id)
            }));
          }
        } catch (jsonError) {
          console.error("Error cargando consejos del JSON:", jsonError);
        }
      }

      // Añadir el nuevo consejo
      const updatedTips = [...savedTips, tipData];
      
      // Guardar en localStorage
      localStorage.setItem('saturn-tips', JSON.stringify({ tips: updatedTips }));

      toast({
        title: "¡Listo!",
        description: "El consejo ha sido creado exitosamente.",
      });

      router.push("/admin/consejos");
    } catch (error) {
      console.error("Error al crear el consejo:", error);
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
          <Label htmlFor="title">Título <span className="text-xs text-gray-500">(máx. 100 caracteres)</span></Label>
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
          <Label htmlFor="author">Autor</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => {
              setFormData({ ...formData, author: e.target.value });
              // Limpiar error si el usuario está corrigiendo
              if (errors.author && e.target.value) {
                setErrors({...errors, author: ""});
              }
            }}
            className={errors.author ? "border-red-500" : ""}
            required
          />
          {errors.author && (
            <p className="text-red-500 text-xs mt-1">{errors.author}</p>
          )}
        </div>
        <div>
          <Label htmlFor="content">Contenido <span className="text-xs text-gray-500">(entre 20 y 200 caracteres)</span></Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => {
              setFormData({ ...formData, content: e.target.value });
              // Limpiar error si el usuario está corrigiendo
              if (errors.content && e.target.value.length >= 20 && e.target.value.length <= 200) {
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
            <div className={`text-xs ${formData.content.length < 20 || formData.content.length > 200 ? "text-red-500" : "text-gray-500"}`}>
              {formData.content.length}/200 caracteres
            </div>
          </div>
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
