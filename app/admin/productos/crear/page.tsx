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
import { Product } from "@/lib/api-service";
import Image from "next/image";

const skinTypes = ["Todas", "Normal", "Seca", "Mixta", "Sensible", "Grasa"];
const categories = ["Cuidado", "Bienestar", "Maquillaje"];

export default function CreateProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    description: "",
    rating: 5,
    skinType: "Todas",
    category: categories[0],
    price: 0,
    stock: 0,
    image: "/placeholder.jpg",
    popularity: "Normal",
  });
  const [previewImage, setPreviewImage] = useState("/placeholder.jpg");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al crear el producto");
      }

      toast({
        title: "Éxito",
        description: "Producto creado correctamente",
      });

      router.push("/admin/productos");
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el producto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminForm
      title="Crear Nuevo Producto"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      backUrl="/admin/productos"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre del Producto</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
            className="h-32"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rating">Calificación</Label>
            <Input
              id="rating"
              type="number"
              min="0"
              max="5"
              step="1"
              value={formData.rating.toString()}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  rating: parseFloat(e.target.value || "0"),
                })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price.toString()}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseFloat(e.target.value || "0"),
                })
              }
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="skinType">Tipo de Piel</Label>{" "}
            <Select
              value={formData.skinType}
              onValueChange={(value) =>
                setFormData({ ...formData, skinType: value })
              }
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Seleccionar tipo de piel" />
              </SelectTrigger>
              <SelectContent className="w-full bg-white">
                {skinTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Categoría</Label>{" "}
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent className="w-full bg-white">
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="stock">Cantidad en Existencia</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={formData.stock.toString()}
            onChange={(e) =>
              setFormData({
                ...formData,
                stock: parseInt(e.target.value || "0"),
              })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="image">Imagen del Producto</Label>
          <div className="flex items-center space-x-4">
            <div className="relative w-32 h-32">
              <Image
                src={previewImage}
                alt="Preview"
                fill
                className="object-cover rounded"
              />
            </div>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Validate file size (max 5MB)
                  if (file.size > 5 * 1024 * 1024) {
                    toast({
                      title: "Error",
                      description: "La imagen no debe superar los 5MB",
                      variant: "destructive",
                    });
                    return;
                  }

                  // Validate file type
                  const validTypes = ["image/jpeg", "image/png", "image/webp"];
                  if (!validTypes.includes(file.type)) {
                    toast({
                      title: "Error",
                      description:
                        "Por favor sube una imagen en formato JPG, PNG o WebP",
                      variant: "destructive",
                    });
                    return;
                  }

                  // Create temporary preview URL
                  const previewUrl = URL.createObjectURL(file);
                  setPreviewImage(previewUrl);

                  // In a real app, we would upload the file to a server.
                  // For now, we'll just use the preview URL
                  setFormData((prev) => ({
                    ...prev,
                    image: previewUrl,
                  }));
                }
              }}
            />
          </div>
        </div>
      </div>
    </AdminForm>
  );
}
