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

  const [touched, setTouched] = useState({
    name: false,
    description: false,
    rating: false,
    price: false,
    stock: false,
  });

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    rating: "",
    price: "",
    stock: "",
  });
  
  // Handle field blur
  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, formData[field as keyof typeof formData]);
    setErrors({ ...errors, [field]: error });
  };
  
  // Handle field change with validation
  const handleFieldChange = (field: string, value: any) => {
    // Update form data
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Only validate if the field has been touched
    if (touched[field as keyof typeof touched]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'El nombre del producto es obligatorio';
        if (/^\d/.test(value)) return 'El nombre no puede comenzar con un número';
        if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres';
        if (value.length > 100) return `El nombre debe tener máximo 100 caracteres (actual: ${value.length})`;
        return '';
        
      case 'description':
        if (!value.trim()) return 'La descripción es obligatoria';
        if (value.length < 10) return `La descripción debe tener al menos 10 caracteres (actual: ${value.length})`;
        if (value.length > 500) return `La descripción debe tener máximo 500 caracteres (actual: ${value.length})`;
        return '';
        
      case 'rating':
        if (isNaN(value) || value < 1 || value > 5) return 'La calificación debe estar entre 1 y 5';
        return '';
        
      case 'price':
        if (isNaN(value) || value <= 0) return 'El precio debe ser mayor a 0';
        if (value > 10000) return 'El precio no puede ser mayor a 10,000';
        return '';
        
      case 'stock':
        if (isNaN(value) || value < 0) return 'El stock no puede ser negativo';
        if (!Number.isInteger(Number(value))) return 'El stock debe ser un número entero';
        if (value > 10000) return 'El stock no puede ser mayor a 10,000';
        return '';
        
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: validateField('name', formData.name),
      description: validateField('description', formData.description),
      rating: validateField('rating', formData.rating),
      price: validateField('price', formData.price),
      stock: validateField('stock', formData.stock),
    };

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };
  const [previewImage, setPreviewImage] = useState("/images/placeholder.svg");

  // Mark all fields as touched when form is submitted
  const markAllAsTouched = () => {
    setTouched({
      name: true,
      description: true,
      rating: true,
      price: true,
      stock: true,
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to show all errors
    markAllAsTouched();
    
    // Validate all fields
    const isFormValid = validateForm();
    
    if (!isFormValid) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrige los errores en el formulario",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Cargar productos existentes desde localStorage o desde el JSON si no hay datos
      let existingProducts: Product[] = [];
      const cachedData = localStorage.getItem('saturn-products');
      
      if (cachedData) {
        existingProducts = JSON.parse(cachedData);
      } else {
        // Si no hay datos en localStorage, cargamos del JSON
        const response = await fetch("/data/products.json");
        if (!response.ok) throw new Error("Error cargando productos");
        const data = await response.json();
        existingProducts = data.products;
      }

      // Generar un ID único para el nuevo producto (usando timestamp)
      const newProduct: Product = {
        ...formData,
        id: `${Date.now()}`, // Convertimos a string para mantener consistencia con el formato del JSON
      };

      // Añadir el nuevo producto al array existente
      const updatedProducts = [...existingProducts, newProduct];
      
      // Guardar en localStorage
      localStorage.setItem('saturn-products', JSON.stringify(updatedProducts));

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
          <div>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              className={errors.name ? "border-red-500" : ""}
              maxLength={100}
            />
            <div className="flex justify-between mt-1">
              {errors.name ? (
                <p className="text-red-500 text-xs">{errors.name}</p>
              ) : (
                <span className="text-xs text-gray-500">
                  {formData.name.length}/100 caracteres
                </span>
              )}
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            className={`h-32 ${errors.description ? "border-red-500" : ""}`}
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? (
              <p className="text-red-500 text-xs">{errors.description}</p>
            ) : (
              <span className="text-xs text-gray-500">
                {formData.description.length}/500 caracteres
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rating">Calificación</Label>
          <Input
            id="rating"
            type="number"
            min="1"
            max="5"
            step="0.1"
            value={formData.rating}
            onChange={(e) => {
              const value = e.target.value;
              // Allow empty string for better UX when deleting
              if (value === '') {
                handleFieldChange('rating', '');
                return;
              }
              
              // Allow typing decimal points and numbers
              if (/^\d*\.?\d*$/.test(value)) {
                const numValue = parseFloat(value);
                // Only update if it's a valid number within range or in the process of typing
                if (isNaN(numValue) || (numValue >= 1 && numValue <= 5)) {
                  handleFieldChange('rating', value);
                }
              }
            }}
            onBlur={(e) => {
              const value = e.target.value;
              if (value === '') {
                handleFieldChange('rating', 5);
              } else {
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue < 1) {
                  handleFieldChange('rating', 1);
                } else if (numValue > 5) {
                  handleFieldChange('rating', 5);
                } else {
                  handleFieldChange('rating', parseFloat(Number(numValue).toFixed(1)));
                }
              }
              handleBlur('rating');
            }}
            className={errors.rating ? "border-red-500" : ""}
          />
          {errors.rating && (
            <p className="text-red-500 text-xs mt-1">{errors.rating}</p>
          )}
        </div>

        <div>
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleFieldChange('price', parseFloat(e.target.value) || 0)}
            onBlur={() => handleBlur('price')}
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && (
            <p className="text-red-500 text-xs mt-1">{errors.price}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="skinType">Tipo de Piel</Label>
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
            <Label htmlFor="category">Categoría</Label>
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
            value={formData.stock}
            onChange={(e) => handleFieldChange('stock', parseInt(e.target.value) || 0)}
            onBlur={() => handleBlur('stock')}
            className={errors.stock ? "border-red-500" : ""}
          />
          {errors.stock && (
            <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
          )}
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
