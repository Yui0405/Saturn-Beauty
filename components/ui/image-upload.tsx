"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "./input";
import { Label } from "./label";
import { toast } from "@/hooks/use-toast";
import { compressImage } from "@/lib/image-utils";

interface ImageUploadProps {
  label?: string;
  currentImage?: string;
  onImageUpload: (imageUrl: string) => void;
  className?: string;
  type: "news" | "tips" | string;
}

export function ImageUpload({
  label = "Imagen",
  currentImage = "/placeholder.jpg",
  onImageUpload,
  className = "",
  type,
}: ImageUploadProps) {
  const [previewImage, setPreviewImage] = useState(currentImage);

  const handleImageUpload = async (file: File) => {
    try {
      // Validaciones
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen no debe superar los 5MB",
          variant: "destructive",
        });
        return;
      }

      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Por favor sube una imagen en formato JPG, PNG o WebP",
          variant: "destructive",
        });
        return;
      }
      
      // Mostrar toast de compresión
      toast({
        title: "Procesando imagen",
        description: "Comprimiendo imagen para mejorar el rendimiento...",
      });

      // Comprimir imagen antes de subir
      const compressedFile = await compressImage(file, {
        maxSizeMB: 0.5, // Comprimir a máximo 500KB
        maxWidthOrHeight: 1200, // Limitar dimensiones
        useWebWorker: true, // Usar worker para no bloquear la interfaz
      });
      
      // Subir imagen comprimida
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("type", type);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al subir la imagen");
      }

      const { url } = await response.json();

      // Actualizar preview y notificar al componente padre
      setPreviewImage(url);
      onImageUpload(url);
      
      // Notificar éxito con información de compresión
      const compressionPercent = Math.round((1 - compressedFile.size / file.size) * 100);
      const originalSize = (file.size / 1024 / 1024).toFixed(2);
      const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
      
      toast({
        title: "Imagen subida exitosamente",
        description: `Tamaño original: ${originalSize}MB → Comprimido: ${compressedSize}MB (${compressionPercent}% reducción)`,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "No se pudo subir la imagen",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="image">{label}</Label>
      <div className="flex items-center space-x-4">
        <div className="relative w-32 h-32">
          <Image
            src={previewImage}
            alt="Preview"
            fill
            className="object-cover rounded-md"
          />
        </div>
        <Input
          id="image"
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={(e) =>
            e.target.files?.[0] && handleImageUpload(e.target.files[0])
          }
          className="max-w-xs"
        />
      </div>
    </div>
  );
}
